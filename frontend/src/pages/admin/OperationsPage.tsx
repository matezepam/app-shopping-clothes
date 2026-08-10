import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  BarChart3,
  Boxes,
  ClipboardCheck,
  DollarSign,
  PackagePlus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import {
  api,
  type AdminReturnRow,
  type AdminStats,
  type CategoryRow,
  type CustomerRow,
  type InventoryRow,
  type ModerationRow,
  type SupplierRow,
} from "../../lib/api";
import { useStore } from "../../context/StoreContext";
import type { Order } from "../../types/store";

const orderTransitions: Record<string, string[]> = {
  PENDING_WHATSAPP: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

const statusLabels: Record<string, string> = {
  PENDING_WHATSAPP: "Pendiente de WhatsApp",
  CONFIRMED: "Confirmado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REQUESTED: "Solicitada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  RECEIVED: "Recibida",
  PENDING: "Pendiente",
  OBSERVED: "Observado",
};

function Panel({ title, subtitle, icon, children, className = "" }: { title: string; subtitle?: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`surface-card overflow-hidden ${className}`}>
      <div className="flex items-start gap-3 border-b border-black/5 px-6 py-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-primary">{icon}</span>
        <div>
          <h2 className="font-display text-xl font-black">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 px-5 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status.includes("CANCEL") || status.includes("REJECT")
    ? "bg-red-50 text-red-700"
    : status.includes("PENDING") || status.includes("REQUEST") || status.includes("OBSERVED")
      ? "bg-amber-50 text-amber-800"
      : "bg-emerald-50 text-emerald-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${tone}`}>{statusLabels[status] ?? status}</span>;
}

export function OperationsPage() {
  const { token, user, catalog, refreshProducts } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [movements, setMovements] = useState<InventoryRow[]>([]);
  const [moderation, setModeration] = useState<ModerationRow[]>([]);
  const [returns, setReturns] = useState<AdminReturnRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [supplier, setSupplier] = useState({ name: "", taxId: "", email: "", phone: "" });
  const [movement, setMovement] = useState({ productId: "", type: "ENTRY", quantity: 1, reference: "" });
  const isAdmin = user?.roles.includes("ADMIN") ?? false;

  const load = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setMessage("");
    try {
      const [s, o, c, p, i, m, r, u] = await Promise.all([
        api.adminStats(token), api.adminOrders(token), api.adminCategories(token), api.suppliers(token),
        api.inventory(token), api.moderation(token), api.adminReturns(token), api.customers(token),
      ]);
      setStats(s); setOrders(o.orders); setCategories(c.categories); setSuppliers(p.suppliers);
      setMovements(i.movements); setModeration(m.products); setReturns(r.returns); setCustomers(u.customers);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar las operaciones");
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  useEffect(() => { void load(); }, [load]);

  const runAction = async (key: string, action: () => Promise<void>) => {
    setBusyAction(key); setMessage("");
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "La operación no pudo completarse"); }
    finally { setBusyAction(""); }
  };

  const statCards = useMemo(() => stats ? [
    { label: "Pedidos", value: stats.summary.ordersCount, icon: <ShoppingBag size={20} /> },
    { label: "Ingresos", value: `USD ${stats.summary.revenueUsd}`, icon: <DollarSign size={20} /> },
    { label: "Unidades", value: stats.summary.unitsSold, icon: <Boxes size={20} /> },
    { label: "Devoluciones", value: stats.summary.returnsPending, icon: <RotateCcw size={20} /> },
    { label: "Stock bajo", value: stats.summary.lowStockProducts, icon: <AlertCircle size={20} /> },
  ] : [], [stats]);

  async function createCategory(event: FormEvent) {
    event.preventDefault(); if (!token) return;
    await runAction("category", async () => { await api.createCategory(token, { name: categoryName.trim() }); setCategoryName(""); await load(); });
  }
  async function createSupplier(event: FormEvent) {
    event.preventDefault(); if (!token) return;
    await runAction("supplier", async () => { await api.createSupplier(token, { ...supplier, status: "ACTIVE", productIds: [] }); setSupplier({ name: "", taxId: "", email: "", phone: "" }); await load(); });
  }
  async function createMovement(event: FormEvent) {
    event.preventDefault(); if (!token) return;
    await runAction("movement", async () => { await api.inventoryMovement(token, movement); setMovement({ productId: "", type: "ENTRY", quantity: 1, reference: "" }); await refreshProducts(); await load(); });
  }
  const changeOrder = (id: string, status: string) => token && runAction(`order-${id}`, async () => { await api.adminOrderPatch(token, id, status); await load(); });
  const moderate = (productId: string, decision: string) => {
    if (!token) return;
    const note = decision === "APPROVED" ? undefined : window.prompt("Escribe el motivo de la decisión")?.trim();
    if (decision !== "APPROVED" && !note) return;
    void runAction(`moderation-${productId}`, async () => { await api.moderate(token, productId, decision, note); await refreshProducts(); await load(); });
  };
  const changeReturn = (id: string, status: string) => {
    if (!token) return;
    const note = window.prompt("Nota administrativa (opcional)")?.trim();
    void runAction(`return-${id}`, async () => { await api.adminReturnPatch(token, id, { status, adminNote: note }); await load(); });
  };
  const toggleCustomer = (id: number, enabled: boolean) => token && runAction(`customer-${id}`, async () => { await api.customerStatus(token, id, enabled); await load(); });

  return (
    <div className="space-y-7 pb-10">
      <header className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 px-7 py-9 text-white shadow-2xl shadow-black/15 md:px-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-primary">Centro de operaciones</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-black tracking-tight md:text-5xl">Control diario, sin perder el contexto</h1>
            <p className="mt-4 max-w-2xl leading-7 text-white/65">Inventario, pedidos, clientes y moderación conectados al backend en una sola vista.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:opacity-60">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Actualizar datos
          </button>
        </div>
      </header>

      {message ? <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertCircle className="mt-0.5 shrink-0" size={18} /><span>{message}</span></div> : null}

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading && !stats ? Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-[2rem] bg-black/5" />) : statCards.map((item) => (
          <article key={item.label} className="surface-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-neutral-950">{item.icon}</span>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-neutral-400">{item.label}</p>
            <p className="mt-1 font-display text-2xl font-black">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Nueva categoría" subtitle={`${categories.length} registradas`} icon={<ClipboardCheck size={20} />}>
          <form onSubmit={createCategory} className="space-y-3">
            <label className="block text-sm font-bold" htmlFor="category-name">Nombre</label>
            <input id="category-name" required maxLength={80} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Ej. Accesorios" className="field-control" />
            <button disabled={busyAction === "category"} className="primary-action w-full">{busyAction === "category" ? "Guardando…" : "Guardar categoría"}</button>
          </form>
        </Panel>

        <Panel title="Nuevo proveedor" subtitle={`${suppliers.length} activos o registrados`} icon={<Truck size={20} />}>
          <form onSubmit={createSupplier} className="space-y-3">
            {([['name','Nombre comercial','text'],['taxId','RUC o identificación','text'],['email','Correo','email'],['phone','Teléfono','tel']] as const).map(([key,label,type]) => (
              <div key={key}><label htmlFor={`supplier-${key}`} className="sr-only">{label}</label><input id={`supplier-${key}`} type={type} required={key === 'name' || key === 'taxId'} value={supplier[key]} onChange={(e) => setSupplier({ ...supplier, [key]: e.target.value })} placeholder={label} className="field-control" /></div>
            ))}
            <button disabled={busyAction === "supplier"} className="primary-action w-full">{busyAction === "supplier" ? "Guardando…" : "Guardar proveedor"}</button>
          </form>
        </Panel>

        <Panel title="Movimiento de inventario" subtitle="Cada cambio queda trazado" icon={<PackagePlus size={20} />}>
          <form onSubmit={createMovement} className="space-y-3">
            <label htmlFor="movement-product" className="sr-only">Producto</label>
            <select id="movement-product" required value={movement.productId} onChange={(e) => setMovement({ ...movement, productId: e.target.value })} className="field-control"><option value="">Selecciona un producto</option>{catalog.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-3">
              <label className="sr-only" htmlFor="movement-type">Tipo</label><select id="movement-type" value={movement.type} onChange={(e) => setMovement({ ...movement, type: e.target.value })} className="field-control"><option value="ENTRY">Entrada</option><option value="EXIT">Salida</option><option value="ADJUSTMENT">Ajuste</option></select>
              <label className="sr-only" htmlFor="movement-quantity">Cantidad</label><input id="movement-quantity" aria-label="Cantidad" type="number" min={1} value={movement.quantity} onChange={(e) => setMovement({ ...movement, quantity: Number(e.target.value) })} className="field-control" />
            </div>
            <label className="sr-only" htmlFor="movement-reference">Referencia</label><input id="movement-reference" value={movement.reference} onChange={(e) => setMovement({ ...movement, reference: e.target.value })} placeholder="Referencia o motivo" className="field-control" />
            <button disabled={busyAction === "movement"} className="primary-action w-full">{busyAction === "movement" ? "Registrando…" : "Registrar movimiento"}</button>
          </form>
        </Panel>
      </section>

      <Panel title="Pedidos y seguimiento" subtitle={`${orders.length} pedidos disponibles`} icon={<Boxes size={20} />}>
        {orders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead><tr className="border-b border-black/10 text-left text-xs uppercase tracking-wider text-neutral-400"><th className="px-3 py-3">Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Próximo paso</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-black/5 last:border-0"><td className="px-3 py-4 font-mono font-bold">#{order.id.slice(0,8)}</td><td>{new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</td><td className="font-black">USD {order.totalUsd}</td><td><StatusBadge status={order.status} /></td><td><div className="flex flex-wrap gap-2">{orderTransitions[order.status]?.map((status) => <button key={status} disabled={busyAction === `order-${order.id}`} onClick={() => void changeOrder(order.id,status)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-bold transition hover:border-accent hover:text-accent disabled:opacity-50">{statusLabels[status] ?? status}</button>) ?? <span className="text-muted-foreground">Sin acciones pendientes</span>}</div></td></tr>)}</tbody></table></div> : <EmptyState>No hay pedidos para mostrar.</EmptyState>}
      </Panel>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Devoluciones" subtitle="Revisión y recepción con restitución de stock" icon={<RotateCcw size={20} />}>
          <div className="space-y-3">{returns.length ? returns.map((item) => <article key={item.id} className="rounded-2xl bg-neutral-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{item.userEmail}</p><p className="mt-1 text-sm text-muted-foreground">{item.quantity} × {item.productId} · {item.reason}</p></div><StatusBadge status={item.status} /></div><div className="mt-3 flex flex-wrap gap-2">{item.status === "REQUESTED" ? <><button disabled={busyAction === `return-${item.id}`} onClick={() => changeReturn(item.id,"APPROVED")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white">Aprobar</button><button disabled={busyAction === `return-${item.id}`} onClick={() => changeReturn(item.id,"REJECTED")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white">Rechazar</button></> : null}{item.status === "APPROVED" ? <button disabled={busyAction === `return-${item.id}`} onClick={() => changeReturn(item.id,"RECEIVED")} className="rounded-lg bg-accent px-3 py-2 text-xs font-black text-white">Marcar recibida</button> : null}</div></article>) : <EmptyState>No hay devoluciones pendientes.</EmptyState>}</div>
        </Panel>

        <Panel title="Clientes" subtitle={`${customers.length} perfiles`} icon={<Users size={20} />}>
          <div className="grid gap-3 sm:grid-cols-2">{customers.length ? customers.map((customer) => <article key={customer.id} className="rounded-2xl bg-neutral-50 p-4"><p className="truncate font-black">{customer.firstName} {customer.lastName}</p><p className="mt-1 truncate text-sm text-muted-foreground">{customer.email}</p><button disabled={busyAction === `customer-${customer.id}`} onClick={() => void toggleCustomer(customer.id,!customer.enabled)} className={`mt-4 rounded-full px-3 py-1.5 text-xs font-black ${customer.enabled ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{customer.enabled ? "Cuenta activa" : "Cuenta deshabilitada"}</button></article>) : <EmptyState>No hay clientes registrados.</EmptyState>}</div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Cola de moderación" subtitle="Publicaciones que requieren decisión" icon={<ShieldCheck size={20} />}>
          <div className="space-y-3">{moderation.length ? moderation.map((product) => <article key={product.productId} className="rounded-2xl bg-neutral-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-black">{product.name}</p><StatusBadge status={product.status} /></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={busyAction === `moderation-${product.productId}`} onClick={() => moderate(product.productId,"APPROVED")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white">Aprobar</button><button disabled={busyAction === `moderation-${product.productId}`} onClick={() => moderate(product.productId,"OBSERVED")} className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-black text-neutral-950">Observar</button><button disabled={busyAction === `moderation-${product.productId}`} onClick={() => moderate(product.productId,"REJECTED")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white">Rechazar</button></div></article>) : <EmptyState>La cola está al día.</EmptyState>}</div>
        </Panel>

        <Panel title="Últimos movimientos" subtitle="Trazabilidad de inventario" icon={<BarChart3 size={20} />}>
          <ul className="space-y-2">{movements.length ? movements.slice(0,10).map((item) => <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 px-4 py-3 text-sm"><span className="min-w-0 truncate"><b>{item.type}</b> · {item.productName}</span><span className="shrink-0 font-black">{item.quantity} → {item.resultingStock}</span></li>) : <EmptyState>Aún no hay movimientos registrados.</EmptyState>}</ul>
        </Panel>
      </section>
    </div>
  );
}
