import { FinancialDataItem } from './opendart';

export async function analyzeFinancialData(
  financialData: FinancialDataItem[]
): Promise<string> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ financialData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `AI 분석 실패: ${response.status}`);
    }

    const result = await response.json();
    return result.analysis || '분석 결과를 생성할 수 없습니다.';
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}

