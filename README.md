# 재무 데이터 시각화 분석 서비스

누구나 쉽게 이해할 수 있는 재무 데이터 시각화 분석 서비스입니다.

## 주요 기능

1. **회사 검색**: 회사명, 영문명, 또는 종목코드로 검색하여 고유번호(corp_code) 확인
2. **재무 데이터 시각화**: OpenDart API를 통해 재무 데이터를 조회하고 차트로 시각화
   - 주요 재무 지표 (자산, 부채, 자본, 매출, 영업이익, 순이익)
   - 재무비율 분석 (부채비율, 유동비율, ROE, ROA, 영업이익률, 순이익률 등)
   - 성장률 분석 (매출, 영업이익, 순이익, 자산 성장률)
   - 수익성 트렌드 분석
   - 안정성 지표 추이
   - 부채/자본 구조 변화
   - 현금흐름 분석 (영업/투자/재무/자유현금흐름)
3. **AI 분석**: Gemini API를 활용하여 재무 데이터를 쉽게 이해할 수 있도록 분석

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **차트**: Recharts
- **API**: OpenDart API, Google Gemini API

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
OPEN_DART_API_KEY=your_opendart_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포 (Vercel)

### 1. Vercel에 프로젝트 연결

1. [Vercel](https://vercel.com)에 로그인합니다.
2. "New Project"를 클릭합니다.
3. GitHub 저장소 `jchufor/vibe_pjt2`를 선택합니다.
4. 프로젝트를 import합니다.

### 2. 환경 변수 설정 (중요!)

**API 키는 절대 코드에 포함하지 않고 환경 변수로 관리합니다.**

Vercel 대시보드의 프로젝트 설정 > Environment Variables에서 다음 환경 변수를 추가합니다:

- `OPEN_DART_API_KEY`: OpenDart API 키 (https://opendart.fss.or.kr/uss/umt/EidRetrieveUserInfo.do)
- `GEMINI_API_KEY`: Gemini API 키 (https://ai.google.dev/)

**환경 변수는 Production, Preview, Development 환경 모두에 추가해야 합니다.**

### 3. 배포

GitHub에 푸시하면 자동으로 배포됩니다. 또는 Vercel 대시보드에서 "Deploy" 버튼을 클릭하여 수동 배포할 수 있습니다.

## 사용 방법

1. **회사 검색**: 상단 검색창에 회사명을 입력하여 회사를 선택합니다.
2. **재무 데이터 조회**: 선택한 회사의 재무 데이터를 조회합니다. 사업연도와 보고서 유형을 선택할 수 있습니다.
3. **차트 확인**: 재무상태표와 손익계산서의 주요 항목이 차트로 표시됩니다.
   - 재무비율 분석: 부채비율, 유동비율, ROE, ROA 등
   - 성장률 분석: 매출, 영업이익, 순이익, 자산 성장률
   - 수익성 및 안정성 지표 추이
   - 현금흐름 분석
4. **AI 분석**: "AI 분석 시작" 버튼을 클릭하여 재무 데이터에 대한 AI 분석을 받을 수 있습니다.

## 프로젝트 구조

```
├── app/
│   ├── api/              # API 라우트 (OpenDart, Gemini)
│   ├── page.tsx          # 메인 페이지
│   └── layout.tsx         # 레이아웃
├── components/
│   ├── CompanySearch.tsx # 회사 검색 컴포넌트
│   ├── FinancialCharts.tsx # 재무 차트 컴포넌트
│   └── AIAnalysis.tsx    # AI 분석 컴포넌트
├── lib/
│   ├── opendart.ts       # OpenDart API 클라이언트
│   └── gemini.ts         # Gemini API 클라이언트
└── public/
    └── data/
        └── corp.json     # 회사 데이터 (corp.xml에서 변환)
```

## 주의사항

### API 키 관리
- **API 키는 절대 공개 저장소에 커밋하지 마세요.**
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 업로드되지 않습니다.
- Vercel 배포 시 환경 변수로만 설정하세요.
- API 키는 별도로 안전하게 관리하세요.

### API 제한사항
- OpenDart API는 일일 호출 제한이 있을 수 있습니다.
- Gemini API는 사용량에 따라 비용이 발생할 수 있습니다.
- 현재 Gemini 모델: `gemini-2.5-flash`

### 보안
- 프로덕션 환경에서는 API 키를 환경 변수로만 관리하세요.
- 클라이언트 사이드 코드에 API 키를 하드코딩하지 마세요.

## 라이선스

MIT

