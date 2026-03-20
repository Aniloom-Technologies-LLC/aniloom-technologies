import type { CSSProperties } from "react";

type Props = {
  density?: number;
};

export default function FloatingLines({ density = 10 }: Props) {
  const lines = Array.from({ length: density });

  return (
    <div className="floating-lines" aria-hidden="true">
      {lines.map((_, index) => (
        <span
          key={index}
          className="floating-lines__line"
          style={
            {
              "--line-index": index,
              "--line-offset": `${(index * 100) / density}%`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
