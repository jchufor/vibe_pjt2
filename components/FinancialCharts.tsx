'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchFinancialData,
  formatAmount,
  formatAmountDisplay,
  formatPercentage,
  calculateFinancialRatios,
  calculateGrowthRates,
  calculateCAGR,
  FinancialDataItem,
} from '@/lib/opendart';

interface FinancialChartsProps {
  corpCode: string;
  onDataLoad: (data: FinancialDataItem[]) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function FinancialCharts({
  corpCode,
  onDataLoad,
  onError,
  loading,
  setLoading,
}: FinancialChartsProps) {
  const [bsnsYear, setBsnsYear] = useState(new Date().getFullYear() - 1);
  const [reprtCode, setReprtCode] = useState('11011');
  const [data, setData] = useState<FinancialDataItem[]>([]);

  const reportTypes = [
    { code: '11011', name: '사업보고서' },
    { code: '11012', name: '반기보고서' },
    { code: '11013', name: '1분기보고서' },
    { code: '11014', name: '3분기보고서' },
  ];

  useEffect(() => {
    if (corpCode) {
      loadData();
    }
  }, [corpCode, bsnsYear, reprtCode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const financialData = await fetchFinancialData(corpCode, bsnsYear.toString(), reprtCode);
      setData(financialData);
      onDataLoad(financialData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다.';
      onError(errorMessage);
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 재무상태표 데이터 추출
  const balanceSheetData = data.filter(
    (item) => item.sj_div === 'BS' && item.fs_div === 'CFS'
  );

  // 손익계산서 데이터 추출
  const incomeStatementData = data.filter(
    (item) => item.sj_div === 'IS' && item.fs_div === 'CFS'
  );

  // 현금흐름표 데이터 추출
  const cashFlowData = data.filter(
    (item) => item.sj_div === 'CF' && item.fs_div === 'CFS'
  );

  // 주요 계정 추출 및 차트 데이터 생성
  const getAccountValue = (accountName: string, dataList: FinancialDataItem[]) => {
    const account = dataList.find((item) => item.account_nm === accountName);
    if (!account) return null;
    return {
      당기: formatAmount(account.thstrm_amount),
      전기: formatAmount(account.frmtrm_amount),
      전전기: account.bfefrmtrm_amount ? formatAmount(account.bfefrmtrm_amount) : null,
    };
  };

  // 재무상태표 차트 데이터
  const bsChartData = [
    {
      name: '당기',
      자산총계: getAccountValue('자산총계', balanceSheetData)?.당기 || 0,
      부채총계: getAccountValue('부채총계', balanceSheetData)?.당기 || 0,
      자본총계: getAccountValue('자본총계', balanceSheetData)?.당기 || 0,
    },
    {
      name: '전기',
      자산총계: getAccountValue('자산총계', balanceSheetData)?.전기 || 0,
      부채총계: getAccountValue('부채총계', balanceSheetData)?.전기 || 0,
      자본총계: getAccountValue('자본총계', balanceSheetData)?.전기 || 0,
    },
  ];

  // 손익계산서 차트 데이터
  const isChartData = [
    {
      name: '당기',
      매출액: getAccountValue('매출액', incomeStatementData)?.당기 || 0,
      영업이익: getAccountValue('영업이익', incomeStatementData)?.당기 || 0,
      당기순이익: getAccountValue('당기순이익(손실)', incomeStatementData)?.당기 || 0,
    },
    {
      name: '전기',
      매출액: getAccountValue('매출액', incomeStatementData)?.전기 || 0,
      영업이익: getAccountValue('영업이익', incomeStatementData)?.전기 || 0,
      당기순이익: getAccountValue('당기순이익(손실)', incomeStatementData)?.전기 || 0,
    },
  ];

  // 주요 재무 지표 차트 데이터
  const keyMetrics = [
    { name: '자산총계', data: getAccountValue('자산총계', balanceSheetData) },
    { name: '부채총계', data: getAccountValue('부채총계', balanceSheetData) },
    { name: '자본총계', data: getAccountValue('자본총계', balanceSheetData) },
    { name: '매출액', data: getAccountValue('매출액', incomeStatementData) },
    { name: '영업이익', data: getAccountValue('영업이익', incomeStatementData) },
    { name: '당기순이익', data: getAccountValue('당기순이익(손실)', incomeStatementData) },
  ].filter((item) => item.data !== null);

  const metricsChartData = keyMetrics.map((metric) => ({
    name: metric.name,
    당기: metric.data?.당기 || 0,
    전기: metric.data?.전기 || 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="mb-1">
              {`${entry.name}: ${formatAmountDisplay(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PercentageTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="mb-1">
              {`${entry.name}: ${entry.value !== null ? formatPercentage(entry.value) : '-'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 재무비율 계산
  const financialRatios = calculateFinancialRatios(balanceSheetData, incomeStatementData);

  // 성장률 계산
  const growthRates = calculateGrowthRates(balanceSheetData, incomeStatementData);

  // 재무비율 차트 데이터
  const ratiosChartData = [
    {
      name: '부채비율',
      당기: financialRatios.당기.부채비율,
      전기: financialRatios.전기.부채비율,
      전전기: financialRatios.전전기?.부채비율,
    },
    {
      name: '유동비율',
      당기: financialRatios.당기.유동비율,
      전기: financialRatios.전기.유동비율,
      전전기: financialRatios.전전기?.유동비율,
    },
    {
      name: '자기자본비율',
      당기: financialRatios.당기.자기자본비율,
      전기: financialRatios.전기.자기자본비율,
      전전기: financialRatios.전전기?.자기자본비율,
    },
    {
      name: 'ROE',
      당기: financialRatios.당기.ROE,
      전기: financialRatios.전기.ROE,
      전전기: financialRatios.전전기?.ROE,
    },
    {
      name: 'ROA',
      당기: financialRatios.당기.ROA,
      전기: financialRatios.전기.ROA,
      전전기: financialRatios.전전기?.ROA,
    },
    {
      name: '영업이익률',
      당기: financialRatios.당기.영업이익률,
      전기: financialRatios.전기.영업이익률,
      전전기: financialRatios.전전기?.영업이익률,
    },
    {
      name: '순이익률',
      당기: financialRatios.당기.순이익률,
      전기: financialRatios.전기.순이익률,
      전전기: financialRatios.전전기?.순이익률,
    },
  ].filter(item => item.당기 !== null || item.전기 !== null);

  // 성장률 차트 데이터
  const growthChartData = [
    {
      name: '매출성장률',
      당기: growthRates.당기.매출성장률,
      전기: growthRates.전기?.매출성장률,
    },
    {
      name: '영업이익성장률',
      당기: growthRates.당기.영업이익성장률,
      전기: growthRates.전기?.영업이익성장률,
    },
    {
      name: '순이익성장률',
      당기: growthRates.당기.순이익성장률,
      전기: growthRates.전기?.순이익성장률,
    },
    {
      name: '자산성장률',
      당기: growthRates.당기.자산성장률,
      전기: growthRates.전기?.자산성장률,
    },
  ].filter(item => item.당기 !== null || item.전기 !== null);

  // 수익성 트렌드 차트 데이터
  const profitabilityTrendData = [
    {
      name: '전전기',
      영업이익률: financialRatios.전전기?.영업이익률,
      순이익률: financialRatios.전전기?.순이익률,
    },
    {
      name: '전기',
      영업이익률: financialRatios.전기.영업이익률,
      순이익률: financialRatios.전기.순이익률,
    },
    {
      name: '당기',
      영업이익률: financialRatios.당기.영업이익률,
      순이익률: financialRatios.당기.순이익률,
    },
  ].filter(d => d.영업이익률 !== null || d.순이익률 !== null);

  // 안정성 지표 추이 차트 데이터
  const stabilityTrendData = [
    {
      name: '전전기',
      부채비율: financialRatios.전전기?.부채비율,
      유동비율: financialRatios.전전기?.유동비율,
      자기자본비율: financialRatios.전전기?.자기자본비율,
    },
    {
      name: '전기',
      부채비율: financialRatios.전기.부채비율,
      유동비율: financialRatios.전기.유동비율,
      자기자본비율: financialRatios.전기.자기자본비율,
    },
    {
      name: '당기',
      부채비율: financialRatios.당기.부채비율,
      유동비율: financialRatios.당기.유동비율,
      자기자본비율: financialRatios.당기.자기자본비율,
    },
  ].filter(d => d.부채비율 !== null || d.유동비율 !== null || d.자기자본비율 !== null);

  // 부채/자본 구조 차트 데이터
  const capitalStructureData = [
    {
      name: '전전기',
      부채: getAccountValue('부채총계', balanceSheetData)?.전전기 || 0,
      자본: getAccountValue('자본총계', balanceSheetData)?.전전기 || 0,
    },
    {
      name: '전기',
      부채: getAccountValue('부채총계', balanceSheetData)?.전기 || 0,
      자본: getAccountValue('자본총계', balanceSheetData)?.전기 || 0,
    },
    {
      name: '당기',
      부채: getAccountValue('부채총계', balanceSheetData)?.당기 || 0,
      자본: getAccountValue('자본총계', balanceSheetData)?.당기 || 0,
    },
  ].filter(d => d.부채 > 0 || d.자본 > 0);

  // 현금흐름 데이터 추출
  const getCashFlowValue = (accountName: string, period: 'thstrm' | 'frmtrm' | 'bfefrmtrm') => {
    const account = cashFlowData.find((item) => item.account_nm === accountName);
    if (!account) return null;
    if (period === 'thstrm') return formatAmount(account.thstrm_amount);
    if (period === 'frmtrm') return formatAmount(account.frmtrm_amount);
    if (period === 'bfefrmtrm') return account.bfefrmtrm_amount ? formatAmount(account.bfefrmtrm_amount) : null;
    return null;
  };

  const 영업현금흐름_당기 = getCashFlowValue('영업활동으로인한현금흐름', 'thstrm') ||
                            getCashFlowValue('영업활동현금흐름', 'thstrm');
  const 영업현금흐름_전기 = getCashFlowValue('영업활동으로인한현금흐름', 'frmtrm') ||
                            getCashFlowValue('영업활동현금흐름', 'frmtrm');
  const 영업현금흐름_전전기 = getCashFlowValue('영업활동으로인한현금흐름', 'bfefrmtrm') ||
                              getCashFlowValue('영업활동현금흐름', 'bfefrmtrm');

  const 투자현금흐름_당기 = getCashFlowValue('투자활동으로인한현금흐름', 'thstrm') ||
                            getCashFlowValue('투자활동현금흐름', 'thstrm');
  const 투자현금흐름_전기 = getCashFlowValue('투자활동으로인한현금흐름', 'frmtrm') ||
                            getCashFlowValue('투자활동현금흐름', 'frmtrm');
  const 투자현금흐름_전전기 = getCashFlowValue('투자활동으로인한현금흐름', 'bfefrmtrm') ||
                              getCashFlowValue('투자활동현금흐름', 'bfefrmtrm');

  const 재무현금흐름_당기 = getCashFlowValue('재무활동으로인한현금흐름', 'thstrm') ||
                            getCashFlowValue('재무활동현금흐름', 'thstrm');
  const 재무현금흐름_전기 = getCashFlowValue('재무활동으로인한현금흐름', 'frmtrm') ||
                            getCashFlowValue('재무활동현금흐름', 'frmtrm');
  const 재무현금흐름_전전기 = getCashFlowValue('재무활동으로인한현금흐름', 'bfefrmtrm') ||
                              getCashFlowValue('재무활동현금흐름', 'bfefrmtrm');

  // 자유현금흐름 계산 (영업현금흐름 + 투자현금흐름)
  const 자유현금흐름_당기 = (영업현금흐름_당기 !== null && 투자현금흐름_당기 !== null) 
                            ? 영업현금흐름_당기 + 투자현금흐름_당기 : null;
  const 자유현금흐름_전기 = (영업현금흐름_전기 !== null && 투자현금흐름_전기 !== null)
                            ? 영업현금흐름_전기 + 투자현금흐름_전기 : null;
  const 자유현금흐름_전전기 = (영업현금흐름_전전기 !== null && 투자현금흐름_전전기 !== null)
                              ? 영업현금흐름_전전기 + 투자현금흐름_전전기 : null;

  // 현금흐름 추이 차트 데이터
  const cashFlowTrendData = [
    {
      name: '전전기',
      영업현금흐름: 영업현금흐름_전전기,
      투자현금흐름: 투자현금흐름_전전기,
      재무현금흐름: 재무현금흐름_전전기,
      자유현금흐름: 자유현금흐름_전전기,
    },
    {
      name: '전기',
      영업현금흐름: 영업현금흐름_전기,
      투자현금흐름: 투자현금흐름_전기,
      재무현금흐름: 재무현금흐름_전기,
      자유현금흐름: 자유현금흐름_전기,
    },
    {
      name: '당기',
      영업현금흐름: 영업현금흐름_당기,
      투자현금흐름: 투자현금흐름_당기,
      재무현금흐름: 재무현금흐름_당기,
      자유현금흐름: 자유현금흐름_당기,
    },
  ].filter(d => d.영업현금흐름 !== null || d.투자현금흐름 !== null || d.재무현금흐름 !== null);

  // 현금흐름 대비 순이익 비교 차트 데이터
  const cashFlowVsNetIncomeData = [
    {
      name: '전전기',
      영업현금흐름: 영업현금흐름_전전기,
      당기순이익: getAccountValue('당기순이익(손실)', incomeStatementData)?.전전기 || 0,
    },
    {
      name: '전기',
      영업현금흐름: 영업현금흐름_전기,
      당기순이익: getAccountValue('당기순이익(손실)', incomeStatementData)?.전기 || 0,
    },
    {
      name: '당기',
      영업현금흐름: 영업현금흐름_당기,
      당기순이익: getAccountValue('당기순이익(손실)', incomeStatementData)?.당기 || 0,
    },
  ].filter(d => d.영업현금흐름 !== null || d.당기순이익 !== 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">재무 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        해당 연도 및 보고서의 재무 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">사업연도</label>
          <input
            type="number"
            value={bsnsYear}
            onChange={(e) => setBsnsYear(parseInt(e.target.value))}
            min="2015"
            max={new Date().getFullYear()}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">보고서 유형</label>
          <select
            value={reprtCode}
            onChange={(e) => setReprtCode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {reportTypes.map((type) => (
              <option key={type.code} value={type.code}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          조회
        </button>
      </div>

      <div className="space-y-8">
        {/* 주요 재무 지표 차트 */}
        {metricsChartData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">주요 재무 지표</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={metricsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis
                  tickFormatter={(value) => formatAmountDisplay(value)}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="당기" fill="#3b82f6" />
                <Bar dataKey="전기" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 자산/부채/자본 추이 */}
        {balanceSheetData.length > 0 && bsChartData.some(d => d.자산총계 > 0 || d.부채총계 > 0 || d.자본총계 > 0) && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">재무상태표 주요 항목</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={bsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatAmountDisplay(value)} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="자산총계"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="자산총계"
                />
                <Line
                  type="monotone"
                  dataKey="부채총계"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="부채총계"
                />
                <Line
                  type="monotone"
                  dataKey="자본총계"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="자본총계"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 손익 추이 */}
        {incomeStatementData.length > 0 && isChartData.some(d => d.매출액 > 0 || d.영업이익 !== 0 || d.당기순이익 !== 0) && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">손익계산서 주요 항목</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={isChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatAmountDisplay(value)} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="매출액"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="매출액"
                />
                <Line
                  type="monotone"
                  dataKey="영업이익"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="영업이익"
                />
                <Line
                  type="monotone"
                  dataKey="당기순이익"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="당기순이익"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 재무비율 분석 */}
        {ratiosChartData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">재무비율 분석</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ratiosChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => formatPercentage(value)} width={100} />
                <Tooltip content={<PercentageTooltip />} />
                <Legend />
                {financialRatios.전전기 && (
                  <Bar dataKey="전전기" fill="#94a3b8" name="전전기" />
                )}
                <Bar dataKey="전기" fill="#10b981" name="전기" />
                <Bar dataKey="당기" fill="#3b82f6" name="당기" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 성장률 분석 */}
        {growthChartData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">성장률 분석</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => formatPercentage(value)} width={100} />
                <Tooltip content={<PercentageTooltip />} />
                <Legend />
                {growthRates.전기 && (
                  <Bar dataKey="전기" fill="#10b981" name="전기 성장률" />
                )}
                <Bar dataKey="당기" fill="#3b82f6" name="당기 성장률" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 수익성 트렌드 */}
        {profitabilityTrendData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">수익성 트렌드 분석</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={profitabilityTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatPercentage(value)} width={100} />
                <Tooltip content={<PercentageTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="영업이익률"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="영업이익률"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="순이익률"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="순이익률"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 안정성 지표 추이 */}
        {stabilityTrendData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">안정성 지표 추이</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={stabilityTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatPercentage(value)} width={100} />
                <Tooltip content={<PercentageTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="부채비율"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="부채비율"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="유동비율"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="유동비율"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="자기자본비율"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="자기자본비율"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 부채/자본 구조 변화 */}
        {capitalStructureData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">부채/자본 구조 변화</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={capitalStructureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatAmountDisplay(value)} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="부채"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="부채"
                />
                <Area
                  type="monotone"
                  dataKey="자본"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="자본"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 현금흐름 추이 */}
        {cashFlowTrendData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">현금흐름 추이</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cashFlowTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatAmountDisplay(value)} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="영업현금흐름"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="영업현금흐름"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="투자현금흐름"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="투자현금흐름"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="재무현금흐름"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="재무현금흐름"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="자유현금흐름"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="자유현금흐름"
                  strokeDasharray="5 5"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 현금흐름 대비 순이익 비교 */}
        {cashFlowVsNetIncomeData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">현금흐름 대비 순이익 비교</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={cashFlowVsNetIncomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => formatAmountDisplay(value)}
                  width={100}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => formatAmountDisplay(value)}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="영업현금흐름"
                  fill="#10b981"
                  name="영업현금흐름"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="당기순이익"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="당기순이익"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

