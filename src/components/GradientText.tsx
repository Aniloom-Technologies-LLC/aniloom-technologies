import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function GradientText({ children, className = "" }: Props) {
  return (
    <span className={`gradient-text ${className}`.trim()}>
      <span className="gradient-text__inner">{children}</span>
    </span>
  );
}
