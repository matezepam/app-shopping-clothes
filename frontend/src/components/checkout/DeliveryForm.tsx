import { Home, MapPin, Phone } from "lucide-react";

type DeliveryFormProps = {
  mainAddress: string;
  optionalAddress: string;
  phone: string;
  onMainAddressChange: (value: string) => void;
  onOptionalAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export function DeliveryForm({
  mainAddress,
  optionalAddress,
  phone,
  onMainAddressChange,
  onOptionalAddressChange,
  onPhoneChange,
}: DeliveryFormProps) {
  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <MapPin size={24} />
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Datos de entrega
          </h2>

          <p className="text-sm font-semibold text-muted-foreground">
            Esta información será usada para enviar tu pedido.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="block text-sm font-bold text-foreground">
          Dirección principal
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-muted px-4 py-3 transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
            <Home size={19} className="shrink-0 text-muted-foreground" />
            <input
              value={mainAddress}
              onChange={(event) => onMainAddressChange(event.target.value)}
              className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
              placeholder="Ej: Av. Principal, casa 12, ciudad"
              required
            />
          </div>
        </label>

        <label className="block text-sm font-bold text-foreground">
          Referencia o dirección adicional
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-muted px-4 py-3 transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
            <MapPin size={19} className="shrink-0 text-muted-foreground" />
            <input
              value={optionalAddress}
              onChange={(event) => onOptionalAddressChange(event.target.value)}
              className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
              placeholder="Opcional: cerca del parque, piso, departamento"
            />
          </div>
        </label>

        <label className="block text-sm font-bold text-foreground">
          Número de teléfono
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-muted px-4 py-3 transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
            <Phone size={19} className="shrink-0 text-muted-foreground" />
            <input
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              inputMode="tel"
              className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
              placeholder="Ej: 0987654321"
              required
            />
          </div>
        </label>
      </div>
    </div>
  );
}