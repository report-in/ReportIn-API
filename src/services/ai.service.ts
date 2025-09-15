import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';
import fileType from 'file-type';
import { logger } from '../utils/logger';
import { IReport } from '../models/report.model';

// Singleton Model Loader
let cachedModel: mobilenet.MobileNet | null = null;

const getModel = async () => {
  if (!cachedModel) cachedModel = await mobilenet.load();
  return cachedModel;
};

// Cosine similarity function
const cosineSimilarity = (a: tf.Tensor, b: tf.Tensor) => {
  const dotProduct = a.dot(b).dataSync()[0];
  const normA = a.norm().dataSync()[0];
  const normB = b.norm().dataSync()[0];
  return dotProduct / (normA * normB);
};

// Convert buffer to Tensor
const imageBufferToTensor = async (buffer: Buffer) => {
  try {
    const type = await fileType.fromBuffer(buffer);
    const mime = type ? type.mime : 'image/png';
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    const img = await loadImage(dataUrl);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return tf.browser.fromPixels(canvas as unknown as HTMLCanvasElement);
  } catch (error) {
    logger.error(`ERR: imageBufferToTensor() = ${error}`);
    throw error;
  }
};

// Convert URL to Tensor
const imageUrlToTensor = async (url: string) => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await imageBufferToTensor(buffer);
  } catch (error) {
    logger.error(`ERR: imageUrlToTensor() = ${error}`);
    throw error;
  }
};

// Get image features from tensor
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

  // Calculate new image features
  const newImageTensor = await imageBufferToTensor(newImageBuffer);
  const newFeatures = await getImageFeatures(newImageTensor, model);
  newImageTensor.dispose();

  let maxSimilarity = 0;
  let matchedReportId = "";
  let matchedImageUrl = "";

  // Flatten reports into a list of images with reportId
  const imagesWithReport = reports.flatMap(report =>
    report.image.map(imageUrl => ({ reportId: report.id, imageUrl }))
  );

  // Parallel processing of images
  const similarityResults = await Promise.all(imagesWithReport.map(async ({ reportId, imageUrl }) => {
    try {
      const tensor = await imageUrlToTensor(imageUrl);
      const oldFeatures = await getImageFeatures(tensor, model);
      tensor.dispose();

      const similarity = cosineSimilarity(newFeatures, oldFeatures);
      oldFeatures.dispose();

      return { similarity, reportId, imageUrl };
    } catch (error) {
      logger.error(`Error processing image ${imageUrl}: ${error}`);
      return { similarity: 0, reportId, imageUrl };
    }
  }));

  newFeatures.dispose();

  // Evaluate similarity results
  for (const result of similarityResults) {
    if (result.similarity > threshold) {
      return { similar: true, similarity: result.similarity, reportId: result.reportId, image: result.imageUrl };
    }
    if (result.similarity > maxSimilarity) {
      maxSimilarity = result.similarity;
      matchedReportId = result.reportId;
      matchedImageUrl = result.imageUrl;
    }
  }

  return { similar: false, similarity: maxSimilarity, reportId: matchedReportId, image: matchedImageUrl };
};