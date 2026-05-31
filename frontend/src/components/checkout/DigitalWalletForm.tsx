import type { PaymentMethod } from "../../pages/shop/CheckoutPage";

type DigitalWalletFormProps = {
  method: Extract<PaymentMethod, "paypal" | "skrill">;
  walletEmail: string;
  onWalletEmailChange: (value: string) => void;
};

export function DigitalWalletForm({
  method,
  walletEmail,
  onWalletEmailChange,
}: DigitalWalletFormProps) {
  return (
    <label className="block text-sm font-bold text-foreground">
      Correo electrónico de {method === "paypal" ? "PayPal" : "Skrill"}
      <input
        value={walletEmail}
        onChange={(event) => onWalletEmailChange(event.target.value)}
        type="email"
        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-semibold outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
        placeholder="correo@ejemplo.com"
        required
      />
    </label>
  );
}