import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import type { ApplicationStatus, Category } from "@/types";
import { APPLICATION_STATUS, CATEGORY_LABEL, CATEGORY_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ───────── Button ───────── */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary: "bg-navy-800 text-white hover:bg-navy-900 shadow-sm",
  outline: "border border-slate-300 bg-white text-navy-800 hover:bg-slate-50",
  ghost: "text-navy-700 hover:bg-navy-50",
  accent: "bg-accent-500 text-white hover:bg-accent-600 shadow-sm",
  danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
};
const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/* ───────── Badge ───────── */
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        className ?? "bg-slate-50 text-slate-700 ring-slate-200",
      )}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  return <Badge className={CATEGORY_STYLE[category]}>{CATEGORY_LABEL[category]}</Badge>;
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const s = APPLICATION_STATUS[status];
  return <Badge className={s.style}>{s.label}</Badge>;
}

export function ReturnTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-0.5 text-xs text-navy-700">
      {children}
    </span>
  );
}

/* ───────── Card ───────── */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}

/* ───────── Form ───────── */
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-semibold text-navy-800", className)} {...props} />;
}

export function Required() {
  return <span className="ml-1.5 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">必須</span>;
}

const fieldBase =
  "w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-[120px] py-2 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "h-10 pr-8", className)} {...props} />;
}

/* ───────── Logo / Avatar ───────── */
export function InitialLogo({ text, color, size = "md" }: { text: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-16 w-16 text-2xl" : size === "sm" ? "h-9 w-9 text-sm" : "h-12 w-12 text-lg";
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-md font-bold text-white", color, sz)}>
      {text.slice(0, 1)}
    </div>
  );
}

/* ───────── Section heading ───────── */
export function SectionTitle({ en, title, className }: { en?: string; title: string; className?: string }) {
  return (
    <div className={cn("mb-8 text-center", className)}>
      {en && <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{en}</p>}
      <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h2>
    </div>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-slate-200 bg-navy-50/60">
      <div className="container-page py-8 sm:py-10">
        {children}
        <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-600 sm:text-base">{description}</p>}
      </div>
    </div>
  );
}
