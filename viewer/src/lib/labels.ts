/** Display helpers for labels that may contain PDF encoding garbage. */
export function isReadableLabel(value: string | null | undefined): boolean {
  if (!value) return false;
  const cleaned = value.replace(/[\u0000-\u001f\u007f-\u009f\ufffd]/g, "").trim();
  if (cleaned.length < 2) return false;
  const readable = (cleaned.match(/[A-Za-z0-9ÄÖÜäöüß\-./()&+,:'"]/g) ?? []).length;
  return readable / cleaned.length >= 0.55;
}

export function displayLabel(
  value: string | null | undefined,
  fallback = "Без названия",
): string {
  if (!isReadableLabel(value)) return fallback;
  return value!.replace(/[\u0000-\u001f\u007f-\u009f\ufffd]/g, "").trim();
}
