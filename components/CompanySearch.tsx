'use client';

import { useState, useEffect, useMemo } from 'react';

interface Company {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string;
  stock_code: string;
  modify_date: string;
}

interface CompanySearchProps {
  onSelect: (corpCode: string) => void;
}

export default function CompanySearch({ onSelect }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Load companies data
    fetch('/data/corp.json')
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load companies:', err);
        setLoading(false);
      });
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return companies
      .filter(
        (company) =>
          company.corp_name.toLowerCase().includes(term) ||
          company.corp_eng_name.toLowerCase().includes(term) ||
          company.stock_code.includes(term)
      )
      .slice(0, 10); // Limit to 10 results
  }, [searchTerm, companies]);

  const handleSelect = (company: Company) => {
    setSelectedCompany(company);
    setSearchTerm(company.corp_name);
    onSelect(company.corp_code);
  };

  return (
    <div className="w-full">
      <label htmlFor="company-search" className="block text-sm font-medium text-gray-700 mb-2">
        회사명 검색
      </label>
      <div className="relative">
        <input
          id="company-search"
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedCompany(null);
          }}
          placeholder="회사명, 영문명, 또는 종목코드를 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        
        {loading && (
          <div className="absolute right-3 top-3 text-gray-400">로딩 중...</div>
        )}

        {!loading && searchTerm && filteredCompanies.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredCompanies.map((company) => (
              <button
                key={company.corp_code}
                onClick={() => handleSelect(company)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="font-semibold text-gray-800">{company.corp_name}</div>
                <div className="text-sm text-gray-500">
                  {company.corp_eng_name && `${company.corp_eng_name} • `}
                  종목코드: {company.stock_code || 'N/A'} • 고유번호: {company.corp_code}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && searchTerm && filteredCompanies.length === 0 && searchTerm.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </div>

      {selectedCompany && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="font-semibold text-blue-900">선택된 회사</div>
          <div className="text-blue-700">
            {selectedCompany.corp_name} ({selectedCompany.corp_code})
          </div>
        </div>
      )}
    </div>
  );
}

