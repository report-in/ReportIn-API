import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';
import fetch from 'node-fetch';
import { IReport } from '../models/report.model';
import { logger } from '../utils/logger';

// Singleton model
let cachedModel: mobilenet.MobileNet | null = null;

const getModel = async () => {
  if (!cachedModel) cachedModel = await mobilenet.load();
  return cachedModel;
};

// Cosine similarity
const cosineSimilarity = (a: tf.Tensor, b: tf.Tensor) => {
  const dot = a.dot(b).dataSync()[0];
  const normA = a.norm().dataSync()[0];
  const normB = b.norm().dataSync()[0];
  return dot / (normA * normB);
};

// Convert image buffer to tensor
const imageBufferToTensor = (buffer: Buffer): tf.Tensor3D => {
  const tensor = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;
  return tensor;
};

// Convert image URL to tensor
const imageUrlToTensor = async (url: string): Promise<tf.Tensor3D> => {
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return imageBufferToTensor(buffer);
  } catch (err) {
    logger.error(`Error fetching image ${url}: ${err}`);
    throw err;
  }
};

// Extract MobileNet features
const getImageFeatures = async (tensor: tf.Tensor3D, model: mobilenet.MobileNet) => {
  const features = model.infer(tensor, true) as tf.Tensor;
  const reshaped = features.reshape([1024]);
  features.dispose();
  return reshaped;
};

export const checkImageSimilarity = async (
  newImageBuffer: Buffer,
  reports: IReport[],
  threshold = 0.7
) => {
  const model = await getModel();

  // New image features
  const newTensor = imageBufferToTensor(newImageBuffer);
  const newFeatures = await getImageFeatures(newTensor, model);
  newTensor.dispose();

  let maxSimilarity = 0;
  let matchedReportId = '';
  let matchedImageUrl = '';

  // Flatten reports to images
  const imagesWithReport = reports.flatMap(report =>
    report.image.map(imageUrl => ({ reportId: report.id, imageUrl }))
  );

  // Parallel processing
  const results = await Promise.all(
    imagesWithReport.map(async ({ reportId, imageUrl }) => {
      try {
        const tensor = await imageUrlToTensor(imageUrl);
        const features = await getImageFeatures(tensor, model);
        tensor.dispose();

        const similarity = cosineSimilarity(newFeatures, features);
        features.dispose();

        return { similarity, reportId, imageUrl };
      } catch (err) {
        logger.error(`Error processing image ${imageUrl}: ${err}`);
        return { similarity: 0, reportId, imageUrl };
      }
    })
  );

  newFeatures.dispose();

  for (const r of results) {
    if (r.similarity > threshold) {
      return { similar: true, similarity: r.similarity, reportId: r.reportId, image: r.imageUrl };
    }
    if (r.similarity > maxSimilarity) {
      maxSimilarity = r.similarity;
      matchedReportId = r.reportId;
      matchedImageUrl = r.imageUrl;
    }
  }

  return { similar: false, similarity: maxSimilarity, reportId: matchedReportId, image: matchedImageUrl };
};