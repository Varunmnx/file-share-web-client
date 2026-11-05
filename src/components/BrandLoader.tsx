import BrandLogo from "./BrandLogo";

export type BrandLoaderProps = {
  /** Size of the brand icon in pixels. Default is 48. */
  size?: number;
  /** Whether to render as a full-screen fixed overlay. */
  fullScreen?: boolean;
  /** Optional loading message displayed below the brand icon. */
  message?: string;
  /** Additional CSS class names. */
  className?: string;
};

/**
 * BrandLoader: Displays the brand icon with an animated spinner ring
 * pinned to its bottom-right corner. Used for page transitions,
 * route Suspense fallbacks, and full-screen loading states.
 */
export default function BrandLoader({
  size = 48,
  fullScreen = false,
  message,
  className = "",
}: BrandLoaderProps) {
  const content = (
    <div className={`brand-loader-container${className ? ` ${className}` : ""}`}>
      <span
        className="brand-loader"
        style={{ width: size, height: size }}
        role="status"
        aria-label={message || "Loading"}
      >
        <BrandLogo size={size} />
        <span className="brand-loader-ring" aria-hidden="true" />
      </span>
      {message && <p className="brand-loader-text">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="brand-loader-page" role="status" aria-live="polite">
        {content}
      </div>
    );
  }

  return content;
}

