export function formatLKR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-LK', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `LKR ${formatted}`;
}
