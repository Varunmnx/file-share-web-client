interface AlertProps {
  type?: "error" | "success" | "info";
  children: React.ReactNode;
}

export default function Alert({ type = "info", children }: AlertProps) {
  const icons = { error: "⚠️", success: "✅", info: "ℹ️" };
  return (
    <div className={`alert alert-${type}`}>
      <span>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}
