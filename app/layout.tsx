import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "재무 데이터 시각화 분석 서비스",
  description: "누구나 쉽게 이해할 수 있는 재무 데이터 시각화 분석 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}

