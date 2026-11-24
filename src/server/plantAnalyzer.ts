import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export interface AnalyzePlantRequest {
  imageBase64: string; // base64 string without data URL prefix or with it
  mimeType?: string;
  language?: 'en' | 'ta';
  classifierContext?: {
    candidateClass?: string;
    classifierConfidence?: number;
    modelType?: string;
    isCustomPlantModelLoaded?: boolean;
    featureVectorLength?: number;
    notes?: string;
    confidenceTier?: string;
  };
}

export interface PlantAnalysisResponse {
  condition: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'None' | 'Unknown' | string;
  observations: string[];
  possibleCauses: string[];
  recommendedActions: string[];
  prevention: string[];
  uncertaintyNote: string;
}

export async function analyzePlantLeafWithGemini(
  reqData: AnalyzePlantRequest
): Promise<PlantAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean base64 data
  let rawBase64 = reqData.imageBase64;
  let detectedMime = reqData.mimeType || 'image/jpeg';
  if (rawBase64.includes(';base64,')) {
    const parts = rawBase64.split(';base64,');
    detectedMime = parts[0].replace('data:', '') || detectedMime;
    rawBase64 = parts[1];
  }

  const language = reqData.language === 'ta' ? 'Tamil' : 'English';

  let classifierInfo = 'No preliminary classifier priors available.';
  if (reqData.classifierContext) {
    const {
      candidateClass,
      classifierConfidence,
      isCustomPlantModelLoaded,
      featureVectorLength,
      notes,
    } = reqData.classifierContext;

    if (isCustomPlantModelLoaded) {
      classifierInfo = `MobileNetV2 Fine-Tuned Plant Pathology Model output: Predicted condition candidate: "${candidateClass}" with ${Math.round((classifierConfidence || 0) * 100)}% probability (1280-dim feature vector). Gate status: ${notes || 'Normal'}. Verify leaf symptoms visually and generate comprehensive guidance.`;
    } else {
      classifierInfo = `MobileNetV2 Backbone Inference (TensorFlow.js, 1280-dim feature vector, feature length: ${featureVectorLength || 1280}): Top backbone prediction: "${candidateClass}" (${Math.round((classifierConfidence || 0) * 100)}% confidence). Standard ImageNet MobileNetV2 is an image feature/backbone classifier, not a plant-disease classifier. Fine-tuned plant pathology weights are pending connection. Gate evaluation: ${notes || 'Proceed with visual synthesis'}. Visually inspect the leaf for symptoms, identify the plant health condition, and provide first-level guidance.`;
    }
  }

  const systemInstruction = `You are PhytoScan, an expert first-level agricultural plant-health and leaf diagnosis assistant developed for the AGRIMIND team.
Your role is to interpret the plant leaf photograph along with the real MobileNetV2 classifier backbone telemetry to provide an understandable, honest, and actionable plant-health assessment.

CRITICAL DIAGNOSTIC GUIDELINES:
1. Treat your output as FIRST-LEVEL ASSISTANCE, not a definitive professional laboratory diagnosis.
2. DO NOT force a diagnosis if the image is blurry, out of focus, lacks a clear leaf, has poor lighting, or is ambiguous.
3. If image quality is insufficient, explicitly state this in "observations" and "uncertaintyNote", set "condition" to "Inconclusive / Insufficient Image Quality" (or Tamil equivalent), set "confidence" low (e.g. 15-35%), and recommend retaking with good lighting.
4. DO NOT invent certainty. If confidence is below 60%, recommend retaking the photo or consulting a local agricultural extension officer / KVK expert.
5. If the leaf appears healthy with no visible disease spots, blights, or pests, identify it as "Healthy Plant / No Apparent Disease", with severity "None".
6. Target Language: Output ALL text fields strictly in ${language}.
   ${language === 'Tamil' ? '- Use simple, natural, spoken agricultural Tamil (தமிழ்) that Tamil Nadu farmers and garden growers with limited technical literacy can easily understand. For example: "தக்காளி இலை கருகல் நோய்" (Early Blight), "பாதிப்பு நிலை: மிதமானது", "வேப்ப எண்ணெய் தெளித்தல்" (Neem oil spray), etc.' : '- Use clear, accessible, practical English.'}

OUTPUT FORMAT:
Respond with ONLY a valid, parseable JSON object matching this exact schema:
{
  "condition": "Name of the plant condition or disease (e.g., Tomato Early Blight, Healthy Leaf, Citrus Canker, Powdery Mildew, etc.)",
  "confidence": 88, // Integer number between 0 and 100
  "severity": "Mild | Moderate | Severe | None | Unknown",
  "observations": [
    "Specific visual symptom 1 seen on the leaf (e.g., concentric dark rings on lower leaves, yellow halos)",
    "Specific visual symptom 2"
  ],
  "possibleCauses": [
    "Underlying cause 1 (e.g., Alternaria solani fungal spores favored by warm, humid weather)",
    "Underlying cause 2"
  ],
  "recommendedActions": [
    "Immediate practical action 1 (e.g., Prune and destroy infected lower leaves immediately)",
    "Immediate practical action 2 (e.g., Apply copper fungicide or neem oil solution early morning)"
  ],
  "prevention": [
    "Long-term prevention method 1 (e.g., Drip irrigation instead of overhead watering)",
    "Long-term prevention method 2 (e.g., Crop rotation with non-solanaceous crops)"
  ],
  "uncertaintyNote": "Safety & guidance note stating that this is an AI assessment and advising consultation with local agricultural extension if symptoms persist."
}`;

  const promptText = `Please analyze this leaf photograph for plant diseases, nutrient deficiencies, or pests.
${classifierInfo}
Provide the diagnostic assessment strictly according to the required JSON schema in ${language}.`;

  let lastError: any = null;
  let responseText = '';

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: detectedMime,
                  data: rawBase64,
                },
              },
              { text: promptText },
            ],
          },
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      responseText = response.text?.trim() || '{}';
      if (responseText) break;
    } catch (err: any) {
      lastError = err;
      const isTransient = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('demand');
      if (isTransient && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  
  try {
    const parsed = JSON.parse(responseText) as PlantAnalysisResponse;
    // Ensure all required fields exist
    return {
      condition: parsed.condition || (language === 'Tamil' ? 'தெரியாத நிலை' : 'Unknown Condition'),
      confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.confidence))) : 75,
      severity: parsed.severity || 'Moderate',
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
      possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [],
      uncertaintyNote: parsed.uncertaintyNote || (
        language === 'Tamil'
          ? 'இது முதற்கட்ட AI வழிகாட்டல் மட்டுமே. துல்லியமான உறுதிப்படுத்தலுக்கு உங்கள் அருகிலுள்ள வேளாண் விரிவாக்க மையத்தை அணுகவும்.'
          : 'This is a first-level AI health assessment. Consult your local agricultural extension service for definitive confirmation.'
      ),
    };
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON response:', responseText, parseErr);
    throw new Error('AI returned an unparseable response. Please retry.');
  }
}
