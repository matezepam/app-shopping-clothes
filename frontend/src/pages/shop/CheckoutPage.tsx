import { useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { DeliveryForm } from "../../components/checkout/DeliveryForm";
import { PaymentMethods } from "../../components/checkout/PaymentMethods";
import { CardPaymentForm } from "../../components/checkout/CardPaymentForm";
import { DigitalWalletForm } from "../../components/checkout/DigitalWalletForm";
import { MobilePaymentBox } from "../../components/checkout/MobilePaymentBox";
import { OrderSummary } from "../../components/checkout/OrderSummary";

export type PaymentMethod = "card" | "paypal" | "skrill" | "googlePay" | "applePay";

export function CheckoutPage() {
  const {
    cart,
    catalog,
    currency,
    checkout: placeOrder,
    user,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [mainAddress, setMainAddress] = useState("");
  const [optionalAddress, setOptionalAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [walletEmail, setWalletEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const lines = cart
    .map((item) => {
      const product = catalog.find((productItem) => productItem.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as {
    productId: string;
    quantity: number;
    product: (typeof catalog)[0];
  }[];

  const validateForm = () => {
    if (!user) return "Inicia sesión para finalizar tu compra.";
    if (lines.length === 0) return "Tu carrito está vacío.";
    if (!mainAddress.trim()) return "Ingresa tu dirección principal.";
    if (!phone.trim()) return "Ingresa tu número de teléfono.";

    if (paymentMethod === "card") {
      if (!cardName.trim()) return "Ingresa el nombre del titular de la tarjeta.";
      if (cardNumber.replace(/\D/g, "").length < 16) return "Ingresa un número de tarjeta válido.";
      if (cardExpiry.length < 5) return "Ingresa la fecha de vencimiento.";
      if (cardCvv.length < 3) return "Ingresa el CVV.";
    }

    if ((paymentMethod === "paypal" || paymentMethod === "skrill") && !walletEmail.trim()) {
      return "Ingresa el correo de tu billetera digital.";
    }

    return null;
  };

  async function onCheckout() {
    setErr(null);
    setOk(null);

    const validationError = validateForm();

    if (validationError) {
      setErr(validationError);
      return;
    }

    try {
      const order = await placeOrder();
      setOk(order.id);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Ocurrió un error. Inténtalo nuevamente.");
    }
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center text-amber-900 shadow-xl shadow-black/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-200/60">
          <LockKeyhole size={28} />
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold">
          Inicia sesión para continuar
        </h1>

        <p className="mt-2 text-sm leading-6">
          Para finalizar tu compra necesitas acceder a tu cuenta.
        </p>

        <Link
          to="/login?mode=login"
          className="mt-6 inline-flex rounded-2xl bg-[#0a0f1a] px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-xl shadow-black/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShoppingBag size={28} />
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold text-foreground">
          Tu carrito está vacío
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Agrega productos antes de continuar al checkout.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
        >
          Ir a comprar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-[2rem] border border-black/10 bg-white p-5 shadow-lg shadow-black/5 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-secondary"
          >
            <ArrowLeft size={17} />
            Volver al carrito
          </Link>

          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Finalizar compra
          </h1>

          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Completa tus datos de entrega y forma de pago.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
          Compra segura
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onCheckout();
        }}
        className="grid gap-6 lg:grid-cols-[1fr_390px]"
      >
        <section className="space-y-6">
          <DeliveryForm
            mainAddress={mainAddress}
            optionalAddress={optionalAddress}
            phone={phone}
            onMainAddressChange={setMainAddress}
            onOptionalAddressChange={setOptionalAddress}
            onPhoneChange={setPhone}
          />

          <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
            <PaymentMethods
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />

            <div className="mt-6 rounded-[1.5rem] border border-black/10 bg-gradient-to-br from-muted to-white p-4">
              {paymentMethod === "card" ? (
                <CardPaymentForm
                  cardName={cardName}
                  cardNumber={cardNumber}
                  cardExpiry={cardExpiry}
                  cardCvv={cardCvv}
                  onCardNameChange={setCardName}
                  onCardNumberChange={setCardNumber}
                  onCardExpiryChange={setCardExpiry}
                  onCardCvvChange={setCardCvv}
                />
              ) : paymentMethod === "paypal" || paymentMethod === "skrill" ? (
                <DigitalWalletForm
                  method={paymentMethod}
                  walletEmail={walletEmail}
                  onWalletEmailChange={setWalletEmail}
                />
              ) : (
                <MobilePaymentBox method={paymentMethod} />
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <OrderSummary
            lines={lines}
            currency={currency}
          />

          {err ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {err}
            </p>
          ) : null}

          {ok ? (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <div className="flex gap-2">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Pedido realizado correctamente: {ok}</span>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-accent py-4 text-sm font-bold text-white shadow-xl shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-secondary"
          >
            Finalizar compra
          </button>
        </aside>
      </form>
    </div>
  );
}