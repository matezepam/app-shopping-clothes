import type { ReactNode } from "react";
import {
  Apple,
  CreditCard,
  DollarSign,
  Smartphone,
  WalletCards,
} from "lucide-react";
import type { PaymentMethod } from "../../pages/shop/CheckoutPage";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: ReactNode;
  gradient: string;
}[] = [
  {
    id: "card",
    label: "Tarjeta",
    description: "Crédito o débito",
    icon: <CreditCard size={24} />,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Pago rápido",
    icon: <WalletCards size={24} />,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "skrill",
    label: "Skrill",
    description: "Billetera digital",
    icon: <DollarSign size={24} />,
    gradient: "from-purple-500 to-fuchsia-600",
  },
  {
    id: "googlePay",
    label: "Google Pay",
    description: "Pago móvil",
    icon: <Smartphone size={24} />,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "applePay",
    label: "Apple Pay",
    description: "Pago seguro",
    icon: <Apple size={24} />,
    gradient: "from-zinc-700 to-black",
  },
];

type PaymentMethodsProps = {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
};

export function PaymentMethods({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodsProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <CreditCard size={24} />
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Forma de pago
          </h2>

          <p className="text-sm font-semibold text-muted-foreground">
            Escoge cómo quieres pagar.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {paymentMethods.map((method) => {
          const active = paymentMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethodChange(method.id)}
              className={`relative overflow-hidden rounded-3xl border p-4 text-left transition ${
                active
                  ? "border-secondary bg-secondary/10 shadow-xl shadow-secondary/20 ring-4 ring-secondary/10"
                  : "border-black/10 bg-white hover:-translate-y-1 hover:border-secondary/40 hover:shadow-lg hover:shadow-black/10"
              }`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${method.gradient} text-white shadow-lg`}
              >
                {method.icon}
              </div>

              <p className="font-display text-base font-bold text-foreground">
                {method.label}
              </p>

              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {method.description}
              </p>

              <span
                className={`absolute right-4 top-4 h-4 w-4 rounded-full border transition ${
                  active
                    ? "border-secondary bg-secondary"
                    : "border-black/20 bg-white"
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}