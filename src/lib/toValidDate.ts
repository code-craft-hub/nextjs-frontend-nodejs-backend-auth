export function toValidDate(
  value?: string | Date | null,
  type: "month" | "date" = "date"
): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return new Date().toISOString().slice(0, 7);

  if (type === "month") {
    // Format: YYYY-MM
    return date.toISOString().slice(0, 7);
  }

  // Format: YYYY-MM-DD
  return date.toISOString().split("T")[0];
}