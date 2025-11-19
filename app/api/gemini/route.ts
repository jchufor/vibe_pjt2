import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { financialData } = await request.json();

    if (!financialData || !Array.isArray(financialData) || financialData.length === 0) {
      return NextResponse.json(
        { error: '재무 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 주요 재무 데이터 추출
    const balanceSheet = financialData.filter((item: any) => item.sj_div === 'BS' && item.fs_div === 'CFS');
    const incomeStatement = financialData.filter((item: any) => item.sj_div === 'IS' && item.fs_div === 'CFS');

    const getAccountValue = (accountName: string, dataList: any[]) => {
      const account = dataList.find((item: any) => item.account_nm === accountName);
      if (!account) return null;
      return {
        당기: account.thstrm_amount,
        전기: account.frmtrm_amount,
        전전기: account.bfefrmtrm_amount || null,
      };
    };

    const keyMetrics = {
      자산총계: getAccountValue('자산총계', balanceSheet),
      부채총계: getAccountValue('부채총계', balanceSheet),
      자본총계: getAccountValue('자본총계', balanceSheet),
      매출액: getAccountValue('매출액', incomeStatement),
      영업이익: getAccountValue('영업이익', incomeStatement),
      당기순이익: getAccountValue('당기순이익(손실)', incomeStatement),
    };

    // Gemini API 호출
    const prompt = `다음은 한국 기업의 재무 데이터입니다. 이 데이터를 분석하여 누구나 쉽게 이해할 수 있도록 한국어로 설명해주세요.

주요 재무 지표:
${JSON.stringify(keyMetrics, null, 2)}

다음 항목들을 포함하여 분석해주세요:
1. 전반적인 재무 상태 평가
2. 주요 재무 지표의 변화 추이 분석
3. 재무 건전성 평가
4. 수익성 분석
5. 간단한 요약 및 종합 의견

분석은 일반인도 이해하기 쉬운 언어로 작성하고, 전문 용어는 최소화해주세요.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt,
          }],
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API 오류: ${response.status}`);
    }

    const result = await response.json();
    const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 생성할 수 없습니다.';

    return NextResponse.json({ analysis: analysisText });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

