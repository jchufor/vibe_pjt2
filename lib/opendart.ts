interface FinancialDataItem {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  stock_code: string;
  fs_div: string;
  fs_nm: string;
  sj_div: string;
  sj_nm: string;
  account_nm: string;
  thstrm_nm: string;
  thstrm_dt: string;
  thstrm_amount: string;
  thstrm_add_amount?: string;
  frmtrm_nm: string;
  frmtrm_dt: string;
  frmtrm_amount: string;
  frmtrm_add_amount?: string;
  bfefrmtrm_nm?: string;
  bfefrmtrm_dt?: string;
  bfefrmtrm_amount?: string;
  ord: string;
  currency: string;
}

interface OpenDartResponse {
  status: string;
  message: string;
  list?: FinancialDataItem[];
}

export async function fetchFinancialData(
  corpCode: string,
  bsnsYear: string,
  reprtCode: string = '11011' // 사업보고서 기본값
): Promise<FinancialDataItem[]> {
  const url = `/api/opendart?corp_code=${corpCode}&bsns_year=${bsnsYear}&reprt_code=${reprtCode}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API 요청 실패: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}

export function formatAmount(amount: string): number {
  if (!amount || amount === '-') return 0;
  return parseInt(amount.replace(/,/g, ''), 10);
}

export function formatAmountDisplay(amount: number): string {
  if (amount === 0) return '0';
  if (amount >= 1000000000000) {
    return `${(amount / 1000000000000).toFixed(2)}조`;
  }
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(2)}억`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(2)}만`;
  }
  return amount.toLocaleString();
}

export function formatPercentage(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '-';
  return `${value.toFixed(2)}%`;
}

// 재무비율 계산 인터페이스
export interface FinancialRatios {
  부채비율: number | null;
  유동비율: number | null;
  자기자본비율: number | null;
  ROE: number | null;
  ROA: number | null;
  영업이익률: number | null;
  순이익률: number | null;
}

// 재무비율 계산 함수
export function calculateFinancialRatios(
  balanceSheetData: FinancialDataItem[],
  incomeStatementData: FinancialDataItem[]
): { 당기: FinancialRatios; 전기: FinancialRatios; 전전기: FinancialRatios | null } {
  const getAccountValue = (accountName: string, dataList: FinancialDataItem[], period: 'thstrm' | 'frmtrm' | 'bfefrmtrm') => {
    const account = dataList.find((item) => item.account_nm === accountName);
    if (!account) return null;
    if (period === 'thstrm') return formatAmount(account.thstrm_amount);
    if (period === 'frmtrm') return formatAmount(account.frmtrm_amount);
    if (period === 'bfefrmtrm') return account.bfefrmtrm_amount ? formatAmount(account.bfefrmtrm_amount) : null;
    return null;
  };

  const safeDivide = (numerator: number | null, denominator: number | null): number | null => {
    if (numerator === null || denominator === null || denominator === 0) return null;
    return numerator / denominator;
  };

  const calculateRatios = (period: 'thstrm' | 'frmtrm' | 'bfefrmtrm'): FinancialRatios => {
    const 자산총계 = getAccountValue('자산총계', balanceSheetData, period);
    const 부채총계 = getAccountValue('부채총계', balanceSheetData, period);
    const 자본총계 = getAccountValue('자본총계', balanceSheetData, period);
    const 유동자산 = getAccountValue('유동자산', balanceSheetData, period) || 
                     getAccountValue('유동자산합계', balanceSheetData, period);
    const 유동부채 = getAccountValue('유동부채', balanceSheetData, period) || 
                     getAccountValue('유동부채합계', balanceSheetData, period);
    const 매출액 = getAccountValue('매출액', incomeStatementData, period);
    const 영업이익 = getAccountValue('영업이익', incomeStatementData, period) ||
                     getAccountValue('영업이익(손실)', incomeStatementData, period);
    const 당기순이익 = getAccountValue('당기순이익(손실)', incomeStatementData, period) ||
                       getAccountValue('당기순이익', incomeStatementData, period);

    return {
      부채비율: safeDivide(부채총계, 자본총계) !== null ? (safeDivide(부채총계, 자본총계)! * 100) : null,
      유동비율: safeDivide(유동자산, 유동부채) !== null ? (safeDivide(유동자산, 유동부채)! * 100) : null,
      자기자본비율: safeDivide(자본총계, 자산총계) !== null ? (safeDivide(자본총계, 자산총계)! * 100) : null,
      ROE: safeDivide(당기순이익, 자본총계) !== null ? (safeDivide(당기순이익, 자본총계)! * 100) : null,
      ROA: safeDivide(당기순이익, 자산총계) !== null ? (safeDivide(당기순이익, 자산총계)! * 100) : null,
      영업이익률: safeDivide(영업이익, 매출액) !== null ? (safeDivide(영업이익, 매출액)! * 100) : null,
      순이익률: safeDivide(당기순이익, 매출액) !== null ? (safeDivide(당기순이익, 매출액)! * 100) : null,
    };
  };

  return {
    당기: calculateRatios('thstrm'),
    전기: calculateRatios('frmtrm'),
    전전기: calculateRatios('bfefrmtrm'),
  };
}

// 성장률 계산 인터페이스
export interface GrowthRates {
  매출성장률: number | null;
  영업이익성장률: number | null;
  순이익성장률: number | null;
  자산성장률: number | null;
}

// 성장률 계산 함수
export function calculateGrowthRates(
  balanceSheetData: FinancialDataItem[],
  incomeStatementData: FinancialDataItem[]
): { 당기: GrowthRates; 전기: GrowthRates | null } {
  const getAccountValue = (accountName: string, dataList: FinancialDataItem[], period: 'thstrm' | 'frmtrm' | 'bfefrmtrm') => {
    const account = dataList.find((item) => item.account_nm === accountName);
    if (!account) return null;
    if (period === 'thstrm') return formatAmount(account.thstrm_amount);
    if (period === 'frmtrm') return formatAmount(account.frmtrm_amount);
    if (period === 'bfefrmtrm') return account.bfefrmtrm_amount ? formatAmount(account.bfefrmtrm_amount) : null;
    return null;
  };

  const calculateGrowthRate = (current: number | null, previous: number | null): number | null => {
    if (current === null || previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const 당기_매출액 = getAccountValue('매출액', incomeStatementData, 'thstrm');
  const 전기_매출액 = getAccountValue('매출액', incomeStatementData, 'frmtrm');
  const 전전기_매출액 = getAccountValue('매출액', incomeStatementData, 'bfefrmtrm');

  const 당기_영업이익 = getAccountValue('영업이익', incomeStatementData, 'thstrm') ||
                        getAccountValue('영업이익(손실)', incomeStatementData, 'thstrm');
  const 전기_영업이익 = getAccountValue('영업이익', incomeStatementData, 'frmtrm') ||
                        getAccountValue('영업이익(손실)', incomeStatementData, 'frmtrm');
  const 전전기_영업이익 = getAccountValue('영업이익', incomeStatementData, 'bfefrmtrm') ||
                          getAccountValue('영업이익(손실)', incomeStatementData, 'bfefrmtrm');

  const 당기_순이익 = getAccountValue('당기순이익(손실)', incomeStatementData, 'thstrm') ||
                      getAccountValue('당기순이익', incomeStatementData, 'thstrm');
  const 전기_순이익 = getAccountValue('당기순이익(손실)', incomeStatementData, 'frmtrm') ||
                      getAccountValue('당기순이익', incomeStatementData, 'frmtrm');
  const 전전기_순이익 = getAccountValue('당기순이익(손실)', incomeStatementData, 'bfefrmtrm') ||
                        getAccountValue('당기순이익', incomeStatementData, 'bfefrmtrm');

  const 당기_자산총계 = getAccountValue('자산총계', balanceSheetData, 'thstrm');
  const 전기_자산총계 = getAccountValue('자산총계', balanceSheetData, 'frmtrm');
  const 전전기_자산총계 = getAccountValue('자산총계', balanceSheetData, 'bfefrmtrm');

  return {
    당기: {
      매출성장률: calculateGrowthRate(당기_매출액, 전기_매출액),
      영업이익성장률: calculateGrowthRate(당기_영업이익, 전기_영업이익),
      순이익성장률: calculateGrowthRate(당기_순이익, 전기_순이익),
      자산성장률: calculateGrowthRate(당기_자산총계, 전기_자산총계),
    },
    전기: 전전기_매출액 !== null ? {
      매출성장률: calculateGrowthRate(전기_매출액, 전전기_매출액),
      영업이익성장률: calculateGrowthRate(전기_영업이익, 전전기_영업이익),
      순이익성장률: calculateGrowthRate(전기_순이익, 전전기_순이익),
      자산성장률: calculateGrowthRate(전기_자산총계, 전전기_자산총계),
    } : null,
  };
}

// CAGR 계산 함수
export function calculateCAGR(
  startValue: number | null,
  endValue: number | null,
  years: number
): number | null {
  if (startValue === null || endValue === null || startValue === 0 || years <= 0) return null;
  if (endValue < 0 && startValue > 0) return null; // 음수로 변한 경우
  const ratio = endValue / startValue;
  if (ratio <= 0) return null;
  return (Math.pow(ratio, 1 / years) - 1) * 100;
}

export type { FinancialDataItem };

