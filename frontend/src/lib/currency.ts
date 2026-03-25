import type { CurrencyCode } from "../types/store";

/** Tipos de cambio de demostración; conecta a un API real en producción. */
export const FX_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function fromUsd(usd: number, currency: CurrencyCode): number {
  return usd * FX_TO_USD[currency];
}
