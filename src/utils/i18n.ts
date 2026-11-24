export type Language = 'en' | 'ta';

export interface Translations {
  tagline: string;
  navHome: string;
  navHistory: string;
  navArchitecture: string;
  heroTitle: string;
  heroSubtitle: string;
  takePhoto: string;
  uploadImage: string;
  bestResultsNote: string;
  trySampleLeaves: string;
  selectedImage: string;
  removeReselect: string;
  analyzePlant: string;
  analyzingPlant: string;
  resultsTitle: string;
  possibleCondition: string;
  confidence: string;
  severity: string;
  whatWeObserved: string;
  possibleCauses: string;
  whatYouCanDo: string;
  prevention: string;
  safetyNoteTitle: string;
  savedToHistory: string;
  savingToHistory: string;
  scanAnotherPlant: string;
  historyTitle: string;
  historySubtitle: string;
  noScansYet: string;
  noScansSubtext: string;
  viewCompleteAnalysis: string;
  deleteScan: string;
  close: string;
  cameraTitle: string;
  capturePhoto: string;
  switchCamera: string;
  cancel: string;
  cameraPermissionError: string;
  signIn: string;
  signOut: string;
  guestUser: string;
  pipelineInfoTitle: string;
  pipelineBadge: string;
  severityMild: string;
  severityModerate: string;
  severitySevere: string;
  severityNone: string;
  severityUnknown: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    tagline: 'Scan. Diagnose. Act early.',
    navHome: 'Home',
    navHistory: 'Scan History',
    navArchitecture: 'AI Pipeline',
    heroTitle: "Understand what's wrong with your plant.",
    heroSubtitle:
      'Take a clear photo of a leaf and get an AI-assisted plant-health assessment with practical next steps.',
    takePhoto: 'Take Photo',
    uploadImage: 'Upload Image',
    bestResultsNote:
      'For best results, use a clear, well-lit photograph of the affected leaf.',
    trySampleLeaves: 'Or try sample diseased leaves:',
    selectedImage: 'Selected Leaf Photograph',
    removeReselect: 'Remove / Change Photo',
    analyzePlant: 'Analyze Plant Leaf',
    analyzingPlant: 'Analyzing Leaf Symptoms...',
    resultsTitle: 'Plant Health Result',
    possibleCondition: 'Possible Condition',
    confidence: 'Confidence',
    severity: 'Severity',
    whatWeObserved: 'What the AI observed',
    possibleCauses: 'Possible Causes',
    whatYouCanDo: 'What you can do (Recommended Actions)',
    prevention: 'Prevention Regimen',
    safetyNoteTitle: 'First-Level Guidance & Uncertainty Note',
    savedToHistory: 'Saved to Scan History',
    savingToHistory: 'Saving to Firebase...',
    scanAnotherPlant: 'Scan Another Plant',
    historyTitle: 'Your Scan History',
    historySubtitle:
      'All previous plant-health assessments securely stored in Firestore.',
    noScansYet: 'No previous scans found',
    noScansSubtext:
      'Take or upload a photo of an affected leaf to start diagnosing plant health.',
    viewCompleteAnalysis: 'View Complete Analysis',
    deleteScan: 'Delete',
    close: 'Close',
    cameraTitle: 'Take Plant Leaf Photo',
    capturePhoto: 'Capture Photo',
    switchCamera: 'Switch Camera',
    cancel: 'Cancel',
    cameraPermissionError:
      'Camera access was denied or is not supported. Please upload an image file instead.',
    signIn: 'Sign In / Account',
    signOut: 'Sign Out',
    guestUser: 'Guest Farmer',
    pipelineInfoTitle: 'Modular MobileNetV2 + Gemini Architecture',
    pipelineBadge: 'MobileNetV2 + Gemini Pipeline',
    severityMild: 'Mild',
    severityModerate: 'Moderate',
    severitySevere: 'Severe',
    severityNone: 'Healthy (None)',
    severityUnknown: 'Uncertain',
  },
  ta: {
    tagline: 'ஸ்கேன் செய்க. கண்டறிக. உடனே தீர்வு காண்க.',
    navHome: 'முகப்பு',
    navHistory: 'முந்தைய ஸ்கேன்கள்',
    navArchitecture: 'AI கட்டமைப்பு',
    heroTitle: 'உங்கள் பயிருக்கு என்ன பிரச்சனை என்பதை அறிந்து கொள்ளுங்கள்.',
    heroSubtitle:
      'பாதிக்கப்பட்ட இலையின் தெளிவான படத்தை எடுத்து, உடனடி AI ஆலோசனை மற்றும் எளிய நடைமுறைத் தீர்வு முறைகளைப் பெறுங்கள்.',
    takePhoto: 'புகைப்படம் எடுங்கள்',
    uploadImage: 'படம் பதிவேற்றவும்',
    bestResultsNote:
      'சிறந்த முடிவுக்கு, பாதிக்கப்பட்ட இலையை நல்ல வெளிச்சத்தில் தெளிவாக புகைப்படம் எடுக்கவும்.',
    trySampleLeaves: 'மாதிரி இலைகளை சோதிக்க:',
    selectedImage: 'தேர்ந்தெடுக்கப்பட்ட இலை புகைப்படம்',
    removeReselect: 'மாற்றுக / நீக்குக',
    analyzePlant: 'பயிரை ஆய்வு செய்க',
    analyzingPlant: 'இலை அறிகுறிகள் ஆய்வு செய்யப்படுகிறது...',
    resultsTitle: 'பயிர் சுகாதார ஆய்வு முடிவு',
    possibleCondition: 'உத்தேச பாதிப்பு / நோய்',
    confidence: 'நம்பிக்கை அளவு',
    severity: 'பாதிப்பு நிலை',
    whatWeObserved: 'AI கவனித்த அறிகுறிகள்',
    possibleCauses: 'சாத்தியமான காரணங்கள்',
    whatYouCanDo: 'நீங்கள் செய்ய வேண்டியவை (உடனடி தீர்வுகள்)',
    prevention: 'எதிர்கால தடுப்பு முறைகள்',
    safetyNoteTitle: 'பாதுகாப்பு & முதற்கட்ட வழிகாட்டல் குறிப்பு',
    savedToHistory: 'வரலாற்றில் சேமிக்கப்பட்டது',
    savingToHistory: 'Firebase-ல் சேமிக்கப்படுகிறது...',
    scanAnotherPlant: 'மற்றொரு பயிரை ஸ்கேன் செய்க',
    historyTitle: 'உங்கள் முந்தைய ஸ்கேன்கள்',
    historySubtitle:
      'Firestore தரவுத்தளத்தில் பாதுகாப்பாக சேமிக்கப்பட்ட முந்தைய பயிர் ஆய்வுகள்.',
    noScansYet: 'முந்தைய ஸ்கேன்கள் எதுவும் இல்லை',
    noScansSubtext:
      'பயிரின் இலையை படம் எடுத்து அல்லது பதிவேற்றி உடனடியாக நோய் கண்டறியுங்கள்.',
    viewCompleteAnalysis: 'முழு அறிக்கையைக் காண்க',
    deleteScan: 'நீக்கு',
    close: 'மூடுக',
    cameraTitle: 'இலையை புகைப்படம் எடுக்கவும்',
    capturePhoto: 'படம் எடு',
    switchCamera: 'கேமராவை மாற்று',
    cancel: 'ரத்து செய்',
    cameraPermissionError:
      'கேமரா அணுகல் கிடைக்கவில்லை. படக்கோப்பை நேரடியாகப் பதிவேற்றவும்.',
    signIn: 'உள்நுழைக / கணக்கு',
    signOut: 'வெளியேறு',
    guestUser: 'விவசாயி (விருந்தினர்)',
    pipelineInfoTitle: 'MobileNetV2 + Gemini AI கட்டமைப்பு',
    pipelineBadge: 'MobileNetV2 + Gemini ஒருங்கிணைப்பு',
    severityMild: 'குறைவானது',
    severityModerate: 'மிதமானது',
    severitySevere: 'தீவிரமானது',
    severityNone: 'ஆரோக்கியமானது (பாதிப்பில்லை)',
    severityUnknown: 'தெரியவில்லை',
  },
};
