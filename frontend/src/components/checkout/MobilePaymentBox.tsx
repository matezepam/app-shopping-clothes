import { Apple, Smartphone } from "lucide-react";
import type { PaymentMethod } from "../../pages/shop/CheckoutPage";

type MobilePaymentBoxProps = {
  method: Extract<PaymentMethod, "googlePay" | "applePay">;
};

export function MobilePaymentBox({ method }: MobilePaymentBoxProps) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          {method === "googlePay" ? <Smartphone size={24} /> : <Apple size={24} />}
        </div>

        <div>
          <p className="font-display text-lg font-bold text-foreground">
            {method === "googlePay" ? "Google Pay listo" : "Apple Pay listo"}
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Confirmarás el pago desde tu dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}