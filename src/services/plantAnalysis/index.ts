/**
 * Master Plant Health Analysis Pipeline
 * Implements the explicit architectural flow:
 * 
 * Image
 *  → Preprocessing
 *  → MobileNetV2-based model (Real TensorFlow.js inference)
 *  → Class Probabilities
 *  → Confidence Gate
 *  → Gemini Guidance Engine
 *  → Result
 */
import { preprocessPlantImage } from './preprocessor';
import { defaultMobileNetV2Classifier } from './classifier';
import { evaluateConfidenceGate } from './confidenceGate';
import { requestGeminiGuidance } from './geminiEngine';
import { PipelineInput, PlantAnalysisResult } from './types';

export * from './types';
export * from './preprocessor';
export * from './classifier';
export * from './confidenceGate';
export * from './geminiEngine';
export { mobileNetV2Service } from '../mobilenetClassifier';
export { PLANT_DISEASE_LABELS, getPlantDiseaseClassByIndex, getPlantDiseaseClassByLabel } from '../../config/plantDiseaseLabels';

export async function runPlantHealthPipeline(
  input: PipelineInput
): Promise<PlantAnalysisResult> {
  const { imageSource, language, onProgress } = input;

  // Stage 1: Preprocessing & Resolution Normalization
  onProgress?.('preprocessing', 15);
  const preprocessed = await preprocessPlantImage(imageSource);

  // Stage 2: Real MobileNetV2 Neural Network Inference & Feature Extraction
  onProgress?.('mobilenetv2_classification', 35);
  const classifierOutput = await defaultMobileNetV2Classifier.classify(preprocessed);

  // Stage 3 & 4: Class Probabilities & Confidence Gate
  onProgress?.('confidence_gate', 55);
  const gateDecision = evaluateConfidenceGate(classifierOutput, preprocessed);

  // Stage 5: Gemini Multimodal Guidance Engine
  onProgress?.('gemini_guidance_synthesis', 75);
  const result = await requestGeminiGuidance(
    preprocessed.originalDataUrl,
    language,
    classifierOutput,
    gateDecision
  );

  // Stage 6: Final Result Assembly
  onProgress?.('completed', 100);
  return result;
}
