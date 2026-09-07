import { splitDois } from "@/lib/research/literature";

export function DoiText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = splitDois(text);
  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.href ? (
          <a
            key={`${part.href}-${index}`}
            href={part.href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#1B1464] underline decoration-[#1B1464]/40 underline-offset-2 hover:decoration-[#1B1464]"
          >
            {part.text}
          </a>
        ) : (
          <span key={`t-${index}`}>{part.text}</span>
        ),
      )}
    </span>
  );
}
