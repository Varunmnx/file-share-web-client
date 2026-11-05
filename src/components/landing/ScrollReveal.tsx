import { ElementType, HTMLAttributes, ReactNode } from "react";
import { useInView } from "./useInView";

interface ScrollRevealProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  delay?: string;
  as?: ElementType;
  className?: string;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  delay = "0s",
  as: Component = "div",
  className = "",
  threshold = 0.18,
  style,
  ...props
}: ScrollRevealProps) {
  const { ref, isInView } = useInView<HTMLElement>({
    threshold,
    triggerOnce: true,
  });

  return (
    <Component
      ref={ref}
      className={`lp-rv ${isInView ? "lp-in" : ""} ${className}`.trim()}
      style={{
        ...style,
        ...(delay ? ({ "--d": delay } as React.CSSProperties) : {}),
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

