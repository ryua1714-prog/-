import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate } from "./router";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; prefetch?: boolean; scroll?: boolean };

export default function Link({ href, onClick, prefetch: _p, scroll, ...rest }: Props) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (!href.startsWith("/")) return;
    e.preventDefault();
    navigate(href, { scroll });
  };
  return <a href={href.startsWith("/") ? "#" : href} onClick={handle} {...rest} />;
}
