import { marked } from "marked";

interface Props {
  markdown: string;
}

export function NarrativeView({ markdown }: Props) {
  const html = marked.parse(markdown) as string;
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="prose prose-slate max-w-none"
    />
  );
}
