import BrandLogo from "./BrandLogo";

export type SpinnerProps = {
  size?: number;
  className?: string;
  label?: string;
};

/**
 * Brand loading indicator: the brand mark with an animated spinner ring
 * pinned to its bottom-right corner. Used for button, card, and inline loaders.
 */
export default function Spinner({
  size = 20,
  className = "",
  label = "Loading",
}: SpinnerProps) {
  return (
    <span
      className={`brand-loader${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <BrandLogo size={size} />
      <span className="brand-loader-ring" aria-hidden="true" />
    </span>
  );
}

export { default as BrandLoader } from "./BrandLoader";
