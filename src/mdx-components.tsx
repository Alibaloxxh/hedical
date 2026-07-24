import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

function H1({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <h1 className="mb-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl" {...props}>{children}</h1>;
}

function H2({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <h2 className="mb-3 mt-10 text-2xl font-semibold text-ink" {...props}>{children}</h2>;
}

function H3({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <h3 className="mb-2 mt-8 text-xl font-semibold text-ink" {...props}>{children}</h3>;
}

function H4({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <h4 className="mb-2 mt-6 text-lg font-semibold text-ink" {...props}>{children}</h4>;
}

function P({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <p className="mb-4 leading-relaxed text-gray-700" {...props}>{children}</p>;
}

function Ul({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <ul className="mb-4 list-disc pl-6 text-gray-700" {...props}>{children}</ul>;
}

function Ol({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <ol className="mb-4 list-decimal pl-6 text-gray-700" {...props}>{children}</ol>;
}

function Li({ children, ...props }: { children?: ReactNode; className?: string }) {
  return <li className="mb-1 leading-relaxed" {...props}>{children}</li>;
}

function A({ children, href, ...props }: { children?: ReactNode; href?: string; className?: string }) {
  return (
    <a
      className="text-teal underline underline-offset-2 hover:text-teal-light"
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

function Blockquote({ children, ...props }: { children?: ReactNode; className?: string }) {
  return (
    <blockquote className="my-4 border-l-4 border-gray-300 bg-gray-50 py-2 pl-4 italic text-gray-600" {...props}>
      {children}
    </blockquote>
  );
}

function Code({ children, ...props }: { children?: ReactNode; className?: string }) {
  return (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-800" {...props}>
      {children}
    </code>
  );
}

function Pre({ children, ...props }: { children?: ReactNode; className?: string }) {
  return (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100" {...props}>
      {children}
    </pre>
  );
}

function Table({ children, ...props }: { children?: ReactNode; className?: string }) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" {...props}>{children}</table>
    </div>
  );
}

function Th({ children, ...props }: { children?: ReactNode; className?: string }) {
  return (
    <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-700" {...props}>
      {children}
    </th>
  );
}

function Td({ children, ...props }: { children?: ReactNode; className?: string }) {
  return (
    <td className="border border-gray-300 px-3 py-2 text-gray-700" {...props}>
      {children}
    </td>
  );
}

function Hr(props: { className?: string }) {
  return <hr className="my-8 border-gray-200" {...props} />;
}

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  a: A,
  blockquote: Blockquote,
  code: Code,
  pre: Pre,
  table: Table,
  th: Th,
  td: Td,
  hr: Hr,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
