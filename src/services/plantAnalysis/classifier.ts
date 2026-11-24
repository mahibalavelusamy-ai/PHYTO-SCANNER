/**
 * MobileNetV2 Plant Health Classifier Integration
 * 
 * Executes real TensorFlow.js MobileNetV2 inference.
 * Replaces the previous manual image-feature heuristic with actual neural network inference:
 * 
 * 1. Invokes the MobileNetV2 service to run real tensor inference.
 * 2. Clearly distinguishes between the MobileNetV2 ImageNet backbone (feature extraction)
 *    and custom fine-tuned plant-disease classification weights.
 * 3. Never falsely maps standard ImageNet labels to specific plant pathologies.
 */
import { PreprocessedImageData, ClassifierOutput, ClassifierPrediction } from './types';
import { mobileNetV2Service, MobileNetInferenceResult } from '../mobilenetClassifier';

export interface IMobileNetV2Classifier {
  loadModel?(modelUrl: string): Promise<boolean>;
  classify(preprocessed: PreprocessedImageData): Promise<ClassifierOutput>;
}

export class MobileNetV2Classifier implements IMobileNetV2Classifier {
  private readonly confidenceThreshold = 0.60;

  /**
   * Hook for connecting our fine-tuned MobileNetV2 Plant Disease model graph and weights.
   * e.g., defaultMobileNetV2Classifier.loadModel('/models/plant_disease_mobilenetv2/model.json')
   */
  async loadModel(modelUrl: string): Promise<boolean> {
    return mobileNetV2Service.loadCustomPlantDiseaseModel(modelUrl);
  }

  /**
   * Runs actual TensorFlow.js MobileNetV2 inference on the 224x224 normalized image.
   */
  async classify(preprocessed: PreprocessedImageData): Promise<ClassifierOutput> {
    // Execute real MobileNetV2 inference
    const inferenceResult: MobileNetInferenceResult = await mobileNetV2Service.classify(
      preprocessed.normalizedDataUrl
    );

    const primaryPrediction: ClassifierPrediction = {
      className: inferenceResult.predictedClass,
      probability: inferenceResult.confidence,
      category: inferenceResult.isCustomPlantModelLoaded ? 'fungal' : 'general',
    };

    const topPredictions: ClassifierPrediction[] = inferenceResult.topPredictions.map((p) => ({
      className: p.className,
      probability: p.probability,
      category: inferenceResult.isCustomPlantModelLoaded ? 'fungal' : 'general',
    }));

    const isConfident = inferenceResult.confidence >= this.confidenceThreshold;

    return {
      primaryPrediction,
      topPredictions,
      isConfident,
      featureVectorLength: inferenceResult.featureVectorLength,
      modelName: inferenceResult.isCustomPlantModelLoaded
        ? 'MobileNetV2-Custom-PlantVillage-FineTuned'
        : 'MobileNetV2-ImageNet-Backbone',
      modelType: inferenceResult.modelType,
      isCustomPlantModelLoaded: inferenceResult.isCustomPlantModelLoaded,
      inferenceTimeMs: inferenceResult.inferenceTimeMs,
      isBotanicalSubjectLikely: inferenceResult.isBotanicalSubjectLikely,
      modelStatusNotes: inferenceResult.modelStatus.notes,
    };
  }
}

export const defaultMobileNetV2Classifier = new MobileNetV2Classifier();
