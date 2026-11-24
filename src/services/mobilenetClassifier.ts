/**
 * MobileNetV2 Real Inference & Feature Backbone Module
 * 
 * Implements real browser-based TensorFlow.js MobileNetV2 execution:
 * 1. Loads MobileNetV2 once and caches the model singleton.
 * 2. Preprocesses input image into 224x224 float tensors.
 * 3. Runs actual TensorFlow.js inference for feature extraction & classification.
 * 4. Provides a decoupled slot for plugging in fine-tuned Plant-Disease MobileNetV2 weights (e.g., PlantVillage).
 * 
 * IMPORTANT: Standard ImageNet MobileNetV2 is an object/botanical classifier, NOT a fine-tuned
 * plant disease model. Standard ImageNet predictions are never falsely claimed to be specific plant diseases.
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { PLANT_DISEASE_LABELS, PlantDiseaseClassDef } from '../config/plantDiseaseLabels';

export interface MobileNetPrediction {
  className: string;
  probability: number;
}

export interface MobileNetInferenceResult {
  modelType: 'mobilenet-v2-imagenet-backbone' | 'mobilenet-v2-fine-tuned-plant-disease';
  isCustomPlantModelLoaded: boolean;
  predictedClass: string;
  confidence: number; // 0.0 to 1.0
  topPredictions: MobileNetPrediction[];
  featureVectorLength: number; // 1280 dimensions for MobileNetV2
  inferenceTimeMs: number;
  isBotanicalSubjectLikely: boolean;
  modelStatus: {
    backboneLoaded: boolean;
    customModelHookActive: boolean;
    customModelUrl?: string;
    backend: string;
    notes: string;
  };
}

export class MobileNetV2Service {
  private static instance: MobileNetV2Service | null = null;
  
  private backboneModel: mobilenet.MobileNet | null = null;
  private customPlantModel: tf.LayersModel | tf.GraphModel | null = null;
  private customModelUrl: string | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): MobileNetV2Service {
    if (!MobileNetV2Service.instance) {
      MobileNetV2Service.instance = new MobileNetV2Service();
    }
    return MobileNetV2Service.instance;
  }

  /**
   * Initializes TensorFlow.js and loads MobileNetV2 backbone once.
   */
  public async init(): Promise<void> {
    if (this.backboneModel) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        await tf.ready();
        console.log(`[PhytoScan MobileNetV2] TensorFlow.js backend initialized: ${tf.getBackend()}`);
        
        // Load standard MobileNetV2 with version 2 and alpha 1.0
        this.backboneModel = await mobilenet.load({
          version: 2,
          alpha: 1.0,
        });
        console.log('[PhytoScan MobileNetV2] MobileNetV2 backbone loaded and cached.');
      } catch (err) {
        console.error('[PhytoScan MobileNetV2] Failed to initialize MobileNetV2 model:', err);
        throw new Error('Could not load MobileNetV2 inference engine in browser.');
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Slot to connect our fine-tuned MobileNetV2 Plant Disease model.
   * e.g., service.loadCustomPlantDiseaseModel('/models/plant_disease_mobilenetv2/model.json')
   */
  public async loadCustomPlantDiseaseModel(modelUrl: string): Promise<boolean> {
    try {
      console.log(`[PhytoScan MobileNetV2] Connecting custom plant disease model from: ${modelUrl}`);
      await tf.ready();
      try {
        this.customPlantModel = await tf.loadLayersModel(modelUrl);
      } catch {
        this.customPlantModel = await tf.loadGraphModel(modelUrl);
      }
      this.customModelUrl = modelUrl;
      console.log('[PhytoScan MobileNetV2] Fine-tuned plant disease model loaded successfully.');
      return true;
    } catch (err) {
      console.warn(`[PhytoScan MobileNetV2] Custom model not found or failed to load from ${modelUrl}. Using MobileNetV2 backbone:`, err);
      this.customPlantModel = null;
      return false;
    }
  }

  /**
   * Converts an image source (data URL, image element, or canvas) into an HTMLImageElement
   */
  private async resolveImageElement(imageSource: string | HTMLImageElement | HTMLCanvasElement): Promise<HTMLImageElement> {
    if (imageSource instanceof HTMLImageElement && imageSource.complete) {
      return imageSource;
    }

    if (imageSource instanceof HTMLCanvasElement) {
      const img = new Image();
      img.src = imageSource.toDataURL();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      return img;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSource as string;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for MobileNetV2 inference.'));
    });
    return img;
  }

  /**
   * Runs actual TensorFlow.js MobileNetV2 inference on the image.
   */
  public async classify(
    imageSource: string | HTMLImageElement | HTMLCanvasElement
  ): Promise<MobileNetInferenceResult> {
    await this.init();
    if (!this.backboneModel) {
      throw new Error('MobileNetV2 backbone model is not ready.');
    }

    const imgElement = await this.resolveImageElement(imageSource);
    const startTime = performance.now();

    // 1. If a fine-tuned MobileNetV2 plant disease model is loaded, execute custom disease inference
    if (this.customPlantModel) {
      return this.inferWithCustomDiseaseModel(imgElement, startTime);
    }

    // 2. Otherwise run actual MobileNetV2 backbone feature extraction & classification
    return this.inferWithMobileNetBackbone(imgElement, startTime);
  }

  /**
   * Inference via standard MobileNetV2 backbone (ImageNet weights + 1280-dim feature vector)
   */
  private async inferWithMobileNetBackbone(
    imgElement: HTMLImageElement,
    startTime: number
  ): Promise<MobileNetInferenceResult> {
    const rawPredictions = await this.backboneModel!.classify(imgElement, 5);

    // Extract feature vector representation (MobileNetV2 bottleneck features)
    let featureVectorLength = 1280;
    try {
      tf.tidy(() => {
        const features = this.backboneModel!.infer(imgElement, true);
        const shape = features.shape;
        if (shape && shape.length > 0) {
          featureVectorLength = shape[shape.length - 1] || 1280;
        }
      });
    } catch (e) {
      console.warn('[PhytoScan MobileNetV2] Feature vector extraction note:', e);
    }

    const inferenceTimeMs = Math.round(performance.now() - startTime);

    const topPredictions: MobileNetPrediction[] = rawPredictions.map((p) => ({
      className: p.className,
      probability: Number(p.probability.toFixed(3)),
    }));

    const primary = topPredictions[0] || { className: 'Unknown', probability: 0.0 };

    // Botanical / plant presence detection heuristics in ImageNet labels (e.g. leaf, pot, plant, daisy, ear of corn)
    const botanicalKeywords = [
      'leaf', 'plant', 'tree', 'flower', 'fruit', 'pot', 'vase', 'daisy',
      'sunflower', 'rose', 'cucumber', 'zucchini', 'corn', 'ear', 'lemon',
      'orange', 'bell pepper', 'pomegranate', 'acorn', 'rapeseed', 'grass'
    ];
    
    const combinedClasses = topPredictions.map(p => p.className.toLowerCase()).join(' ');
    const isBotanicalSubjectLikely = botanicalKeywords.some(kw => combinedClasses.includes(kw));

    return {
      modelType: 'mobilenet-v2-imagenet-backbone',
      isCustomPlantModelLoaded: false,
      predictedClass: primary.className,
      confidence: primary.probability,
      topPredictions,
      featureVectorLength,
      inferenceTimeMs: Math.max(15, inferenceTimeMs),
      isBotanicalSubjectLikely,
      modelStatus: {
        backboneLoaded: true,
        customModelHookActive: false,
        customModelUrl: undefined,
        backend: tf.getBackend() || 'webgl',
        notes: 'MobileNetV2 backbone image feature extraction active. Fine-tuned plant disease weights pending connection.',
      },
    };
  }

  /**
   * Inference via custom fine-tuned Plant-Disease MobileNetV2 model
   */
  private async inferWithCustomDiseaseModel(
    imgElement: HTMLImageElement,
    startTime: number
  ): Promise<MobileNetInferenceResult> {
    const predictions = tf.tidy(() => {
      // MobileNetV2 input preprocessing: 224x224 RGB, normalized to [-1, 1]
      const tensor = tf.browser
        .fromPixels(imgElement)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(127.5)
        .sub(1.0)
        .expandDims(0);

      const outputTensor = (this.customPlantModel as any).predict(tensor) as tf.Tensor;
      return Array.from(outputTensor.dataSync());
    });

    const inferenceTimeMs = Math.round(performance.now() - startTime);

    // Map probabilities to PLANT_DISEASE_LABELS
    const scored = predictions.map((prob, idx) => {
      const labelDef: PlantDiseaseClassDef | undefined = PLANT_DISEASE_LABELS[idx];
      return {
        className: labelDef ? labelDef.commonNameEn : `Plant Disease Class #${idx}`,
        probability: Number(prob.toFixed(3)),
      };
    });

    scored.sort((a, b) => b.probability - a.probability);
    const topPredictions = scored.slice(0, 5);
    const primary = topPredictions[0] || { className: 'Unknown Disease', probability: 0.0 };

    return {
      modelType: 'mobilenet-v2-fine-tuned-plant-disease',
      isCustomPlantModelLoaded: true,
      predictedClass: primary.className,
      confidence: primary.probability,
      topPredictions,
      featureVectorLength: 1280,
      inferenceTimeMs: Math.max(15, inferenceTimeMs),
      isBotanicalSubjectLikely: true,
      modelStatus: {
        backboneLoaded: true,
        customModelHookActive: true,
        customModelUrl: this.customModelUrl || undefined,
        backend: tf.getBackend() || 'webgl',
        notes: 'Fine-tuned MobileNetV2 plant disease model active.',
      },
    };
  }
}

export const mobileNetV2Service = MobileNetV2Service.getInstance();
