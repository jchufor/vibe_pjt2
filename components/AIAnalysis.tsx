'use client';

import { useState } from 'react';
import { analyzeFinancialData } from '@/lib/gemini';
import { FinancialDataItem } from '@/lib/opendart';

interface AIAnalysisProps {
  financialData: FinancialDataItem[];
}

export default function AIAnalysis({ financialData }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeFinancialData(financialData);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI 분석 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('AI analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">AI 재무 분석</h2>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '분석 중...' : 'AI 분석 시작'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-700">AI가 재무 데이터를 분석하고 있습니다...</span>
          </div>
        </div>
      )}

      {analysis && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">분석 결과</h3>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {analysis.split('\n').map((line, index) => (
                <p key={index} className="mb-3">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
          위의 &quot;AI 분석 시작&quot; 버튼을 클릭하여 재무 데이터에 대한 AI 분석을 받아보세요.
        </div>
      )}
    </div>
  );
}

