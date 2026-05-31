type CardPaymentFormProps = {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  onCardNameChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardCvvChange: (value: string) => void;
};

export function CardPaymentForm({
  cardName,
  cardNumber,
  cardExpiry,
  cardCvv,
  onCardNameChange,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCvvChange,
}: CardPaymentFormProps) {
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);

    if (cleaned.length <= 2) {
      return cleaned;
    }

    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  };

  return (
    <div className="grid gap-4">
      <label className="block text-sm font-bold text-foreground">
        Nombre del titular
        <input
          value={cardName}
          onChange={(event) => onCardNameChange(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-semibold outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
          placeholder="Ej: Mateo Salazar"
          required
        />
      </label>

      <label className="block text-sm font-bold text-foreground">
        Número de tarjeta
        <input
          value={cardNumber}
          onChange={(event) => onCardNumberChange(formatCardNumber(event.target.value))}
          inputMode="numeric"
          maxLength={19}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-semibold outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
          placeholder="0000 0000 0000 0000"
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-bold text-foreground">
          Vencimiento
          <input
            value={cardExpiry}
            onChange={(event) => onCardExpiryChange(formatExpiry(event.target.value))}
            inputMode="numeric"
            maxLength={5}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-semibold outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
            placeholder="MM/AA"
            required
          />
        </label>

        <label className="block text-sm font-bold text-foreground">
          CVV
          <input
            value={cardCvv}
            onChange={(event) =>
              onCardCvvChange(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            inputMode="numeric"
            maxLength={4}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-semibold outline-none transition placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
            placeholder="123"
            required
          />
        </label>
      </div>
    </div>
  );
}