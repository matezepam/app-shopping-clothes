import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, LockKeyhole, MapPin, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { formatMoney } from "../../lib/currency";
import type { Order } from "../../types/store";

const BUSINESS_PHONE_DISPLAY = "+593 93 905 1525";

export function CheckoutPage() {
  const { user, cart, catalog, currency, checkout } = useStore();
  const [address, setAddress] = useState(user?.currentLocation ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const lines = useMemo(
    () => cart.map((item) => ({ item, product: catalog.find((product) => product.id === item.productId) })).filter((line) => line.product),
    [cart, catalog],
  );
  const total = lines.reduce((sum, line) => sum + (line.product?.priceUsd ?? 0) * line.item.quantity, 0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!address.trim() || !phone.trim()) {
      setError("Completa la dirección y el teléfono para continuar.");
      return;
    }
    setSaving(true);
    try {
      setOrder(await checkout({ shippingAddress: address, contactPhone: phone }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo crear la solicitud");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <section className="mx-auto max-w-xl surface-card p-8 text-center"><LockKeyhole className="mx-auto text-accent" /><h1 className="mt-4 text-2xl font-black">Inicia sesión para continuar</h1><p className="mt-2 text-sm text-neutral-500">Tu identidad y tus pedidos se protegen con Amazon Cognito.</p><Link to="/login" className="primary-action mt-5">Iniciar sesión</Link></section>;

  if (order) return <section className="mx-auto max-w-3xl surface-card overflow-hidden text-center shadow-xl"><div className="bg-emerald-600 p-8 text-white"><CheckCircle2 size={56} className="mx-auto" /><h1 className="mt-4 text-3xl font-black">Solicitud registrada correctamente</h1><p className="mx-auto mt-2 max-w-xl text-emerald-50">El inventario quedó reservado y el pedido <span className="font-mono font-bold">{order.id}</span> ya está guardado.</p></div><div className="p-8"><div className="mx-auto max-w-lg rounded-2xl bg-neutral-50 p-5 text-left"><p className="text-xs font-black uppercase tracking-wider text-neutral-400">Último paso</p><p className="mt-2 font-bold text-neutral-950">Confirma la atención con Sprint por WhatsApp</p><p className="mt-1 text-sm text-neutral-500">Número empresarial: {BUSINESS_PHONE_DISPLAY}. El mensaje ya incluye productos, total, dirección y código del pedido.</p></div><a href={order.whatsappUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"><MessageCircle />Abrir WhatsApp empresarial</a><Link to="/history" className="mt-5 block font-bold text-accent">Ver seguimiento del pedido</Link></div></section>;

  if (!lines.length) return <section className="mx-auto max-w-xl surface-card p-8 text-center"><ShoppingBag className="mx-auto text-accent" /><h1 className="mt-4 text-2xl font-black">Tu carrito está vacío</h1><p className="mt-2 text-sm text-neutral-500">Agrega al menos un producto para crear una solicitud.</p><Link to="/" className="primary-action mt-5">Ir al catálogo</Link></section>;

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="rounded-[2rem] bg-neutral-950 p-7 text-white">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Compra segura sin tarjetas</p>
      <h1 className="mt-2 font-display text-3xl font-black">Confirma tu solicitud en tres pasos</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["1", "Datos de entrega"], ["2", "Reserva de inventario"], ["3", "Confirmación por WhatsApp"]].map(([number, label]) => <div key={number} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-black text-neutral-950">{number}</span><span className="text-sm font-bold">{label}</span></div>)}</div>
    </header>

    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="surface-card p-6">
        <h2 className="text-2xl font-black">1. Datos de entrega</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">Verifica estos datos. Sprint usará el teléfono únicamente para coordinar esta solicitud.</p>
        <label className="mt-6 block text-sm font-bold"><span className="flex items-center gap-2"><MapPin size={17} />Dirección de entrega</span><textarea required rows={3} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Calle principal, numeración, ciudad y referencia" className="field-control mt-2" /></label>
        <label className="mt-4 block text-sm font-bold"><span className="flex items-center gap-2"><Phone size={17} />Teléfono de contacto</span><input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ej. +593 99 000 0000" className="field-control mt-2" /></label>
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><b>Canal oficial:</b> WhatsApp empresarial {BUSINESS_PHONE_DISPLAY}. No se solicitan datos de tarjeta.</div>
        {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      </section>

      <aside className="h-fit rounded-[2rem] bg-neutral-950 p-6 text-white shadow-xl lg:sticky lg:top-24">
        <h2 className="text-xl font-black">2. Resumen y reserva</h2>
        <ul className="mt-5 space-y-4">{lines.map(({ item, product }) => <li key={item.productId} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {product!.name}</span><b>{formatMoney(product!.priceUsd * item.quantity, currency)}</b></li>)}</ul>
        <div className="mt-6 flex justify-between border-t border-white/20 pt-5 text-lg"><b>Total</b><b>{formatMoney(total, currency)}</b></div>
        <p className="mt-3 text-xs leading-5 text-white/55">El precio y el stock se validan nuevamente en el servidor. Al continuar, el pedido queda persistido antes de abrir WhatsApp.</p>
        <button disabled={saving} className="mt-6 w-full rounded-xl bg-primary px-5 py-4 font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-50">{saving ? "Validando y registrando…" : "Registrar pedido seguro"}</button>
      </aside>
    </form>
  </div>;
}
