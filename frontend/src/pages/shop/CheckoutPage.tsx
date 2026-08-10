import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, LockKeyhole, MessageCircle, ShoppingBag } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { formatMoney } from "../../lib/currency";
import type { Order } from "../../types/store";

export function CheckoutPage() {
  const { user, cart, catalog, currency, checkout } = useStore();
  const [address, setAddress] = useState(user?.currentLocation ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const lines = useMemo(() => cart.map(item => ({ item, product: catalog.find(p => p.id === item.productId) })).filter(x => x.product), [cart, catalog]);
  const total = lines.reduce((sum, x) => sum + (x.product?.priceUsd ?? 0) * x.item.quantity, 0);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!address.trim() || !phone.trim()) { setError("La dirección y el teléfono son obligatorios."); return; }
    setSaving(true);
    try { setOrder(await checkout({ shippingAddress: address, contactPhone: phone })); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo crear la solicitud"); }
    finally { setSaving(false); }
  }

  if (!user) return <section className="mx-auto max-w-xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center"><LockKeyhole className="mx-auto"/><h1 className="mt-4 text-2xl font-black">Inicia sesión para continuar</h1><Link to="/login" className="mt-5 inline-block rounded-full bg-neutral-950 px-6 py-3 font-bold text-white">Iniciar sesión</Link></section>;
  if (order) return <section className="mx-auto max-w-2xl rounded-[2rem] border bg-white p-8 text-center shadow-xl"><CheckCircle2 size={52} className="mx-auto text-emerald-600"/><h1 className="mt-4 text-3xl font-black">Solicitud registrada</h1><p className="mt-2 text-neutral-600">El inventario fue reservado y la solicitud {order.id} quedó guardada. Finaliza el contacto comercial por el canal oficial.</p><a href={order.whatsappUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-black text-white"><MessageCircle/>Continuar en WhatsApp</a><Link to="/history" className="mt-4 block font-bold text-accent">Ver seguimiento</Link></section>;
  if (!lines.length) return <section className="mx-auto max-w-xl rounded-[2rem] border bg-white p-8 text-center"><ShoppingBag className="mx-auto"/><h1 className="mt-4 text-2xl font-black">Tu carrito está vacío</h1><Link to="/" className="mt-5 inline-block font-bold text-accent">Ir al catálogo</Link></section>;

  return <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
    <section className="rounded-[2rem] border bg-white p-6 shadow-sm"><h1 className="text-3xl font-black">Confirmar solicitud</h1><p className="mt-2 text-sm text-neutral-500">No se procesan tarjetas. El backend valida precios y existencias; luego genera el contacto oficial por WhatsApp.</p>
      <label className="mt-6 block text-sm font-bold">Dirección de entrega<textarea required rows={3} value={address} onChange={e=>setAddress(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3"/></label>
      <label className="mt-4 block text-sm font-bold">Teléfono de contacto<input required value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3"/></label>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </section>
    <aside className="rounded-[2rem] bg-[#0a0f1a] p-6 text-white shadow-xl"><h2 className="text-xl font-black">Resumen</h2><ul className="mt-5 space-y-4">{lines.map(({item,product}) => <li key={item.productId} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {product!.name}</span><b>{formatMoney(product!.priceUsd * item.quantity, currency)}</b></li>)}</ul><div className="mt-6 flex justify-between border-t border-white/20 pt-5 text-lg"><b>Total</b><b>{formatMoney(total,currency)}</b></div><button disabled={saving} className="mt-6 w-full rounded-full bg-primary px-5 py-3 font-black text-neutral-950 disabled:opacity-50">{saving ? "Registrando…" : "Registrar y continuar"}</button></aside>
  </form>;
}
