import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardCheck,
  DollarSign,
  Eye,
  History,
  PackagePlus,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  api,
  type AdminReturnRow,
  type AdminStats,
  type CategoryRow,
  type CustomerRow,
  type InventoryRow,
  type ModerationRow,
  type ProductDeletionRow,
  type SupplierRow,
} from "../../lib/api";
import { useStore } from "../../context/StoreContext";
import type { Order, Product } from "../../types/store";

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

function inventoryMovementMeta(type: string) {
  switch (type) {
    case "ENTRY":
    case "IN": return { label: "Entrada de stock", sign: "+", tone: "bg-emerald-100 text-emerald-800", source: "Ingreso registrado por operaciones" };
    case "EXIT":
    case "OUT": return { label: "Salida manual", sign: "−", tone: "bg-red-100 text-red-800", source: "Salida registrada por operaciones" };
    case "ADJUSTMENT": return { label: "Ajuste de inventario", sign: "−", tone: "bg-amber-100 text-amber-900", source: "Corrección registrada por operaciones" };
    case "RESERVE": return { label: "Compra en tienda", sign: "−", tone: "bg-blue-100 text-blue-800", source: "Descuento automático por pedido" };
    case "RELEASE": return { label: "Pedido cancelado", sign: "+", tone: "bg-violet-100 text-violet-800", source: "Reposición automática por cancelación" };
    case "RETURN": return { label: "Devolución recibida", sign: "+", tone: "bg-cyan-100 text-cyan-800", source: "Reposición automática por devolución" };
    default: return { label: type, sign: "", tone: "bg-neutral-100 text-neutral-700", source: "Movimiento registrado" };
  }
}

type NoteAction =
  | { kind: "moderation"; id: string; status: "OBSERVED" | "REJECTED" }
  | { kind: "return"; id: string; status: "APPROVED" | "REJECTED" | "RECEIVED" };

type ManagementDelete =
  | { kind: "category"; id: number; name: string }
  | { kind: "supplier"; id: string; name: string };

