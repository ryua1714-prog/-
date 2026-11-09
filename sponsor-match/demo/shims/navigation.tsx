import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { back, getUrl, navigate, splitUrl, subscribe } from "./router";

export const ParamsContext = createContext<Record<string, string>>({});

export function useCurrentUrl() {
  return useSyncExternalStore(subscribe, getUrl, getUrl);
}

export function usePathname() {
  return splitUrl(useCurrentUrl()).path;
}

export function useSearchParams() {
  const { query } = splitUrl(useCurrentUrl());
  return useMemo(() => new URLSearchParams(query), [query]);
}

export function useParams<T extends Record<string, string>>() {
  return useContext(ParamsContext) as T;
}

const router = {
  push: (url: string, opts?: { scroll?: boolean }) => navigate(url, { scroll: opts?.scroll }),
  replace: (url: string, opts?: { scroll?: boolean }) => navigate(url, { replace: true, scroll: opts?.scroll }),
  back,
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
};

export function useRouter() {
  return router;
}

export function notFound(): never {
  throw new Error("notFound");
}
