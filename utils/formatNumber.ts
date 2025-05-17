// utils/formatNumber.ts

export function formatNumber(number: number): string {
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });
  return formatter.format(number);
}
