'use client';

import { useState } from 'react';
import CompanySearch from '@/components/CompanySearch';
import FinancialCharts from '@/components/FinancialCharts';
import AIAnalysis from '@/components/AIAnalysis';

export default function Home() {
  const [selectedCorpCode, setSelectedCorpCode] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompanySelect = (corpCode: string) => {
    setSelectedCorpCode(corpCode);
    setFinancialData(null);
    setError(null);
  };

  const handleDataLoad = (data: any[]) => {
    setFinancialData(data);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setFinancialData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
          재무 데이터 시각화 분석 서비스
        </h1>
        <p className="text-gray-600 text-center mb-8">
          회사명을 검색하여 재무 정보를 확인하고 AI 분석을 받아보세요
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <CompanySearch onSelect={handleCompanySelect} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {selectedCorpCode && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <FinancialCharts
              corpCode={selectedCorpCode}
              onDataLoad={handleDataLoad}
              onError={handleError}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        )}

        {financialData && financialData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AIAnalysis financialData={financialData} />
          </div>
        )}
      </div>
    </main>
  );
}

