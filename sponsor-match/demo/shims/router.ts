// 単一HTML版デモ用のメモリ内ルーター（next/navigation・next/link の代替）
type Listener = () => void;

const listeners = new Set<Listener>();
let current = "/";
const stack: string[] = [];

function normalize(url: string) {
  if (!url) return "/";
  // "/#flow" のようなページ内アンカーはパス部分だけ使う
  const [beforeHash] = url.split("#");
  return beforeHash || "/";
}

function anchorOf(url: string) {
  const i = url.indexOf("#");
  return i >= 0 ? url.slice(i + 1) : "";
}

function emit() {
  listeners.forEach((l) => l());
}

export function getUrl() {
  return current;
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function navigate(url: string, opts: { replace?: boolean; scroll?: boolean } = {}) {
  const next = normalize(url);
  const anchor = anchorOf(url);
  const pathChanged = next.split("?")[0] !== current.split("?")[0];
  if (!opts.replace && next !== current) stack.push(current);
  current = next;
  emit();
  setTimeout(() => {
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    } else if (opts.scroll !== false && (pathChanged || !opts.replace)) {
      window.scrollTo({ top: 0 });
    }
  }, 0);
}

export function back() {
  const prev = stack.pop();
  if (prev !== undefined) {
    current = prev;
    emit();
  }
}

export function splitUrl(url: string) {
  const [path, query = ""] = url.split("?");
  return { path: path || "/", query };
}