export function OperationsPage() {
  const { token, user, refreshProducts } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [movements, setMovements] = useState<InventoryRow[]>([]);
  const [moderationHistory, setModerationHistory] = useState<ModerationRow[]>([]);
  const [adminCatalog, setAdminCatalog] = useState<Product[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<ProductDeletionRow[]>([]);
  const [returns, setReturns] = useState<AdminReturnRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [supplier, setSupplier] = useState({ name: "", taxId: "", email: "", phone: "" });
  const [movement, setMovement] = useState({ productId: "", type: "ENTRY", quantity: 1, supplierId: "", reference: "" });
  const [movementHistoryProductId, setMovementHistoryProductId] = useState("all");
  const [noteAction, setNoteAction] = useState<NoteAction | null>(null);
  const [noteText, setNoteText] = useState("");
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [reviewImageIndex, setReviewImageIndex] = useState(0);
  const [moderationTab, setModerationTab] = useState<"PENDING" | "OBSERVED" | "APPROVED" | "REJECTED" | "HISTORY">("PENDING");
  const [moderationSearch, setModerationSearch] = useState("");
  const [deletionReviewId, setDeletionReviewId] = useState<string | null>(null);
  const [deletionNote, setDeletionNote] = useState("");
  const [deletionTab, setDeletionTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [returnStatusFilter, setReturnStatusFilter] = useState<"ALL" | "REQUESTED" | "APPROVED" | "RECEIVED" | "REJECTED">("ALL");
  const [returnSort, setReturnSort] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [returnSearch, setReturnSearch] = useState("");
  const [categoryEditor, setCategoryEditor] = useState<{ id: number; name: string; parentId: number | null; active: boolean } | null>(null);
  const [supplierEditor, setSupplierEditor] = useState<{ id: string; name: string; taxId: string; email: string; phone: string; status: string; productIds: string[] } | null>(null);
  const [managementDelete, setManagementDelete] = useState<ManagementDelete | null>(null);
  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  const isVendor = user?.roles.includes("VENDOR") ?? false;
  const isModerator = user?.roles.includes("MODERATOR") ?? false;
  const canCommerce = isAdmin || isVendor;
  const canModerate = isAdmin || isModerator;
  const roleLabel = isAdmin ? "Administrador" : isModerator ? "Moderador" : "Vendedor";

  const load = useCallback(async () => {
    if (!token || (!canCommerce && !canModerate)) return;
    setLoading(true);
    setMessage("");
    try {
      const tasks: Promise<void>[] = [];
      if (isAdmin) {
        tasks.push(api.adminStats(token).then(setStats));
        tasks.push(api.customers(token).then((value) => setCustomers(value.customers)));
      }
      if (canCommerce) {
        tasks.push(api.adminOrders(token).then((value) => setOrders(value.orders)));
        tasks.push(api.adminCategories(token).then((value) => setCategories(value.categories)));
        tasks.push(api.suppliers(token).then((value) => setSuppliers(value.suppliers)));
        tasks.push(api.inventory(token).then((value) => setMovements(value.movements)));
        tasks.push(api.adminReturns(token).then((value) => setReturns(value.returns)));
      }
      if (canCommerce || canModerate) {
        tasks.push(api.adminProducts(token).then((value) => setAdminCatalog(value.products)));
        tasks.push(api.productDeletionRequests(token).then((value) => setDeletionRequests(value.requests)));
      }
      if (canModerate) {
        tasks.push(api.moderationHistory(token).then((value) => setModerationHistory(value.products)));
      }
      await Promise.all(tasks);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar las operaciones");
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin, canCommerce, canModerate]);

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

  const approvedInventoryProducts = useMemo(
    () => adminCatalog.filter((product) => product.status !== "disabled" && product.moderationStatus === "APPROVED"),
    [adminCatalog],
  );
  const selectedInventoryProduct = useMemo(
    () => approvedInventoryProducts.find((product) => product.id === movement.productId) ?? null,
    [approvedInventoryProducts, movement.productId],
  );
  const visibleMovements = useMemo(
    () => movementHistoryProductId === "all" ? movements : movements.filter((item) => item.productId === movementHistoryProductId),
    [movements, movementHistoryProductId],
  );
  const inventorySummary = useMemo(() => ({
    products: approvedInventoryProducts.length,
    units: approvedInventoryProducts.reduce((sum, product) => sum + (product.stock ?? 0), 0),
    lowStock: approvedInventoryProducts.filter((product) => (product.stock ?? 0) <= 8).length,
    purchases: movements.filter((item) => item.type === "RESERVE").reduce((sum, item) => sum + item.quantity, 0),
  }), [approvedInventoryProducts, movements]);
  const reviewProduct = useMemo(
    () => adminCatalog.find((product) => product.id === reviewProductId) ?? null,
    [adminCatalog, reviewProductId],
  );
  const reviewImages = reviewProduct
    ? (reviewProduct.images?.length ? reviewProduct.images : [reviewProduct.image]).slice(0, 4)
    : [];
  const deletionCounts = useMemo(() => ({
    PENDING: deletionRequests.filter((request) => request.status === "PENDING").length,
    APPROVED: deletionRequests.filter((request) => request.status === "APPROVED").length,
    REJECTED: deletionRequests.filter((request) => request.status === "REJECTED").length,
    ALL: deletionRequests.length,
  }), [deletionRequests]);
  const visibleDeletionRequests = useMemo(
    () => deletionTab === "ALL" ? deletionRequests : deletionRequests.filter((request) => request.status === deletionTab),
    [deletionRequests, deletionTab],
  );
  const deletionReview = useMemo(
    () => deletionRequests.find((request) => request.id === deletionReviewId) ?? null,
    [deletionRequests, deletionReviewId],
  );
  const moderationCounts = useMemo(() => ({
    PENDING: adminCatalog.filter((product) => product.moderationStatus === "PENDING").length,
    OBSERVED: adminCatalog.filter((product) => product.moderationStatus === "OBSERVED").length,
    APPROVED: adminCatalog.filter((product) => product.moderationStatus === "APPROVED").length,
    REJECTED: adminCatalog.filter((product) => product.moderationStatus === "REJECTED").length,
    HISTORY: moderationHistory.length,
  }), [adminCatalog, moderationHistory]);
  const visibleModerationProducts = useMemo(() => {
    if (moderationTab === "HISTORY") return [];
    const query = moderationSearch.trim().toLowerCase();
    return adminCatalog.filter((product) =>
      product.moderationStatus === moderationTab &&
      (!query || product.name.toLowerCase().includes(query) || (product.sku ?? "").toLowerCase().includes(query)),
    );
  }, [adminCatalog, moderationSearch, moderationTab]);
  const visibleModerationHistory = useMemo(() => {
    const query = moderationSearch.trim().toLowerCase();
    return moderationHistory.filter((event) =>
      !query || event.name.toLowerCase().includes(query) || event.sku.toLowerCase().includes(query),
    );
  }, [moderationHistory, moderationSearch]);
  const visibleCategories = useMemo(
    () => [...categories].sort((left, right) => right.id - left.id),
    [categories],
  );
  const visibleSuppliers = useMemo(
    () => [...suppliers].sort((left, right) => left.name.localeCompare(right.name, "es")),
    [suppliers],
  );
  const returnCounts = useMemo(() => ({
    ALL: returns.length,
    REQUESTED: returns.filter((item) => item.status === "REQUESTED").length,
    APPROVED: returns.filter((item) => item.status === "APPROVED").length,
    RECEIVED: returns.filter((item) => item.status === "RECEIVED").length,
    REJECTED: returns.filter((item) => item.status === "REJECTED").length,
  }), [returns]);
  const visibleReturns = useMemo(() => {
    const query = returnSearch.trim().toLowerCase();
    return returns
      .filter((item) => returnStatusFilter === "ALL" || item.status === returnStatusFilter)
      .filter((item) => {
        const productName = adminCatalog.find((product) => product.id === item.productId)?.name ?? item.productId;
        return !query || [item.userEmail, item.reason, item.orderId, productName].some((value) => value.toLowerCase().includes(query));
      })
      .sort((left, right) => {
        const difference = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        return returnSort === "NEWEST" ? difference : -difference;
      });
  }, [returns, returnStatusFilter, returnSearch, returnSort, adminCatalog]);

  async function createCategory(event: FormEvent) {
    event.preventDefault(); if (!token) return;
    await runAction("category", async () => {
      const response = await api.createCategory(token, { name: categoryName.trim() });
      setCategories((current) => [response.category, ...current.filter((item) => item.id !== response.category.id)]);
      setCategoryName("");
    });
  }
  async function createSupplier(event: FormEvent) {
    event.preventDefault(); if (!token) return;
    await runAction("supplier", async () => {
      const response = await api.createSupplier(token, { ...supplier, status: "ACTIVE", productIds: [] });
      setSuppliers((current) => [response.supplier, ...current.filter((item) => item.id !== response.supplier.id)]);
      setSupplier({ name: "", taxId: "", email: "", phone: "" });
    });
  }
  async function updateCategory(event: FormEvent) {
    event.preventDefault(); if (!token || !categoryEditor) return;
    await runAction(`category-edit-${categoryEditor.id}`, async () => {
      const response = await api.updateCategory(token, categoryEditor.id, { name: categoryEditor.name.trim(), parentId: categoryEditor.parentId, active: categoryEditor.active });
      setCategories((current) => current.map((item) => item.id === response.category.id ? response.category : item));
      setCategoryEditor(null);
    });
  }
  async function updateSupplier(event: FormEvent) {
    event.preventDefault(); if (!token || !supplierEditor) return;
    await runAction(`supplier-edit-${supplierEditor.id}`, async () => {
      const { id, ...payload } = supplierEditor;
      const response = await api.updateSupplier(token, id, payload);
      setSuppliers((current) => current.map((item) => item.id === response.supplier.id ? response.supplier : item));
      setSupplierEditor(null);
    });
  }
  async function confirmManagementDelete() {
    if (!token || !managementDelete) return;
    const target = managementDelete;
    await runAction(`${target.kind}-delete-${target.id}`, async () => {
      if (target.kind === "category") {
        await api.deleteCategory(token, target.id);
        setCategories((current) => current.filter((item) => item.id !== target.id));
      } else {
        await api.deleteSupplier(token, target.id);
        setSuppliers((current) => current.filter((item) => item.id !== target.id));
      }
      setManagementDelete(null);
    });
  }
  async function createMovement(event: FormEvent) {
    event.preventDefault(); if (!token) return;
    await runAction("movement", async () => {
      await api.inventoryMovement(token, { ...movement, supplierId: movement.supplierId || undefined });
      const currentProductId = movement.productId;
      setMovement({ productId: currentProductId, type: "ENTRY", quantity: 1, supplierId: "", reference: "" });
      setMovementHistoryProductId(currentProductId);
      await refreshProducts();
      await load();
    });
  }
  const changeOrder = (id: string, status: string) => token && runAction(`order-${id}`, async () => { await api.adminOrderPatch(token, id, status); await load(); });
  const moderate = (productId: string, decision: string) => {
    if (!token) return;
    if (decision !== "APPROVED") {
      setNoteText("");
      setNoteAction({ kind: "moderation", id: productId, status: decision as "OBSERVED" | "REJECTED" });
      return;
    }
    void runAction(`moderation-${productId}`, async () => {
      await api.moderate(token, productId, decision);
      setReviewProductId(null);
      await refreshProducts();
      await load();
    });
  };
  const changeReturn = (id: string, status: string) => {
    if (!token) return;
    setNoteText("");
    setNoteAction({ kind: "return", id, status: status as "APPROVED" | "REJECTED" | "RECEIVED" });
  };
  const confirmNoteAction = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !noteAction) return;
    const note = noteText.trim();
    if (noteAction.kind === "moderation" && !note) return;
    const action = noteAction;
    setNoteAction(null);
    setNoteText("");
    if (action.kind === "moderation") {
      await runAction(`moderation-${action.id}`, async () => {
        await api.moderate(token, action.id, action.status, note);
        setReviewProductId(null);
        await refreshProducts();
        await load();
      });
      return;
    }
    await runAction(`return-${action.id}`, async () => { await api.adminReturnPatch(token, action.id, { status: action.status, adminNote: note || undefined }); await load(); });
  };
  const toggleCustomer = (id: number, enabled: boolean) => token && runAction(`customer-${id}`, async () => { await api.customerStatus(token, id, enabled); await load(); });
  const resolveDeletion = (decision: "APPROVED" | "REJECTED") => {
    if (!token || !deletionReview) return;
    const note = deletionNote.trim();
    if (decision === "REJECTED" && !note) return;
    void runAction(`deletion-${deletionReview.id}`, async () => {
      await api.resolveProductDeletion(token, deletionReview.id, decision, note || undefined);
      setDeletionReviewId(null);
      setDeletionNote("");
      await refreshProducts();
      await load();
    });
  };

  return (
    <div className="space-y-7 pb-10">
      <header className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 px-7 py-9 text-white shadow-2xl shadow-black/15 md:px-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-primary">Centro de operaciones · {roleLabel}</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-black tracking-tight md:text-5xl">Control diario, sin perder el contexto</h1>
            <p className="mt-4 max-w-2xl leading-7 text-white/65">Inventario, pedidos, clientes y moderación conectados al backend en una sola vista.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:opacity-60">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Actualizar datos
          </button>
        </div>
      </header>

      {message ? <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertCircle className="mt-0.5 shrink-0" size={18} /><span>{message}</span></div> : null}

      {isAdmin ? <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading && !stats ? Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-[2rem] bg-black/5" />) : statCards.map((item) => (
          <article key={item.label} className="surface-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-neutral-950">{item.icon}</span>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-neutral-400">{item.label}</p>
            <p className="mt-1 font-display text-2xl font-black">{item.value}</p>
          </article>
        ))}
      </section> : null}

      {canCommerce ? <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Nueva categoría" subtitle={`${categories.length} registradas`} icon={<ClipboardCheck size={20} />}>
          <form onSubmit={createCategory} className="space-y-3">
            <label className="block text-sm font-bold" htmlFor="category-name">Nombre</label>
            <input id="category-name" required maxLength={80} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Ej. Accesorios" className="field-control" />
            <button disabled={busyAction === "category"} className="primary-action w-full">{busyAction === "category" ? "Guardando…" : "Guardar categoría"}</button>
          </form>
          <div className="mt-6 border-t border-black/10 pt-5">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-display text-base font-black">Categorías guardadas</h3><p className="mt-1 text-xs text-muted-foreground">La última categoría agregada aparece primero.</p></div><span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-black text-white">{categories.length}</span></div>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">{visibleCategories.length ? visibleCategories.map((category) => <article key={category.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-neutral-50 px-4 py-3"><div className="min-w-0"><p className="truncate font-black">{category.name}</p><p className="mt-1 truncate font-mono text-xs text-neutral-500">{category.slug}</p></div><div className="flex shrink-0 items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${category.active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"}`}>{category.active ? "Activa" : "Inactiva"}</span><button type="button" title="Editar categoría" aria-label={`Editar ${category.name}`} onClick={() => setCategoryEditor({ id: category.id, name: category.name, parentId: category.parentId, active: category.active })} className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"><Pencil size={15} /></button>{isAdmin ? <button type="button" title="Eliminar categoría" aria-label={`Eliminar ${category.name}`} onClick={() => setManagementDelete({ kind: "category", id: category.id, name: category.name })} className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"><Trash2 size={15} /></button> : null}</div></article>) : <EmptyState>No hay categorías guardadas.</EmptyState>}</div>
          </div>
        </Panel>

        <Panel title="Nuevo proveedor" subtitle={`${suppliers.length} activos o registrados`} icon={<Truck size={20} />}>
          <form onSubmit={createSupplier} className="space-y-3">
            {([['name','Nombre comercial','text'],['taxId','RUC o identificación','text'],['email','Correo','email'],['phone','Teléfono','tel']] as const).map(([key,label,type]) => (
              <div key={key}><label htmlFor={`supplier-${key}`} className="sr-only">{label}</label><input id={`supplier-${key}`} type={type} required={key === 'name' || key === 'taxId'} value={supplier[key]} onChange={(e) => setSupplier({ ...supplier, [key]: e.target.value })} placeholder={label} className="field-control" /></div>
            ))}
            <button disabled={busyAction === "supplier"} className="primary-action w-full">{busyAction === "supplier" ? "Guardando…" : "Guardar proveedor"}</button>
          </form>
          <div className="mt-6 border-t border-black/10 pt-5">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-display text-base font-black">Proveedores guardados</h3><p className="mt-1 text-xs text-muted-foreground">Datos disponibles para asociar entradas de inventario.</p></div><span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-black text-white">{suppliers.length}</span></div>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">{visibleSuppliers.length ? visibleSuppliers.map((item) => <article key={item.id} className="rounded-2xl border border-black/5 bg-neutral-50 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{item.name}</p><p className="mt-1 font-mono text-xs text-neutral-500">RUC/ID {item.taxId}</p></div><div className="flex shrink-0 items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"}`}>{item.status === "ACTIVE" ? "Activo" : "Inactivo"}</span><button type="button" title="Editar proveedor" aria-label={`Editar ${item.name}`} onClick={() => setSupplierEditor({ id: item.id, name: item.name, taxId: item.taxId, email: item.email ?? "", phone: item.phone ?? "", status: item.status, productIds: Array.from(item.productIds ?? []) })} className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"><Pencil size={15} /></button>{isAdmin ? <button type="button" title="Eliminar proveedor" aria-label={`Eliminar ${item.name}`} onClick={() => setManagementDelete({ kind: "supplier", id: item.id, name: item.name })} className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"><Trash2 size={15} /></button> : null}</div></div>{item.email || item.phone ? <p className="mt-3 break-words text-xs leading-5 text-neutral-600">{[item.email, item.phone].filter(Boolean).join(" · ")}</p> : <p className="mt-3 text-xs text-neutral-400">Sin datos de contacto adicionales</p>}</article>) : <EmptyState>No hay proveedores guardados.</EmptyState>}</div>
          </div>
        </Panel>

        <Panel className="xl:col-span-2" title="Gestión de inventario" subtitle="Stock real, movimientos manuales y compras conectadas en un solo lugar" icon={<PackagePlus size={20} />}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Productos habilitados", inventorySummary.products, <Boxes size={18} />, "bg-neutral-100 text-neutral-800"],
              ["Unidades disponibles", inventorySummary.units, <PackagePlus size={18} />, "bg-emerald-100 text-emerald-800"],
              ["Stock bajo", inventorySummary.lowStock, <AlertCircle size={18} />, "bg-amber-100 text-amber-900"],
              ["Unidades compradas", inventorySummary.purchases, <ShoppingBag size={18} />, "bg-blue-100 text-blue-800"],
            ].map(([label, value, icon, tone]) => <article key={String(label)} className="rounded-2xl border border-black/5 bg-neutral-50 p-4"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>{icon}</span><p className="mt-3 text-xs font-black uppercase tracking-wide text-neutral-400">{label}</p><p className="mt-1 font-display text-3xl font-black">{value}</p></article>)}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <form onSubmit={createMovement} className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-primary"><ArrowDownToLine size={19} /></span><div><h3 className="font-display text-lg font-black">Registrar movimiento</h3><p className="text-xs text-muted-foreground">Solo para productos aprobados y habilitados</p></div></div>
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-black" htmlFor="movement-product">Producto</label>
                <select id="movement-product" required value={movement.productId} onChange={(e) => setMovement({ ...movement, productId: e.target.value })} className="field-control"><option value="">Selecciona un producto aprobado</option>{approvedInventoryProducts.map((p) => <option key={p.id} value={p.id}>{p.name} · stock {p.stock ?? 0}</option>)}</select>
                {selectedInventoryProduct ? <div className="flex items-center gap-4 rounded-2xl bg-neutral-950 p-4 text-white"><img src={selectedInventoryProduct.image} alt="" className="h-16 w-16 rounded-2xl object-cover" /><div className="min-w-0"><p className="truncate font-black">{selectedInventoryProduct.name}</p><p className="mt-1 font-mono text-xs text-white/55">{selectedInventoryProduct.sku}</p><p className="mt-2 text-sm"><b className="text-primary">{selectedInventoryProduct.stock ?? 0}</b> unidades disponibles</p></div></div> : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-bold" htmlFor="movement-type">Tipo<select id="movement-type" value={movement.type} onChange={(e) => setMovement({ ...movement, type: e.target.value })} className="field-control mt-2"><option value="ENTRY">Entrada de stock</option><option value="EXIT">Salida manual</option><option value="ADJUSTMENT">Ajuste de disminución</option></select></label>
                  <label className="text-sm font-bold" htmlFor="movement-quantity">Cantidad<input id="movement-quantity" type="number" min={1} value={movement.quantity} onChange={(e) => setMovement({ ...movement, quantity: Number(e.target.value) })} className="field-control mt-2" /></label>
                </div>
                {movement.type === "ENTRY" ? <label className="block text-sm font-bold" htmlFor="movement-supplier">Proveedor opcional<select id="movement-supplier" value={movement.supplierId} onChange={(e) => setMovement({ ...movement, supplierId: e.target.value })} className="field-control mt-2"><option value="">Sin proveedor asociado</option>{suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : null}
                <label className="block text-sm font-bold" htmlFor="movement-reference">Referencia o motivo<input id="movement-reference" value={movement.reference} onChange={(e) => setMovement({ ...movement, reference: e.target.value })} placeholder="Ej. Compra al proveedor, corrección o merma" className="field-control mt-2" /></label>
                <button disabled={busyAction === "movement"} className="primary-action w-full">{busyAction === "movement" ? "Registrando…" : "Registrar y actualizar stock"}</button>
              </div>
            </form>

            <section className="rounded-[1.75rem] border border-black/10 bg-neutral-50 p-5" aria-labelledby="inventory-history-title">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"><History size={19} /></span><div><h3 id="inventory-history-title" className="font-display text-lg font-black">Historial de movimientos</h3><p className="text-xs text-muted-foreground">Compras, cancelaciones, devoluciones y ajustes reales</p></div></div><select aria-label="Filtrar historial por producto" value={movementHistoryProductId} onChange={(event) => setMovementHistoryProductId(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold outline-none"><option value="all">Todos los productos</option>{approvedInventoryProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>
              <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">{visibleMovements.length ? visibleMovements.map((item) => {
                const meta = inventoryMovementMeta(item.type);
                const supplierName = item.supplierId ? suppliers.find((supplierItem) => supplierItem.id === item.supplierId)?.name : null;
                return <article key={item.id} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>{meta.sign === "+" ? <ArrowDownToLine size={18} /> : <ArrowUpFromLine size={18} />}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-black">{item.productName}</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${meta.tone}`}>{meta.label}</span></div><p className="mt-1 text-xs text-neutral-500">{meta.source}{supplierName ? ` · ${supplierName}` : ""}</p><p className="mt-2 text-xs text-neutral-500">{new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}{item.reference ? ` · Ref. ${item.reference}` : ""}</p></div></div><div className="shrink-0 text-right"><p className={`font-display text-2xl font-black ${meta.sign === "+" ? "text-emerald-700" : "text-red-700"}`}>{meta.sign}{item.quantity}</p><p className="mt-1 text-xs font-bold text-neutral-500">Stock final: {item.resultingStock}</p></div></div></article>;
              }) : <EmptyState>Aún no hay movimientos para este producto.</EmptyState>}</div>
            </section>
          </div>
        </Panel>
      </section> : null}

      {canCommerce ? <Panel title="Pedidos y seguimiento" subtitle={`${orders.length} pedidos disponibles`} icon={<Boxes size={20} />}>
        {orders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead><tr className="border-b border-black/10 text-left text-xs uppercase tracking-wider text-neutral-400"><th className="px-3 py-3">Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Próximo paso</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-black/5 last:border-0"><td className="px-3 py-4 font-mono font-bold">#{order.id.slice(0,8)}</td><td>{new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</td><td className="font-black">USD {order.totalUsd}</td><td><StatusBadge status={order.status} /></td><td><div className="flex flex-wrap gap-2">{orderTransitions[order.status]?.map((status) => <button key={status} disabled={busyAction === `order-${order.id}`} onClick={() => void changeOrder(order.id,status)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-bold transition hover:border-accent hover:text-accent disabled:opacity-50">{statusLabels[status] ?? status}</button>) ?? <span className="text-muted-foreground">Sin acciones pendientes</span>}</div></td></tr>)}</tbody></table></div> : <EmptyState>No hay pedidos para mostrar.</EmptyState>}
      </Panel> : null}

      <section className="grid gap-6">
        {isAdmin ? <Panel title="Clientes" subtitle={`${customers.length} perfiles`} icon={<Users size={20} />}>
          <div className="grid gap-3 sm:grid-cols-2">{customers.length ? customers.map((customer) => <article key={customer.id} className="rounded-2xl bg-neutral-50 p-4"><p className="truncate font-black">{customer.firstName} {customer.lastName}</p><p className="mt-1 truncate text-sm text-muted-foreground">{customer.email}</p><button disabled={busyAction === `customer-${customer.id}`} onClick={() => void toggleCustomer(customer.id,!customer.enabled)} className={`mt-4 rounded-full px-3 py-1.5 text-xs font-black ${customer.enabled ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{customer.enabled ? "Cuenta activa" : "Cuenta deshabilitada"}</button></article>) : <EmptyState>No hay clientes registrados.</EmptyState>}</div>
        </Panel> : null}

        {canCommerce ? <Panel className="mx-auto w-full max-w-5xl" title="Devoluciones" subtitle="Revisión ordenada, filtros e historial de recepción" icon={<RotateCcw size={20} />}>
          <div className="rounded-2xl border border-black/5 bg-neutral-50 p-3">
            <label className="relative block"><span className="sr-only">Buscar devolución</span><Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={returnSearch} onChange={(event) => setReturnSearch(event.target.value)} placeholder="Buscar cliente, producto o pedido" className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-neutral-950" /></label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-black text-neutral-500">Estado<select value={returnStatusFilter} onChange={(event) => setReturnStatusFilter(event.target.value as typeof returnStatusFilter)} className="field-control mt-1.5"><option value="ALL">Todas ({returnCounts.ALL})</option><option value="REQUESTED">Solicitadas ({returnCounts.REQUESTED})</option><option value="APPROVED">Aprobadas ({returnCounts.APPROVED})</option><option value="RECEIVED">Recibidas ({returnCounts.RECEIVED})</option><option value="REJECTED">Rechazadas ({returnCounts.REJECTED})</option></select></label>
              <label className="text-xs font-black text-neutral-500">Orden<select value={returnSort} onChange={(event) => setReturnSort(event.target.value as typeof returnSort)} className="field-control mt-1.5"><option value="NEWEST">Más recientes primero</option><option value="OLDEST">Más antiguas primero</option></select></label>
            </div>
          </div>
          <div className="mt-4 max-h-[42rem] space-y-3 overflow-y-auto pr-1">{visibleReturns.length ? visibleReturns.map((item) => {
            const productName = adminCatalog.find((product) => product.id === item.productId)?.name ?? item.productId;
            return <article key={item.id} className="rounded-2xl border border-black/5 bg-neutral-50 p-4"><div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"><div className="min-w-0"><p className="truncate font-black">{item.userEmail}</p><p className="mt-1 text-xs text-neutral-500">Pedido #{item.orderId.slice(0, 8)} · {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p><p className="mt-3 text-sm font-bold">{item.quantity} × {productName}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.reason}</p>{item.adminNote ? <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm leading-6 text-neutral-700"><b>Nota enviada al cliente:</b> {item.adminNote}</p> : null}</div><div className="flex shrink-0 flex-col items-start gap-2 sm:items-end"><StatusBadge status={item.status} />{item.status === "REQUESTED" ? <><button disabled={busyAction === `return-${item.id}`} onClick={() => changeReturn(item.id,"APPROVED")} className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white sm:w-auto">Aprobar</button><button disabled={busyAction === `return-${item.id}`} onClick={() => changeReturn(item.id,"REJECTED")} className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white sm:w-auto">Rechazar</button></> : null}{item.status === "APPROVED" ? <button disabled={busyAction === `return-${item.id}`} onClick={() => changeReturn(item.id,"RECEIVED")} className="rounded-lg bg-accent px-3 py-2 text-xs font-black text-white">Marcar recibida</button> : null}</div></div></article>;
          }) : <EmptyState>No hay devoluciones con estos filtros.</EmptyState>}</div>
        </Panel> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {canModerate ? <Panel className="xl:col-span-2" title="Centro de moderación" subtitle="Cola actual, decisiones y trazabilidad organizadas por estado" icon={<ShieldCheck size={20} />}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {([
              ["PENDING", "Pendientes", "bg-amber-50 text-amber-800 border-amber-200"],
              ["OBSERVED", "En observación", "bg-orange-50 text-orange-800 border-orange-200"],
              ["APPROVED", "Aprobados", "bg-emerald-50 text-emerald-700 border-emerald-200"],
              ["REJECTED", "Rechazados", "bg-red-50 text-red-700 border-red-200"],
              ["HISTORY", "Historial", "bg-blue-50 text-blue-700 border-blue-200"],
            ] as const).map(([key, label, tone]) => <button key={key} type="button" onClick={() => setModerationTab(key)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${tone} ${moderationTab === key ? "ring-2 ring-neutral-950 ring-offset-2" : ""}`}><span className="text-xs font-black uppercase tracking-wide">{label}</span><span className="mt-2 block font-display text-3xl font-black">{moderationCounts[key]}</span></button>)}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-neutral-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ["PENDING", "Pendientes"], ["OBSERVED", "En observación"], ["APPROVED", "Aprobados"], ["REJECTED", "Rechazados"], ["HISTORY", "Historial completo"],
              ] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setModerationTab(key)} className={`rounded-full px-4 py-2 text-xs font-black transition ${moderationTab === key ? "bg-neutral-950 text-white" : "bg-white text-neutral-600 hover:bg-neutral-100"}`}>{label}</button>)}
            </div>
            <label className="relative min-w-0 sm:w-72"><span className="sr-only">Buscar en moderación</span><Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={moderationSearch} onChange={(event) => setModerationSearch(event.target.value)} placeholder="Buscar nombre o SKU" className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-neutral-950" /></label>
          </div>

          {moderationTab === "HISTORY" ? <div className="mt-5 overflow-x-auto">
            {visibleModerationHistory.length ? <table className="w-full min-w-[800px] text-sm"><thead><tr className="border-b border-black/10 text-left text-xs uppercase tracking-wider text-neutral-400"><th className="px-4 py-3">Producto</th><th>Decisión</th><th>Comentario</th><th>Fecha</th></tr></thead><tbody>{visibleModerationHistory.map((event, index) => <tr key={`${event.productId}-${event.moderatedAt}-${index}`} className="border-b border-black/5 last:border-0"><td className="px-4 py-4"><p className="font-black">{event.name}</p><p className="mt-1 font-mono text-xs text-neutral-500">{event.sku}</p></td><td><StatusBadge status={event.status} /></td><td className="max-w-xs py-4 text-neutral-600">{event.note || "Sin comentario adicional"}</td><td className="whitespace-nowrap pr-4 text-neutral-500">{event.moderatedAt ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.moderatedAt)) : "—"}</td></tr>)}</tbody></table> : <EmptyState>No hay decisiones registradas con este criterio.</EmptyState>}
          </div> : <div className="mt-5 grid gap-4 md:grid-cols-2">
            {visibleModerationProducts.length ? visibleModerationProducts.map((product) => <article key={product.id} className="rounded-[1.5rem] border border-black/5 bg-neutral-50 p-4 transition hover:border-black/15 hover:shadow-md">
              <div className="flex items-start gap-4"><img src={product.image} alt={product.name} className="h-24 w-24 shrink-0 rounded-2xl border border-black/10 bg-white object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-black">{product.name}</p><p className="mt-1 font-mono text-xs text-neutral-500">SKU {product.sku}</p></div><StatusBadge status={product.moderationStatus ?? "PENDING"} /></div><p className="mt-2 text-xs leading-5 text-neutral-500">USD {product.priceUsd.toFixed(2)} · Stock {product.stock ?? 0} · {product.sizes?.join(", ") || "Sin tallas"}</p>{product.moderationNote ? <p className="mt-2 line-clamp-2 rounded-xl bg-white px-3 py-2 text-xs leading-5 text-neutral-600"><b>Última nota:</b> {product.moderationNote}</p> : null}<button type="button" onClick={() => { setReviewProductId(product.id); setReviewImageIndex(0); }} className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-black text-white"><Eye size={15} /> {product.moderationStatus === "PENDING" ? "Revisar ficha completa" : "Ver ficha y resultado"}</button></div></div>
            </article>) : <div className="md:col-span-2"><EmptyState>No hay productos en esta sección.</EmptyState></div>}
          </div>}
        </Panel> : null}

        {canModerate ? <Panel className="xl:col-span-2" title="Control de eliminaciones" subtitle="Solicitudes pendientes y decisiones históricas con trazabilidad" icon={<Trash2 size={20} />}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["PENDING", "Pendientes", "border-amber-200 bg-amber-50 text-amber-800"],
              ["APPROVED", "Eliminadas", "border-rose-200 bg-rose-50 text-rose-700"],
              ["REJECTED", "Rechazadas", "border-neutral-200 bg-neutral-100 text-neutral-700"],
              ["ALL", "Historial completo", "border-blue-200 bg-blue-50 text-blue-700"],
            ] as const).map(([key, label, tone]) => <button key={key} type="button" onClick={() => setDeletionTab(key)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${tone} ${deletionTab === key ? "ring-2 ring-neutral-950 ring-offset-2" : ""}`}><span className="text-xs font-black uppercase tracking-wide">{label}</span><span className="mt-2 block font-display text-3xl font-black">{deletionCounts[key]}</span></button>)}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">{visibleDeletionRequests.length ? visibleDeletionRequests.map((request) => {
            const product = adminCatalog.find((item) => item.id === request.productId);
            return <article key={request.id} className={`rounded-[1.5rem] border p-5 ${request.status === "PENDING" ? "border-amber-100 bg-amber-50/50" : request.status === "APPROVED" ? "border-rose-100 bg-rose-50/40" : "border-black/5 bg-neutral-50"}`}>
              <div className="flex items-center gap-4">
                <img src={product?.image ?? "/images/catalog/coleccion-recuerdos-andes.png"} alt="" className="h-16 w-16 rounded-2xl border border-black/5 object-cover" />
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">{request.productName}</p><StatusBadge status={request.status} /></div><p className="mt-1 font-mono text-xs text-neutral-500">SKU {request.productSku}</p><p className="mt-2 line-clamp-2 text-sm text-neutral-600">{request.reason}</p><p className="mt-2 text-xs text-neutral-500">Solicitada por {request.requestedBy} · {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.createdAt))}</p>{request.resolvedAt ? <p className="mt-1 text-xs text-neutral-500">Resuelta el {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.resolvedAt))}</p> : null}{request.moderatorNote ? <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs leading-5 text-neutral-600"><b>Resolución:</b> {request.moderatorNote}</p> : null}{request.status === "PENDING" ? <button type="button" onClick={() => { setDeletionReviewId(request.id); setDeletionNote(""); }} className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-800 px-4 py-2 text-xs font-black text-white"><Eye size={15} /> Revisar solicitud</button> : <span className={`mt-3 inline-flex rounded-full px-3 py-2 text-xs font-black ${request.status === "APPROVED" ? "bg-rose-100 text-rose-800" : "bg-neutral-200 text-neutral-700"}`}>{request.status === "APPROVED" ? "Producto eliminado de la base comercial" : "Producto conservado"}</span>}</div>
              </div>
            </article>;
          }) : <div className="md:col-span-2"><EmptyState>No hay solicitudes en esta sección.</EmptyState></div>}</div>
        </Panel> : null}

      </section>

      {reviewProduct ? <div className="fixed inset-0 z-40 overflow-y-auto bg-black/60 p-4 md:p-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReviewProductId(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="moderation-product-title" className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <header className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5 md:px-8">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Ficha de moderación</p><h2 id="moderation-product-title" className="mt-2 font-display text-2xl font-black md:text-3xl">{reviewProduct.name}</h2><div className="mt-2 flex flex-wrap items-center gap-3"><p className="text-sm text-muted-foreground">SKU {reviewProduct.sku}</p><StatusBadge status={reviewProduct.moderationStatus ?? "PENDING"} /></div></div>
            <button type="button" aria-label="Cerrar revisión" onClick={() => setReviewProductId(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10"><X size={19} /></button>
          </header>
          <div className="grid gap-7 p-6 md:p-8 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="aspect-square overflow-hidden rounded-[2rem] border border-black/10 bg-neutral-100"><img src={reviewImages[reviewImageIndex] ?? reviewProduct.image} alt={`${reviewProduct.name} · vista ${reviewImageIndex + 1}`} className="h-full w-full object-cover" /></div>
              <div className="mt-3 grid grid-cols-4 gap-3">{reviewImages.map((image, index) => <button key={image} type="button" onClick={() => setReviewImageIndex(index)} className={`aspect-square overflow-hidden rounded-2xl border-2 bg-neutral-100 ${index === reviewImageIndex ? "border-neutral-950" : "border-transparent"}`}><img src={image} alt={`Vista ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>
              <p className="mt-3 text-xs text-muted-foreground">{reviewImages.length}/4 imágenes · portada, vista adicional, detalle y producto completo.</p>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Sección", reviewProduct.collection === "men" ? "Hombre" : reviewProduct.collection === "women" ? "Mujer" : "Recuerdos"],
                  ["Tipo", reviewProduct.category],
                  ["Subcategoría", reviewProduct.subcategory],
                  ["Concepto", reviewProduct.concept],
                  ["Color", reviewProduct.color],
                  ["Género", reviewProduct.gender === "male" ? "Masculino" : "Femenino"],
                  ["Precio", `USD ${reviewProduct.priceUsd.toFixed(2)}`],
                  ["Precio anterior", reviewProduct.compareAtPriceUsd ? `USD ${reviewProduct.compareAtPriceUsd.toFixed(2)}` : "No aplica"],
                  ["Tallas", reviewProduct.sizes?.join(", ") || "No aplica"],
                  ["Stock", String(reviewProduct.stock ?? 0)],
                ].map(([label, value]) => <div key={label} className="rounded-2xl bg-neutral-50 p-3"><p className="text-xs font-black uppercase tracking-wide text-neutral-400">{label}</p><p className="mt-1 font-bold capitalize">{value}</p></div>)}
              </div>
              <div><h3 className="font-black">Descripción</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{reviewProduct.description || "Sin descripción."}</p></div>
              <div><h3 className="font-black">Historia</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{reviewProduct.story || "Sin historia."}</p></div>
              {reviewProduct.moderationNote ? <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700"><b>Nota de moderación:</b> {reviewProduct.moderationNote}</div> : null}
              {reviewProduct.moderationStatus === "PENDING" ? <><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><b>Inventario pendiente:</b> el producto se creó con stock 0. Si lo apruebas, el rol Administrador o Vendedor podrá registrar la entrada física desde Operaciones.</div><div className="flex flex-wrap gap-3 border-t border-black/10 pt-5"><button disabled={busyAction === `moderation-${reviewProduct.id}`} onClick={() => moderate(reviewProduct.id,"APPROVED")} className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Aprobar publicación</button><button disabled={busyAction === `moderation-${reviewProduct.id}`} onClick={() => moderate(reviewProduct.id,"OBSERVED")} className="rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-neutral-950 disabled:opacity-50">Solicitar correcciones</button><button disabled={busyAction === `moderation-${reviewProduct.id}`} onClick={() => moderate(reviewProduct.id,"REJECTED")} className="rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Rechazar publicación</button></div></> : reviewProduct.moderationStatus === "APPROVED" ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><b>Publicación aprobada.</b> Será visible cuando esté activa y tenga stock disponible.</div> : reviewProduct.moderationStatus === "OBSERVED" ? <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-900"><b>En observación.</b> El producto espera que el vendedor corrija la ficha y la envíe nuevamente.</div> : <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"><b>Publicación rechazada.</b> La decisión y su motivo permanecen en el historial.</div>}
            </div>
          </div>
        </section>
      </div> : null}

      {deletionReview ? <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/65 p-4 md:p-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeletionReviewId(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="deletion-review-title" className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <header className="bg-gradient-to-br from-rose-800 to-red-950 px-6 py-7 text-white md:px-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-200">Moderación de eliminación</p><h2 id="deletion-review-title" className="mt-2 font-display text-3xl font-black">{deletionReview.productName}</h2><p className="mt-2 font-mono text-sm text-white/70">SKU {deletionReview.productSku}</p></div><button type="button" aria-label="Cerrar" onClick={() => setDeletionReviewId(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><X size={19} /></button></div>
          </header>
          <div className="space-y-5 p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-neutral-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-neutral-400">Solicitado por</p><p className="mt-2 font-bold">{deletionReview.requestedBy}</p></div><div className="rounded-2xl bg-neutral-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-neutral-400">Estado anterior</p><p className="mt-2 font-bold capitalize">{deletionReview.previousStatus}</p></div></div>
            <div><h3 className="font-black">Razón de la solicitud</h3><p className="mt-2 whitespace-pre-wrap rounded-2xl border border-black/5 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">{deletionReview.reason}</p></div>
            {deletionReview.canDeletePermanently ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><b>Eliminación permitida:</b> no existen pedidos, devoluciones ni movimientos de inventario vinculados.</div> : <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"><b>Historial protegido:</b> {deletionReview.blockers.join(", ")}. La eliminación definitiva está bloqueada para conservar la trazabilidad.</div>}
            <label htmlFor="deletion-review-note" className="block text-sm font-black">Nota del moderador</label>
            <textarea id="deletion-review-note" maxLength={500} rows={4} value={deletionNote} onChange={(event) => setDeletionNote(event.target.value)} placeholder="Obligatoria si rechazas. También puedes dejar constancia al aprobar." className="field-control resize-none" />
            <div className="flex flex-wrap justify-end gap-3 border-t border-black/10 pt-5"><button type="button" onClick={() => { setDeletionReviewId(null); setDeletionNote(""); }} className="rounded-full border border-black/10 px-5 py-3 text-sm font-black">Cancelar</button><button type="button" disabled={!deletionNote.trim() || busyAction === `deletion-${deletionReview.id}`} onClick={() => resolveDeletion("REJECTED")} className="rounded-full bg-neutral-800 px-5 py-3 text-sm font-black text-white disabled:opacity-40">Rechazar solicitud</button><button type="button" disabled={!deletionReview.canDeletePermanently || busyAction === `deletion-${deletionReview.id}`} onClick={() => resolveDeletion("APPROVED")} className="inline-flex items-center gap-2 rounded-full bg-rose-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={17} /> Confirmar eliminación definitiva</button></div>
          </div>
        </section>
      </div> : null}

      {categoryEditor ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCategoryEditor(null); }}>
        <form role="dialog" aria-modal="true" aria-labelledby="category-editor-title" onSubmit={(event) => void updateCategory(event)} className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Gestión de categoría</p><h2 id="category-editor-title" className="mt-2 font-display text-2xl font-black">Editar categoría</h2></div><button type="button" aria-label="Cerrar" onClick={() => setCategoryEditor(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10"><X size={18} /></button></div>
          <label htmlFor="category-edit-name" className="mt-6 block text-sm font-black">Nombre</label><input id="category-edit-name" autoFocus required maxLength={100} value={categoryEditor.name} onChange={(event) => setCategoryEditor({ ...categoryEditor, name: event.target.value })} className="field-control mt-2" />
          <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-4"><span><b className="block text-sm">Categoría activa</b><span className="mt-1 block text-xs text-muted-foreground">Las categorías inactivas dejan de mostrarse en listados públicos.</span></span><input type="checkbox" checked={categoryEditor.active} onChange={(event) => setCategoryEditor({ ...categoryEditor, active: event.target.checked })} className="h-5 w-5 accent-neutral-950" /></label>
          <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-900">Si la categoría ya está relacionada con productos, su identificador interno se conserva para no romper esas relaciones.</p>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setCategoryEditor(null)} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-black">Cancelar</button><button type="submit" disabled={!categoryEditor.name.trim() || busyAction === `category-edit-${categoryEditor.id}`} className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">{busyAction === `category-edit-${categoryEditor.id}` ? "Guardando…" : "Guardar cambios"}</button></div>
        </form>
      </div> : null}

      {supplierEditor ? <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSupplierEditor(null); }}>
        <form role="dialog" aria-modal="true" aria-labelledby="supplier-editor-title" onSubmit={(event) => void updateSupplier(event)} className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Gestión de proveedor</p><h2 id="supplier-editor-title" className="mt-2 font-display text-2xl font-black">Editar proveedor</h2></div><button type="button" aria-label="Cerrar" onClick={() => setSupplierEditor(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10"><X size={18} /></button></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-black">Nombre comercial<input autoFocus required maxLength={160} value={supplierEditor.name} onChange={(event) => setSupplierEditor({ ...supplierEditor, name: event.target.value })} className="field-control mt-2" /></label><label className="text-sm font-black">RUC o identificación<input required maxLength={30} value={supplierEditor.taxId} onChange={(event) => setSupplierEditor({ ...supplierEditor, taxId: event.target.value })} className="field-control mt-2" /></label><label className="text-sm font-black">Correo<input type="email" maxLength={150} value={supplierEditor.email} onChange={(event) => setSupplierEditor({ ...supplierEditor, email: event.target.value })} className="field-control mt-2" /></label><label className="text-sm font-black">Teléfono<input type="tel" maxLength={30} value={supplierEditor.phone} onChange={(event) => setSupplierEditor({ ...supplierEditor, phone: event.target.value })} className="field-control mt-2" /></label></div>
          <label className="mt-4 block text-sm font-black">Estado<select value={supplierEditor.status} onChange={(event) => setSupplierEditor({ ...supplierEditor, status: event.target.value })} className="field-control mt-2"><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option></select></label>
          <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-900">Los productos asociados se conservan. Si el proveedor tiene movimientos históricos, puedes marcarlo como inactivo en lugar de eliminarlo.</p>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setSupplierEditor(null)} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-black">Cancelar</button><button type="submit" disabled={!supplierEditor.name.trim() || !supplierEditor.taxId.trim() || busyAction === `supplier-edit-${supplierEditor.id}`} className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">{busyAction === `supplier-edit-${supplierEditor.id}` ? "Guardando…" : "Guardar cambios"}</button></div>
        </form>
      </div> : null}

      {managementDelete ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setManagementDelete(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="management-delete-title" className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700"><Trash2 size={21} /></span><h2 id="management-delete-title" className="mt-5 font-display text-2xl font-black">Eliminar {managementDelete.kind === "category" ? "categoría" : "proveedor"}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Vas a eliminar permanentemente <b className="text-neutral-950">{managementDelete.name}</b>. El backend comprobará primero que no existan relaciones comerciales que deban conservarse.</p>{managementDelete.kind === "category" ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">No se eliminará si contiene subcategorías o está usada por productos.</p> : <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">No se eliminará si tiene movimientos de inventario; en ese caso debe quedar inactivo para conservar el historial.</p>}{message ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</p> : null}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setManagementDelete(null)} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-black">Cancelar</button><button type="button" onClick={() => void confirmManagementDelete()} disabled={busyAction === `${managementDelete.kind}-delete-${managementDelete.id}`} className="rounded-full bg-rose-700 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">{busyAction === `${managementDelete.kind}-delete-${managementDelete.id}` ? "Comprobando…" : "Eliminar definitivamente"}</button></div>
        </section>
      </div> : null}

      {noteAction ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNoteAction(null); }}>
        <form role="dialog" aria-modal="true" aria-labelledby="operation-note-title" onSubmit={(event) => void confirmNoteAction(event)} className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
          <h2 id="operation-note-title" className="font-display text-2xl font-black">
            {noteAction.kind === "moderation"
              ? noteAction.status === "OBSERVED" ? "Registrar observación" : "Motivo del rechazo"
              : noteAction.status === "APPROVED" ? "Aprobar devolución" : noteAction.status === "REJECTED" ? "Rechazar devolución" : "Confirmar recepción"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {noteAction.kind === "moderation" ? "Esta explicación será visible para el vendedor." : "La respuesta quedará visible para el cliente en su solicitud."}
          </p>
          <label htmlFor="operation-note" className="mt-5 block text-sm font-black">{noteAction.kind === "moderation" ? "Comentario obligatorio" : "Respuesta para el cliente"}</label>
          <textarea id="operation-note" autoFocus required={noteAction.kind === "moderation"} maxLength={500} rows={5} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder={noteAction.kind === "moderation" ? "Describe claramente qué debe corregirse." : "Escribe una indicación breve y clara."} className="field-control mt-2 resize-none" />
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => { setNoteAction(null); setNoteText(""); }} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-black">Cancelar</button>
            <button type="submit" disabled={noteAction.kind === "moderation" && !noteText.trim()} className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Confirmar</button>
          </div>
        </form>
      </div> : null}
    </div>
  );
}
