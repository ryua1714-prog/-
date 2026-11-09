import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/toast";
import { PullToRefresh } from "@/components/pull-to-refresh";
import HomePage from "@/app/page";
import ProjectsPage from "@/app/projects/page";
import ProjectDetailPage from "@/app/projects/[id]/page";
import ApplyPage from "@/app/projects/[id]/apply/page";
import MyPage from "@/app/mypage/page";
import AdminPage from "@/app/admin/page";
import PricingPage from "@/app/pricing/page";
import ContactPage from "@/app/contact/page";
import NotFound from "@/app/not-found";
import { ParamsContext, usePathname } from "./shims/navigation";

const ROUTES: { pattern: RegExp; keys: string[]; Page: ComponentType }[] = [
  { pattern: /^\/$/, keys: [], Page: HomePage },
  { pattern: /^\/projects\/?$/, keys: [], Page: ProjectsPage },
  { pattern: /^\/projects\/([^/]+)\/apply\/?$/, keys: ["id"], Page: ApplyPage },
  { pattern: /^\/projects\/([^/]+)\/?$/, keys: ["id"], Page: ProjectDetailPage },
  { pattern: /^\/mypage\/?$/, keys: [], Page: MyPage },
  { pattern: /^\/admin\/?$/, keys: [], Page: AdminPage },
  { pattern: /^\/pricing\/?$/, keys: [], Page: PricingPage },
  { pattern: /^\/contact\/?$/, keys: [], Page: ContactPage },
];

function Routes() {
  const path = usePathname();
  for (const r of ROUTES) {
    const m = path.match(r.pattern);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return (
        <ParamsContext.Provider value={params}>
          <r.Page key={path} />
        </ParamsContext.Provider>
      );
    }
  }
  return <NotFound />;
}

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StoreProvider>
        <ToastProvider>
          <Header />
          <main className="flex-1">
            <PullToRefresh>
              <Routes />
            </PullToRefresh>
          </main>
          <Footer />
        </ToastProvider>
      </StoreProvider>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
