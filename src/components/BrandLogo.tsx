const BRAND_ICON_SRC = "/Quantuver Icon.png";

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** Decorative by default; pass alt text when the mark needs to be announced. */
  alt?: string;
  /** Image loading strategy: defaults to 'lazy'. */
  loading?: "lazy" | "eager";
};

export default function BrandLogo({
  size = 32,
  className = "",
  alt = "",
  loading = "lazy",
}: BrandLogoProps) {
  return (
    <img
      src={BRAND_ICON_SRC}
      alt={alt}
      width={size}
      height={size}
      className={`brand-logo${className ? ` ${className}` : ""}`}
      draggable={false}
      decoding="async"
      loading={loading}
    />
  );
}

export { BRAND_ICON_SRC };
