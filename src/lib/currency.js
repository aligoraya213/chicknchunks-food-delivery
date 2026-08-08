export const CURRENCY_SYMBOL = 'Rs.';
export const CURRENCY_CODE = 'PKR';

export function formatPrice(amount) {
  return `${CURRENCY_SYMBOL} ${Number(amount).toFixed(2)}`;
}
