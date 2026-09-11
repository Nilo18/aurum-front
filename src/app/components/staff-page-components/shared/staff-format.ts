export function human(value: unknown): string {
  const text = String(value ?? '');
  return text.includes('_') || text === text.toUpperCase()
    ? text
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/^./, (character) => character.toUpperCase())
    : text;
}
export function currency(value: unknown): string {
  return (
    '₾ ' +
    Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}
