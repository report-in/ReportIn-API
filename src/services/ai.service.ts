import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';
import fileType from 'file-type';
import { logger } from '../utils/logger';
import { IReport } from '../models/report.model';

// Singleton Model Loader
let cachedModel: mobilenet.MobileNet | null = null;

// Cache untuk features yang sudah dihitung
const featuresCache = new Map<string, tf.Tensor>();

// Batch processing configuration
const BATCH_SIZE = 10; // Process images in batches to avoid memory issues
const MAX_CONCURRENT = 5; // Limit concurrent operations

const getModel = async () => {
  if (!cachedModel) cachedModel = await mobilenet.load();
  return cachedModel;
};

// Optimized cosine similarity using TensorFlow operations
const cosineSimilarityBatch = (newFeatures: tf.Tensor, oldFeaturesBatch: tf.Tensor[]) => {
  return tf.tidy(() => {
    return oldFeaturesBatch.map(oldFeatures => {
      const dotProduct = tf.sum(tf.mul(newFeatures, oldFeatures));
      const normA = tf.norm(newFeatures);
      const normB = tf.norm(oldFeatures);
      const similarity = tf.div(dotProduct, tf.mul(normA, normB));
      return similarity.dataSync()[0];
    });
  });
};

// Optimized image preprocessing with resizing
const imageBufferToTensor = async (buffer: Buffer, targetSize = 224) => {
  try {
    const type = await fileType.fromBuffer(buffer);
    const mime = type ? type.mime : 'image/png';
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    const img = await loadImage(dataUrl);

    // Resize image to standard size for consistency and speed
    const canvas = createCanvas(targetSize, targetSize);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, targetSize, targetSize);

    return tf.browser.fromPixels(canvas as unknown as HTMLCanvasElement);
  } catch (error) {
    logger.error(`ERR: imageBufferToTensor() = ${error}`);
    throw error;
  }
};

const imageUrlToTensor = async (url: string, targetSize = 224) => {
  try {
    // Check cache first
    if (featuresCache.has(url)) {
      return null; // Will use cached features
    }

    const response = await fetch(url, {
      timeout: 10000, // 10 second timeout
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await imageBufferToTensor(buffer, targetSize);
  } catch (error) {
    logger.error(`ERR: imageUrlToTensor() = ${error}`);
    throw error;
  }
};

const getImageFeatures = async (tensor: tf.Tensor3D, model: mobilenet.MobileNet) => {
  return tf.tidy(() => {
    const features = model.infer(tensor, true) as tf.Tensor;
    return features.reshape([1024]);
  });
};

// Batch processing helper
const processBatch = async <T, R>(items: T[], processor: (item: T) => Promise<R>, batchSize: number): Promise<R[]> => {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item).catch(error => {
        logger.error(`Batch processing error: ${error}`);
        return null as R;
      }))
    );
    results.push(...batchResults.filter(result => result !== null));

    // Small delay between batches to prevent overwhelming the system
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  return results;
};

// Semaphore for controlling concurrency
class Semaphore {
  private permits: number;
  private tasks: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.tasks.push(resolve);
      }
    });
  }

  release(): void {
    this.permits++;
    if (this.tasks.length > 0) {
      const resolve = this.tasks.shift()!;
      this.permits--;
      resolve();
    }
  }
}

export const checkImageSimilarity = async (
  newImageBuffer: Buffer,
  reports: IReport[],
  threshold = 0.7
) => {
  const model = await getModel();
  const semaphore = new Semaphore(MAX_CONCURRENT);

  try {
    // Calculate new image features
    const newImageTensor = await imageBufferToTensor(newImageBuffer);
    const newFeatures = await getImageFeatures(newImageTensor, model);
    newImageTensor.dispose();

    // Flatten reports into a list of images with reportId
    const imagesWithReport = reports.flatMap(report =>
      report.complainant.flatMap(c =>
        c.image ? [{ reportId: report.id, personId: c.personId, imageUrl: c.image }] : []
      )
    );
    
    // Early termination if threshold is high - check a sample first
    if (threshold > 0.8 && imagesWithReport.length > 20) {
      const sampleSize = Math.min(5, imagesWithReport.length);
      const sample = imagesWithReport.slice(0, sampleSize);

      for (const { reportId, imageUrl } of sample) {
        try {
          await semaphore.acquire();

          let oldFeatures: tf.Tensor;
          if (featuresCache.has(imageUrl)) {
            oldFeatures = featuresCache.get(imageUrl)!;
          } else {
            const tensor = await imageUrlToTensor(imageUrl);
            if (tensor) {
              oldFeatures = await getImageFeatures(tensor, model);
              tensor.dispose();
              featuresCache.set(imageUrl, oldFeatures.clone());
            } else {
              continue;
            }
          }

          const similarities = cosineSimilarityBatch(newFeatures, [oldFeatures]);
          const similarity = similarities[0];

          if (similarity > threshold) {
            newFeatures.dispose();
            semaphore.release();
            return {
              similar: true,
              similarity,
              reportId,
              image: imageUrl
            };
          }

          semaphore.release();
        } catch (error) {
          semaphore.release();
          logger.error(`Error in sample check for ${imageUrl}: ${error}`);
        }
      }
    }

    // Process in batches with controlled concurrency
    const processImage = async ({ reportId, imageUrl }: { reportId: string; imageUrl: string }) => {
      await semaphore.acquire();

      try {
        let oldFeatures: tf.Tensor;

        if (featuresCache.has(imageUrl)) {
          oldFeatures = featuresCache.get(imageUrl)!;
        } else {
          const tensor = await imageUrlToTensor(imageUrl);
          if (!tensor) {
            semaphore.release();
            return { similarity: 0, reportId, imageUrl };
          }

          oldFeatures = await getImageFeatures(tensor, model);
          tensor.dispose();

          // Cache features for future use
          featuresCache.set(imageUrl, oldFeatures.clone());
        }

        const similarities = cosineSimilarityBatch(newFeatures, [oldFeatures]);
        const similarity = similarities[0];

        semaphore.release();
        return { similarity, reportId, imageUrl };

      } catch (error) {
        semaphore.release();
        logger.error(`Error processing image ${imageUrl}: ${error}`);
        return { similarity: 0, reportId, imageUrl };
      }
    };

    // Process all images in controlled batches
    const similarityResults = await processBatch(
      imagesWithReport,
      processImage,
      BATCH_SIZE
    );

    // Sort results by similarity (highest first) for early termination
    similarityResults.sort((a, b) => b.similarity - a.similarity);

    // Check for matches above threshold
    for (const result of similarityResults) {
      if (result.similarity > threshold) {
        newFeatures.dispose();
        return {
          similar: true,
          similarity: result.similarity,
          reportId: result.reportId,
          image: result.imageUrl
        };
      }
    }

    // Return best match if no threshold match found
    const bestMatch = similarityResults[0] || { similarity: 0, reportId: "", imageUrl: "" };
    newFeatures.dispose();

    return {
      similar: false,
      similarity: bestMatch.similarity,
      reportId: bestMatch.reportId,
      image: bestMatch.imageUrl
    };

  } catch (error) {
    logger.error(`Error in checkImageSimilarity: ${error}`);
    throw error;
  }
};

// Utility function to clear cache when needed
export const clearFeaturesCache = () => {
  featuresCache.forEach(tensor => tensor.dispose());
  featuresCache.clear();
};

// Utility function to get cache statistics
export const getCacheStats = () => {
  return {
    size: featuresCache.size,
    memoryUsage: featuresCache.size * 1024 * 4 // approximate bytes
  };
};