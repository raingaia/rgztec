export type Status = "Paid" | "Pending" | "Failed" | "Active" | "Draft" | "Archived";

export default function StatusPill({ status }: { status: Status }) {
  const cls =
    status === "Paid" || status === "Active"
      ? "ok"
      : status === "Failed" || status === "Archived"
        ? "fail"
        : "";

  return (
    <span className={`status ${cls}`}>
      <span className="s-dot" />
      {status}
    </span>
  );
}
