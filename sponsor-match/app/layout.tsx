import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: {
    default: "スポンサーブリッジ｜挑戦する人と、応援する企業をつなぐ",
    template: "%s｜スポンサーブリッジ",
  },
  description:
    "スポーツ・地域・学生の挑戦と、応援したい企業をつなぐスポンサーマッチングプラットフォーム（MVPデモ）。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        <StoreProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
