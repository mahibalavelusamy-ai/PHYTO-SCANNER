import React, { useState } from 'react';
import {
  PlantAnalysisResult,
} from '../services/plantAnalysis/types';
import { Language, translations } from '../utils/i18n';
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  ShieldCheck,
  RotateCcw,
  BookmarkCheck,
  Share2,
  Printer,
  ChevronRight,
  Eye,
  Crosshair,
  Sparkles,
} from 'lucide-react';

interface ResultViewProps {
  result: PlantAnalysisResult;
  imageSrc: string;
  language: Language;
  onReset: () => void;
  isSaved: boolean;
  onSaveToHistory?: () => void;
  isSaving?: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  imageSrc,
  language,
  onReset,
  isSaved,
  onSaveToHistory,
  isSaving,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const getSeverityBadge = (severity: string) => {
    const s = severity?.toLowerCase() || '';
    if (s.includes('severe') || s.includes('தீவிர')) {
      return {
        bg: 'bg-rose-100 text-rose-800 border-rose-200',
        dot: 'bg-rose-600',
        label: t.severitySevere,
      };
    }
    if (s.includes('mod') || s.includes('மித')) {
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-200',
        dot: 'bg-amber-500',
        label: t.severityModerate,
      };
    }
    if (s.includes('mild') || s.includes('low') || s.includes('குறை')) {
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: t.severityMild,
      };
    }
    if (s.includes('none') || s.includes('health') || s.includes('ஆரோக்கிய')) {
      return {
        bg: 'bg-teal-100 text-teal-800 border-teal-200',
        dot: 'bg-teal-600',
        label: t.severityNone,
      };
    }
    return {
      bg: 'bg-stone-100 text-stone-700 border-stone-200',
      dot: 'bg-stone-500',
      label: result.severity || t.severityUnknown,
    };
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (conf >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const sevBadge = getSeverityBadge(result.severity);

  const handleCopySummary = () => {
    const text = `PhytoScan Assessment:
Condition: ${result.condition}
Confidence: ${result.confidence}%
Severity: ${result.severity}
Observations: ${result.observations.join(', ')}
Actions: ${result.recommendedActions.join('; ')}
Prevention: ${result.prevention.join('; ')}
Note: ${result.uncertaintyNote}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              AGRIMIND AI Report
            </span>
            {isSaved && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>{t.savedToHistory}</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
            {t.resultsTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopySummary}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>{copied ? 'Copied!' : 'Share / Copy'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors shadow-xs"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.scanAnotherPlant}</span>
          </button>
        </div>
      </div>

      {/* Primary Diagnostic Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/50 border border-stone-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Leaf Photo Thumbnail */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative aspect-square w-full max-w-[260px] rounded-2xl overflow-hidden bg-stone-900 border-2 border-stone-100 shadow-md group">
              <img
                src={imageSrc}
                alt="Analyzed leaf"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-[10px] text-white/90 font-mono flex items-center justify-between">
                <span>Verified Specimen</span>
                <span className="text-emerald-400">Scanned</span>
              </div>
            </div>
            {result.classifierMetadata?.candidateClass && (
              <div className="mt-2.5 text-center">
                <p className="text-[11px] text-stone-600 font-mono font-medium">
                  {result.classifierMetadata.isCustomPlantModelLoaded
                    ? `Plant Model: ${result.classifierMetadata.candidateClass}`
                    : `MobileNetV2: ${result.classifierMetadata.candidateClass}`}
                </p>
                {result.classifierMetadata.featureVectorLength && (
                  <p className="text-[10px] text-stone-400 font-mono">
                    Tensor: {result.classifierMetadata.featureVectorLength} features ({result.classifierMetadata.inferenceTimeMs}ms)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Condition, Confidence & Severity */}
          <div className="md:col-span-8 space-y-5">
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                {t.possibleCondition}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
                {result.condition}
              </h3>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Confidence metric */}
              <div className={`p-4 rounded-2xl border ${getConfidenceColor(result.confidence)}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">
                  {t.confidence}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black">
                    {result.confidence}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-current h-full rounded-full"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Severity metric */}
              <div className={`p-4 rounded-2xl border ${sevBadge.bg}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">
                  {t.severity}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${sevBadge.dot}`} />
                  <span className="text-lg sm:text-xl font-extrabold">
                    {sevBadge.label}
                  </span>
                </div>
                <p className="text-[10px] opacity-75 mt-1.5">
                  Pathology Stage
                </p>
              </div>

              {/* AI Verification Gate */}
              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Diagnostics
                </p>
                <div className="flex items-center gap-1.5 text-stone-800 font-bold text-sm mt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Multimodal AI</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-1.5">
                  Gemini + MobileNetV2
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* What AI Observed */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-bold text-base sm:text-lg mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <h4>{t.whatWeObserved}</h4>
            </div>
            <ul className="space-y-3">
              {result.observations && result.observations.length > 0 ? (
                result.observations.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{obs}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs sm:text-sm text-stone-500 italic">
                  No specific visible lesion patterns detected.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Possible Causes */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-bold text-base sm:text-lg mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h4>{t.possibleCauses}</h4>
            </div>
            <ul className="space-y-3">
              {result.possibleCauses && result.possibleCauses.length > 0 ? (
                result.possibleCauses.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs sm:text-sm text-stone-500 italic">
                  Environmental conditions or natural leaf senescence.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/40 rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-base sm:text-lg mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h4>{t.whatYouCanDo}</h4>
            </div>
            <ol className="space-y-3">
              {result.recommendedActions && result.recommendedActions.length > 0 ? (
                result.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs sm:text-sm text-stone-500 italic">
                  Continue regular watering and balanced fertilization.
                </li>
              )}
            </ol>
          </div>
        </div>

        {/* Prevention */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-bold text-base sm:text-lg mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4>{t.prevention}</h4>
            </div>
            <ul className="space-y-3">
              {result.prevention && result.prevention.length > 0 ? (
                result.prevention.map((prev, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{prev}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs sm:text-sm text-stone-500 italic">
                  Follow good crop rotation and avoid overhead sprinkling.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Uncertainty & Safety Note Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-amber-50/70 border border-amber-200 text-amber-950 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-xs sm:text-sm text-amber-900 uppercase tracking-wider">
              {t.safetyNoteTitle}
            </h5>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-900/90">
              {result.uncertaintyNote}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {onSaveToHistory && !isSaved && (
          <button
            onClick={onSaveToHistory}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span>{isSaving ? t.savingToHistory : t.savedToHistory}</span>
          </button>
        )}
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.scanAnotherPlant}</span>
        </button>
      </div>
    </div>
  );
};
