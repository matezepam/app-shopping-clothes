import { ShieldCheck } from "lucide-react";
import { formatMoney, fromUsd, type CurrencyCode } from "../../lib/currency";

type OrderSummaryProps = {
  lines: {
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      image: string;
      priceUsd: number;
    };
  }[];
  currency: CurrencyCode;
};

export function OrderSummary({ lines, currency }: OrderSummaryProps) {
  const subtotalUsd = lines.reduce(
    (sum, line) => sum + line.product.priceUsd * line.quantity,
    0,
  );

  const shippingUsd = lines.length > 0 ? 6.5 : 0;
  const totalUsd = subtotalUsd + shippingUsd;

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5">
      <h2 className="font-display text-2xl font-bold text-foreground">
        Resumen
      </h2>

      <div className="mt-5 space-y-4">
        {lines.map((line) => (
          <div key={line.productId} className="flex gap-3">
            <img
              src={line.product.image}
              alt={line.product.name}
              className="h-16 w-16 rounded-2xl object-cover ring-1 ring-black/10"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {line.product.name}
              </p>

              <p className="text-xs font-semibold text-muted-foreground">
                Cantidad: {line.quantity}
              </p>
            </div>

            <p className="text-sm font-bold text-secondary">
              {formatMoney(
                fromUsd(line.product.priceUsd * line.quantity, currency),
                currency,
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-black/10 pt-5">
        <div className="flex justify-between text-sm font-semibold text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatMoney(fromUsd(subtotalUsd, currency), currency)}</span>
        </div>

        <div className="flex justify-between text-sm font-semibold text-muted-foreground">
          <span>Envío</span>
          <span>{formatMoney(fromUsd(shippingUsd, currency), currency)}</span>
        </div>

        <div className="flex items-center justify-between text-lg">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-display text-3xl font-bold text-accent">
            {formatMoney(fromUsd(totalUsd, currency), currency)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />

        <p className="text-xs font-semibold leading-5">
          Compra protegida. Tus datos serán usados únicamente para procesar tu pedido.
        </p>
      </div>
    </div>
  );
}