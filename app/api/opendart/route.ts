import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const corpCode = searchParams.get('corp_code');
  const bsnsYear = searchParams.get('bsns_year');
  const reprtCode = searchParams.get('reprt_code') || '11011';

  if (!corpCode || !bsnsYear) {
    return NextResponse.json(
      { error: 'corp_code와 bsns_year는 필수입니다.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPEN_DART_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenDart API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const url = `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${bsnsYear}&reprt_code=${reprtCode}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '000') {
      return NextResponse.json(
        { error: data.message || '데이터 조회에 실패했습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: data.list || [] });
  } catch (error) {
    console.error('OpenDart API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

