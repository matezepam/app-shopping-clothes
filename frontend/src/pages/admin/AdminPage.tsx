import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Lightbulb,
  Loader2,
  Package,
  Plus,
  Power,
  PowerOff,
  Save,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api, type AdminStats, type ProductDeletionRow, type ProductPayload } from "../../lib/api";
import { formatMoney } from "../../lib/currency";
import { useStore } from "../../context/StoreContext";
import type { Product } from "../../types/store";

const emptyForm: ProductPayload = {
  sku: "",
  name: "",
  collection: "men",
  category: "shirts",
  subcategory: "camisetas",
  concept: "galapagos",
  priceUsd: 0,
  compareAtPriceUsd: null,
  image: "/images/catalog/camiseta-galapagos-negra.png",
  images: ["/images/catalog/camiseta-galapagos-negra.png"],
  description: "",
  story: "",
  gender: "male",
  color: "negro",
  sizes: ["S", "M", "L"],
  stock: 0,
  status: "draft",
};

const CONCEPTS = ["galapagos", "quito", "otavalo", "andes", "amazonia", "coast"];
const COLORS = ["negro", "blanco", "rojo", "azul", "verde", "beige", "gris", "dorado", "plateado", "rosa"];
const APPAREL_SUBCATEGORIES = ["camisetas", "sudaderas", "gorras", "pantalones", "bolsos", "bisuteria", "joyas"];
const SOUVENIR_SUBCATEGORIES = ["recuadros", "tazas", "bordados"];

function statusTone(status?: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    case "OBSERVED":
      return "bg-amber-50 text-amber-800";
    default:
      return "bg-blue-50 text-blue-700";
  }
}

function moderationLabel(status?: string) {
  switch (status) {
    case "APPROVED": return "Aprobado";
    case "REJECTED": return "Rechazado";
    case "OBSERVED": return "Con observaciones";
    default: return "Pendiente de revisión";
  }
}

function listToText(value?: string[]) {
  return value?.join(", ") ?? "";
}

function textToList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(product: Product): ProductPayload {
  return {
    id: product.id,
    sku: product.sku ?? "",
    name: product.name,
    collection: product.collection ?? "men",
    category: product.category,
    subcategory: product.subcategory,
    concept: product.concept,
    priceUsd: product.priceUsd,
    compareAtPriceUsd: product.compareAtPriceUsd ?? null,
    image: product.image,
    images: product.images ?? [product.image],
    description: product.description ?? "",
    story: product.story ?? "",
    gender: product.gender,
    color: product.color,
    sizes: product.sizes ?? [],
    stock: product.stock ?? 0,
    status: product.status ?? "active",
  };
}

export function AdminPage() {
  const { t } = useTranslation();
  const { user, token, refreshProducts } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [collection, setCollection] = useState("men");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<"edit" | "preview">("edit");
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [imagesText, setImagesText] = useState("");
  const [formImageIndex, setFormImageIndex] = useState(0);
  const [sizesText, setSizesText] = useState("S, M, L");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [busyProductAction, setBusyProductAction] = useState<string | null>(null);
  const [deletionRequests, setDeletionRequests] = useState<ProductDeletionRow[]>([]);
  const [deletionProduct, setDeletionProduct] = useState<Product | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [salesStats, setSalesStats] = useState<AdminStats | null>(null);

  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const canManageProducts = user?.roles?.some((role) => role === "ADMIN" || role === "VENDOR") ?? false;
  const canViewProducts = user?.roles?.some((role) => ["ADMIN", "VENDOR", "MODERATOR"].includes(role)) ?? false;

  const loadProducts = async () => {
    if (!token || !canViewProducts) return;
    const [{ products: nextProducts }, { requests }, nextSalesStats] = await Promise.all([
      api.adminProducts(token),
      api.productDeletionRequests(token),
      isAdmin ? api.adminStats(token) : Promise.resolve(null),
    ]);
    setProducts(nextProducts);
    setDeletionRequests(requests);
    setSalesStats(nextSalesStats);
  };

  useEffect(() => {
    void loadProducts();
  }, [token, canViewProducts, isAdmin]);

  const stats = useMemo(() => {
    return {
      active: products.filter(
        (product) => product.status === "active" && product.moderationStatus === "APPROVED" && (product.stock ?? 0) > 0,
      ).length,
      pending: products.filter((product) => product.moderationStatus === "PENDING").length,
      stock: products.reduce((sum, product) => sum + (product.stock ?? 0), 0),
      lowStock: products.filter((product) => (product.stock ?? 0) <= 8).length,
      value: products.reduce(
        (sum, product) => sum + product.priceUsd * (product.stock ?? 0),
        0,
      ),
    };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        (product.sku ?? "").toLowerCase().includes(query);
      const matchesCollection = collection === "all" || (product.collection ?? product.category) === collection;
      const matchesStatus = status === "all"
        || (status === "pending" && product.moderationStatus === "PENDING")
        || (status === "observed" && product.moderationStatus === "OBSERVED")
        || (status === "approved" && product.moderationStatus === "APPROVED")
        || (status === "rejected" && product.moderationStatus === "REJECTED")
        || product.status === status;
      return matchesSearch && matchesCollection && matchesStatus;
    });
  }, [products, search, status, collection]);

  const pendingDeletionIds = useMemo(
    () => new Set(deletionRequests.filter((request) => request.status === "PENDING").map((request) => request.productId)),
    [deletionRequests],
  );

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) ?? null,
    [products, editingId],
  );

  const formImages = useMemo(
    () => textToList(imagesText).slice(0, 4),
    [imagesText],
  );

  const salesReport = useMemo(() => {
    if (!salesStats) return null;
    const maxUnits = Math.max(1, ...salesStats.topProducts.map((product) => product.unitsSold));
    const recentRevenue = salesStats.revenueByDay.slice(-10);
    const maxDailyRevenue = Math.max(1, ...recentRevenue.map((day) => Number(day.revenueUsd)));
    const zeroSales = salesStats.lowProducts.filter((product) => product.unitsSold === 0).length;
    const restock = salesStats.topProducts.filter((product) => product.currentStock <= 8);
    return { maxUnits, recentRevenue, maxDailyRevenue, zeroSales, restock };
  }, [salesStats]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagesText(emptyForm.image);
    setFormImageIndex(0);
    setSizesText("S, M, L");
    setFormStep("edit");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    const nextForm = toForm(product);
    setEditingId(product.id);
    setForm(nextForm);
    setImagesText(listToText(nextForm.images));
    setFormImageIndex(0);
    setSizesText(listToText(nextForm.sizes));
    setFormStep("edit");
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormImageIndex(0);
    setFormStep("edit");
    setFormError("");
  };

  const buildPayload = (nextStatus: "active" | "draft") => ({
    ...form,
    images: textToList(imagesText).length ? textToList(imagesText) : [form.image],
    sizes: textToList(sizesText),
    priceUsd: Number(form.priceUsd),
    compareAtPriceUsd: form.compareAtPriceUsd
      ? Number(form.compareAtPriceUsd)
      : null,
    stock: Number(form.stock),
    status: nextStatus,
  });

  const validateForm = () => {
    if (!form.name.trim()) return "Completa el nombre del producto.";
    if (!form.image.trim()) return "Agrega una imagen principal válida.";
    if (formImages.length !== 4) return "Agrega exactamente 4 imágenes: portada, posterior, detalle y producto completo.";
    if (Number(form.priceUsd) <= 0) return "El precio debe ser mayor que cero.";
    if (
      form.compareAtPriceUsd &&
      Number(form.compareAtPriceUsd) <= Number(form.priceUsd)
    ) return "El precio anterior debe ser mayor que el precio actual.";
    if ((form.description ?? "").trim().length < 40) {
      return "La descripción debe explicar material, uso y beneficio en al menos 40 caracteres.";
    }
    if ((form.story ?? "").trim().length < 30) {
      return "La historia debe explicar el concepto del producto en al menos 30 caracteres.";
    }
    if (form.collection !== "souvenirs" && textToList(sizesText).length === 0) {
      return "Agrega al menos una talla para esta prenda.";
    }
    return "";
  };

  const openPreview = () => {
    const error = validateForm();
    setFormError(error);
    if (error) return;
    setFormStep("preview");
  };

  const changeCollection = (collection: string) => {
    const souvenirs = collection === "souvenirs";
    setForm((current) => ({
      ...current,
      collection,
      category: souvenirs ? "art" : "shirts",
      subcategory: souvenirs ? "recuadros" : "camisetas",
      gender: collection === "women" ? "female" : "male",
      sizes: souvenirs ? [] : ["S", "M", "L"],
    }));
    setSizesText(souvenirs ? "" : "S, M, L");
  };

  const changeCategory = (category: string) => {
    const subcategoryByCategory: Record<string, string> = {
      shirts: "camisetas",
      hoodies: "sudaderas",
      caps: "gorras",
      pants: "pantalones",
      bags: "bolsos",
      art: "recuadros",
      mugs: "tazas",
      embroidery: "bordados",
    };
    setForm((current) => ({
      ...current,
      category,
      subcategory: subcategoryByCategory[category] ?? current.subcategory,
    }));
  };

  const uploadImages = async (files: FileList | null) => {
    if (!token || !files?.length) return;
    const selected = Array.from(files);
    if (selected.length > 4) {
      setFormError("Puedes seleccionar hasta 4 imágenes por producto.");
      return;
    }
    const currentUrls = textToList(imagesText).filter((url) => url !== emptyForm.image);
    if (currentUrls.length + selected.length > 4) {
      setFormError(`Ya tienes ${currentUrls.length} imágenes. Quita alguna antes de agregar ${selected.length} más.`);
      return;
    }
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalid) {
      setFormError("Usa imágenes JPG, PNG o WebP de máximo 2 MB cada una.");
      return;
    }
    setUploadingImages(true);
    setFormError("");
    try {
      const result = await api.uploadProductImages(token, selected);
      const uploadedUrls = result.images.map((image) => image.url);
      const merged = [...new Set([...currentUrls, ...uploadedUrls])].slice(0, 4);
      setImagesText(merged.join(", "));
      setForm((current) => ({ ...current, image: merged[0] ?? current.image, images: merged }));
      setFormImageIndex(Math.min(formImageIndex, Math.max(merged.length - 1, 0)));
      setMessage(`${uploadedUrls.length} imagen${uploadedUrls.length === 1 ? "" : "es"} cargada${uploadedUrls.length === 1 ? "" : "s"} correctamente.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudieron cargar las imágenes.");
    } finally {
      setUploadingImages(false);
    }
  };

  const saveProduct = async (nextStatus: "active" | "draft") => {
    if (!token || !canManageProducts) return;
    setMessage("");
    const error = validateForm();
    setFormError(error);
    if (error) {
      setFormStep("edit");
      return;
    }
    const payload = buildPayload(nextStatus);
    setSaving(true);

    try {
      if (editingId) {
        await api.updateProduct(token, editingId, payload);
      } else {
        await api.createProduct(token, payload);
      }
      await loadProducts();
      await refreshProducts();
      closeForm();
      setMessage(
        nextStatus === "draft"
          ? "Borrador guardado. No es visible en la tienda."
          : "Producto enviado a moderación. Se publicará cuando sea aprobado.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("adminProducts.status.error"),
      );
    } finally {
      setSaving(false);
    }
  };

  const changeProductStatus = async (
    product: Product,
    nextStatus: "active" | "hidden" | "disabled",
  ) => {
    if (!token || !canManageProducts) return;
    if (product.moderationStatus !== "APPROVED") {
      setMessage("Primero debe aprobar el producto un moderador.");
      return;
    }
    const actionKey = `${product.id}-${nextStatus}`;
    setBusyProductAction(actionKey);
    setMessage("");
    try {
      const { product: updated } = await api.updateProductStatus(token, product.id, nextStatus);
      setProducts((current) => current.map((item) => item.id === product.id ? updated : item));
      await refreshProducts();
      setMessage(
        nextStatus === "active"
          ? (updated.stock ?? 0) > 0
            ? "Producto activado y visible en el catálogo."
            : "Producto activado. Se publicará automáticamente cuando registres stock."
          : nextStatus === "hidden"
            ? "Producto oculto del catálogo. Sus datos y existencias se conservaron."
            : "Producto desactivado. No admite ventas ni movimientos de inventario.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cambiar el estado del producto.");
    } finally {
      setBusyProductAction(null);
    }
  };

  const updateFormImages = (nextImages: string[], nextIndex = 0) => {
    const normalized = [...new Set(nextImages.map((image) => image.trim()).filter(Boolean))].slice(0, 4);
    setImagesText(normalized.join(", "));
    setForm((current) => ({ ...current, image: normalized[0] ?? "", images: normalized }));
    setFormImageIndex(Math.min(Math.max(nextIndex, 0), Math.max(normalized.length - 1, 0)));
  };

  const moveFormImage = (from: number, to: number) => {
    if (to < 0 || to >= formImages.length) return;
    const next = [...formImages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateFormImages(next, to);
  };

  const removeFormImage = (index: number) => {
    updateFormImages(formImages.filter((_, current) => current !== index), Math.max(index - 1, 0));
  };

  const requestPermanentDeletion = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !deletionProduct || deletionReason.trim().length < 20) return;
    const actionKey = `${deletionProduct.id}-delete-request`;
    setBusyProductAction(actionKey);
    setMessage("");
    try {
      await api.requestProductDeletion(token, deletionProduct.id, deletionReason.trim());
      setDeletionProduct(null);
      setDeletionReason("");
      await loadProducts();
      await refreshProducts();
      setMessage("Solicitud enviada. El producto quedó oculto mientras el moderador revisa la eliminación definitiva.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar la solicitud de eliminación.");
    } finally {
      setBusyProductAction(null);
    }
  };

  if (!user || !canViewProducts) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
        <AlertTriangle size={42} className="text-primary" />
        <h1 className="mt-5 text-3xl font-black text-neutral-950">
          {t("admin.forbidden")}
        </h1>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] bg-[#0a0f1a] p-8 text-white shadow-2xl shadow-black/15">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
            <CheckCircle2 size={15} /> Sesión verificada por AWS Cognito
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70">
            Rol activo: {user.roles.join(" · ")}
          </span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          {t("adminProducts.eyebrow")}
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black">
              {t("adminProducts.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              {t("adminProducts.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
          <Link to="/admin/operations" className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">Operaciones</Link>
          {canManageProducts ? <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-neutral-950 transition hover:bg-white"
          >
            <Plus size={18} />
            {t("adminProducts.add")}
          </button> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [Eye, "Visibles en tienda", stats.active],
          [ShieldCheck, "Pendientes de revisión", stats.pending],
          [Package, t("adminProducts.stats.stock"), stats.stock],
          [AlertTriangle, t("adminProducts.stats.low"), stats.lowStock],
          [CheckCircle2, t("adminProducts.stats.value"), formatMoney(stats.value, "USD")],
        ].map(([Icon, label, value]) => {
          const IconComponent = Icon as typeof ShoppingBag;
          return (
            <div key={String(label)} className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
              <IconComponent size={22} className="text-accent" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
                {String(label)}
              </p>
              <p className="mt-2 text-3xl font-black text-neutral-950">
                {String(value)}
              </p>
            </div>
          );
        })}
      </section>

      {message ? (
        <p className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700">
          {message}
        </p>
      ) : null}

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-neutral-950">
              {t("adminProducts.table.title")}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {t("adminProducts.table.subtitle")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
              <Search size={18} className="text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("adminProducts.search")}
                className="bg-transparent text-sm font-semibold outline-none"
              />
            </label>
            <select
              aria-label="Filtrar por sección"
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
              className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="men">{t("categories.men")}</option>
              <option value="women">{t("categories.women")}</option>
              <option value="souvenirs">{t("categories.souvenirs")}</option>
              <option value="all">Todas las secciones</option>
            </select>
            <select
              aria-label="Filtrar por estado"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="all">{t("adminProducts.statuses.all")}</option>
              <optgroup label="Moderación">
                <option value="pending">Pendiente de revisión</option>
                <option value="observed">Con observaciones</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </optgroup>
              <optgroup label="Estado comercial">
                <option value="active">{t("adminProducts.statuses.active")}</option>
                <option value="draft">{t("adminProducts.statuses.draft")}</option>
                <option value="hidden">{t("adminProducts.statuses.hidden")}</option>
                <option value="disabled">{t("adminProducts.statuses.disabled")}</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="mt-6 pb-12">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-[0.16em] text-neutral-400">
              <tr>
                <th className="w-[19%] p-2">{t("adminProducts.table.product")}</th>
                <th className="w-[10%] p-2">SKU</th>
                <th className="w-[8%] p-2">{t("adminProducts.table.collection")}</th>
                <th className="w-[7%] p-2">{t("adminProducts.table.price")}</th>
                <th className="w-[5%] p-2">{t("adminProducts.table.stock")}</th>
                <th className="w-[8%] p-2">{t("adminProducts.table.status")}</th>
                <th className="w-[14%] p-2">Moderación</th>
                <th className="w-[11%] p-2">Visibilidad</th>
                <th className="w-[18%] p-2 text-right">{t("adminProducts.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100 transition hover:bg-neutral-50/70">
                  <td className="px-2 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-2xl border border-neutral-200 object-cover shadow-sm"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/images/catalog/coleccion-recuerdos-andes.png";
                        }}
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-black leading-5 text-neutral-950">{product.name}</p>
                        <p className="mt-0.5 truncate text-xs text-neutral-500" title={product.id}>{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="truncate px-2 py-3.5 font-mono text-xs" title={product.sku}>{product.sku}</td>
                  <td className="px-2 py-3.5 text-xs">{t(`categories.${product.collection ?? product.category}`)}</td>
                  <td className="px-2 py-3.5 text-xs font-bold">{formatMoney(product.priceUsd, "USD")}</td>
                  <td className="px-2 py-3.5">{product.stock}</td>
                  <td className="px-2 py-3.5">
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-black text-neutral-700">
                      {t(`adminProducts.statuses.${product.status ?? "active"}`)}
                    </span>
                  </td>
                  <td className="px-2 py-3.5">
                    {product.moderationStatus === "OBSERVED" && canManageProducts ? (
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100 px-2.5 py-1.5 text-xs font-black text-amber-900 shadow-sm transition hover:bg-amber-200"
                        title="Editar producto para atender las observaciones"
                      >
                        <Edit3 size={14} /> Con observaciones
                      </button>
                    ) : (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-black ${statusTone(product.moderationStatus)}`}>
                        {moderationLabel(product.moderationStatus)}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3.5 text-xs">
                    {product.status === "active" && product.moderationStatus === "APPROVED" && (product.stock ?? 0) > 0 ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 font-black text-emerald-800">Publicado</span>
                    ) : product.status === "hidden" ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 font-black text-amber-900">Oculto</span>
                    ) : product.status === "disabled" ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 font-black text-red-800">Desactivado</span>
                    ) : product.moderationStatus === "APPROVED" && (product.stock ?? 0) <= 0 ? (
                      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 font-black text-blue-800">Sin stock</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-neutral-200 px-2.5 py-1 font-black text-neutral-700">No visible</span>
                    )}
                  </td>
                  <td className="px-2 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {canManageProducts && product.moderationStatus === "APPROVED" && (product.stock ?? 0) > 0 && product.status !== "active" ? <button
                        type="button"
                        aria-label="Activar"
                        disabled={busyProductAction !== null}
                        onClick={() => void changeProductStatus(product, "active")}
                        className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busyProductAction === `${product.id}-active` ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">Activar</span>
                      </button> : null}
                      {canManageProducts && product.moderationStatus === "APPROVED" && (product.stock ?? 0) > 0 && product.status !== "disabled" ? <button
                        type="button"
                        aria-label="Desactivar"
                        disabled={busyProductAction !== null}
                        onClick={() => void changeProductStatus(product, "disabled")}
                        className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busyProductAction === `${product.id}-disabled` ? <Loader2 size={16} className="animate-spin" /> : <PowerOff size={16} />}
                        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">Desactivar</span>
                      </button> : null}
                      {canManageProducts && product.moderationStatus === "APPROVED" && (product.stock ?? 0) > 0 && product.status !== "hidden" ? <button
                        type="button"
                        aria-label="Ocultar"
                        disabled={busyProductAction !== null}
                        onClick={() => void changeProductStatus(product, "hidden")}
                        className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busyProductAction === `${product.id}-hidden` ? <Loader2 size={16} className="animate-spin" /> : <EyeOff size={16} />}
                        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">Ocultar</span>
                      </button> : null}
                      {canManageProducts ? <button
                        type="button"
                        aria-label="Editar"
                        onClick={() => openEdit(product)}
                        disabled={busyProductAction !== null}
                        className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 disabled:opacity-40"
                      >
                        <Edit3 size={16} />
                        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">Editar</span>
                      </button> : null}
                      {canManageProducts ? <button
                        type="button"
                        aria-label={pendingDeletionIds.has(product.id) ? "Eliminación pendiente" : "Eliminar permanentemente"}
                        disabled={pendingDeletionIds.has(product.id) || busyProductAction !== null}
                        onClick={() => { setDeletionProduct(product); setDeletionReason(""); }}
                        className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <Trash2 size={16} />
                        <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">{pendingDeletionIds.has(product.id) ? "Eliminación pendiente" : "Eliminar permanentemente"}</span>
                      </button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin && salesStats && salesReport ? <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm" aria-labelledby="sales-report-title">
        <header className="flex flex-col gap-5 bg-gradient-to-br from-neutral-950 to-slate-900 px-6 py-7 text-white md:flex-row md:items-end md:justify-between md:px-8">
          <div><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Inteligencia comercial</p><h2 id="sales-report-title" className="mt-2 font-display text-3xl font-black">Reportes de ventas y rotación</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Basado en pedidos confirmados o en gestión. Los cancelados y pendientes de WhatsApp no se cuentan como ventas.</p></div>
          <div className="grid grid-cols-3 gap-2 text-center text-neutral-950"><div className="rounded-2xl bg-white px-4 py-3"><p className="text-[10px] font-black uppercase text-neutral-400">Pedidos</p><p className="mt-1 text-xl font-black">{salesStats.summary.ordersCount}</p></div><div className="rounded-2xl bg-white px-4 py-3"><p className="text-[10px] font-black uppercase text-neutral-400">Unidades</p><p className="mt-1 text-xl font-black">{salesStats.summary.unitsSold}</p></div><div className="rounded-2xl bg-primary px-4 py-3"><p className="text-[10px] font-black uppercase text-neutral-600">Ingresos</p><p className="mt-1 text-xl font-black">{formatMoney(Number(salesStats.summary.revenueUsd), "USD")}</p></div></div>
        </header>

        <div className="grid gap-6 p-5 lg:grid-cols-2 md:p-7">
          <article className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/40 p-5">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white"><TrendingUp size={21} /></span><div><h3 className="font-display text-xl font-black">Productos más vendidos</h3><p className="text-xs text-neutral-500">Prioridad para reposición y disponibilidad</p></div></div>
            <div className="mt-5 space-y-3">{salesStats.topProducts.length ? salesStats.topProducts.map((product, index) => <div key={product.productId} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-black text-white">{index + 1}</span><img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-black/5 object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-black">{product.name}</p><p className="mt-0.5 font-mono text-[11px] text-neutral-400">{product.sku}</p></div><div className="text-right"><p className="font-display text-xl font-black text-emerald-700">{product.unitsSold}</p><p className="text-[10px] font-bold uppercase text-neutral-400">unidades</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(product.unitsSold ? 8 : 0, (product.unitsSold / salesReport.maxUnits) * 100)}%` }} /></div><div className="mt-2 flex items-center justify-between text-xs"><span className="font-bold text-neutral-500">{formatMoney(Number(product.revenueUsd), "USD")} generados</span><span className={`rounded-full px-2 py-1 font-black ${product.currentStock <= 8 ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-600"}`}>Stock {product.currentStock}</span></div></div></div></div>) : <p className="rounded-2xl bg-white p-5 text-center text-sm text-neutral-500">Aún no existen ventas comerciales confirmadas.</p>}</div>
          </article>

          <article className="rounded-[1.75rem] border border-amber-100 bg-amber-50/40 p-5">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white"><TrendingDown size={21} /></span><div><h3 className="font-display text-xl font-black">Productos con menor rotación</h3><p className="text-xs text-neutral-500">Oportunidades para promoción o ajuste de compra</p></div></div>
            <div className="mt-5 space-y-3">{salesStats.lowProducts.length ? salesStats.lowProducts.map((product) => <div key={product.productId} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"><img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-black/5 object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-black">{product.name}</p><p className="mt-0.5 font-mono text-[11px] text-neutral-400">{product.sku}</p><div className="mt-2 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${product.unitsSold === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-900"}`}>{product.unitsSold === 0 ? "Sin ventas" : `${product.unitsSold} vendidas`}</span><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-black text-neutral-600">Stock {product.currentStock}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{t(`categories.${product.collection}`)}</span></div></div><p className="shrink-0 text-right text-xs font-black text-neutral-500">{formatMoney(Number(product.revenueUsd), "USD")}</p></div>) : <p className="rounded-2xl bg-white p-5 text-center text-sm text-neutral-500">No hay productos aprobados para comparar.</p>}</div>
          </article>

          <article className="rounded-[1.75rem] border border-neutral-200 p-5 lg:col-span-2">
            <div className="flex flex-col gap-5 xl:flex-row">
              <div className="min-w-0 flex-1"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><BarChart3 size={21} /></span><div><h3 className="font-display text-xl font-black">Tendencia de ingresos</h3><p className="text-xs text-neutral-500">Últimos días con actividad comercial registrada</p></div></div>{salesReport.recentRevenue.length ? <div className="mt-6 flex h-52 items-end gap-2 overflow-x-auto pb-1">{salesReport.recentRevenue.map((day) => { const value = Number(day.revenueUsd); return <div key={day.day} className="group flex min-w-14 flex-1 flex-col items-center justify-end"><span className="mb-2 text-[10px] font-black text-neutral-500 opacity-0 transition group-hover:opacity-100">${value.toFixed(0)}</span><div className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-400 transition hover:from-primary hover:to-amber-300" style={{ height: `${Math.max(8, (value / salesReport.maxDailyRevenue) * 150)}px` }} /><span className="mt-2 text-[10px] font-bold text-neutral-400">{new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short" }).format(new Date(`${day.day}T12:00:00`))}</span></div>; })}</div> : <p className="mt-6 rounded-2xl bg-neutral-50 p-8 text-center text-sm text-neutral-500">Todavía no hay ingresos para graficar.</p>}</div>
              <aside className="w-full rounded-2xl bg-neutral-950 p-5 text-white xl:w-80"><Lightbulb className="text-primary" size={24} /><h3 className="mt-3 font-display text-lg font-black">Lectura rápida</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-white/70"><li><b className="text-white">Alta demanda:</b> {salesStats.topProducts[0]?.name ?? "Sin datos todavía"}.</li><li><b className="text-white">Sin rotación:</b> {salesReport.zeroSales} producto{salesReport.zeroSales === 1 ? "" : "s"} entre los de menor desempeño.</li><li><b className="text-white">Reposición:</b> {salesReport.restock.length ? `${salesReport.restock.length} producto(s) de alta demanda tienen 8 unidades o menos.` : "Los más vendidos conservan stock suficiente."}</li></ul></aside>
            </div>
          </article>
        </div>
      </section> : null}

      {formOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-neutral-950">
                  {editingId ? t("adminProducts.form.edit") : t("adminProducts.form.create")}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {t("adminProducts.form.text")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-neutral-200 p-3 transition hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
              <span className={`rounded-full px-4 py-2 ${formStep === "edit" ? "bg-neutral-950 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                1. Información
              </span>
              <span className={`rounded-full px-4 py-2 ${formStep === "preview" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                2. Vista previa
              </span>
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-neutral-500">
                3. Moderación
              </span>
            </div>

            {editingProduct?.moderationStatus === "OBSERVED" && editingProduct.moderationNote ? (
              <section className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4" aria-labelledby="moderation-observation-title">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
                    <Edit3 size={17} />
                  </div>
                  <div>
                    <h3 id="moderation-observation-title" className="font-black text-amber-950">Cambios solicitados por moderación</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-amber-900">{editingProduct.moderationNote}</p>
                    <p className="mt-2 text-xs font-bold text-amber-800">Modifica los campos necesarios y envía nuevamente el producto a revisión.</p>
                  </div>
                </div>
              </section>
            ) : null}

            {formError ? (
              <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {formError}
              </p>
            ) : null}

            {formStep === "edit" ? (
              <div className="mt-6 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <div className="aspect-square overflow-hidden rounded-[2rem] bg-neutral-100">
                    <img
                      src={formImages[formImageIndex] || form.image || "/images/catalog/coleccion-recuerdos-andes.png"}
                      alt={form.name || "Vista del producto"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/images/catalog/coleccion-recuerdos-andes.png";
                      }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, index) => {
                      const image = formImages[index];
                      return image ? (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setFormImageIndex(index)}
                          className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-neutral-100 transition ${index === formImageIndex ? "border-neutral-950 shadow-md" : "border-transparent hover:border-neutral-300"}`}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <img src={image} alt={`Vista ${index + 1}`} className="h-full w-full object-cover" />
                          <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-[10px] font-black text-white">{index + 1}</span>
                        </button>
                      ) : (
                        <div key={index} className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-xs font-black text-neutral-300">{index + 1}</div>
                      );
                    })}
                  </div>
                  {formImages[formImageIndex] ? <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button type="button" disabled={formImageIndex === 0} onClick={() => moveFormImage(formImageIndex, formImageIndex - 1)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-2 text-xs font-black disabled:opacity-35"><ChevronLeft size={15} /> Mover</button>
                    <span className="rounded-full bg-neutral-950 px-3 py-2 text-xs font-black text-white">Vista {formImageIndex + 1} de {formImages.length}</span>
                    <button type="button" disabled={formImageIndex === formImages.length - 1} onClick={() => moveFormImage(formImageIndex, formImageIndex + 1)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-2 text-xs font-black disabled:opacity-35">Mover <ChevronRight size={15} /></button>
                    <button type="button" onClick={() => removeFormImage(formImageIndex)} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-2 text-xs font-black text-rose-700"><Trash2 size={14} /> Quitar</button>
                  </div> : null}
                  <p className="mt-3 text-xs leading-5 text-neutral-500">
                    Selecciona una miniatura para verla. Usa “Mover” para ordenar; la vista 1 será la portada.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.name")}
                    <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    SKU
                    <input readOnly value={editingId ? form.sku : "Se generará al guardar"} className="mt-2 w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-500 outline-none" />
                    <span className="mt-2 block text-xs font-normal leading-5 text-neutral-500">Código automático, legible y único basado en el tipo y el nombre.</span>
                  </label>
                  <div className="sm:col-span-2">
                    <span className="text-sm font-bold text-neutral-700">Imágenes del producto</span>
                    <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-5 py-5 text-sm font-bold text-neutral-700 transition hover:border-primary hover:bg-primary/5">
                      {uploadingImages ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                      {uploadingImages ? "Cargando imágenes…" : "Seleccionar fotografías"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={uploadingImages}
                        onChange={(event) => { void uploadImages(event.target.files); event.currentTarget.value = ""; }}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">Hasta 4 archivos JPG, PNG o WebP. Máximo 2 MB por imagen. La primera fotografía será la portada.</p>
                    <details className="mt-3 text-xs text-neutral-500">
                      <summary className="cursor-pointer font-bold">Usar una ruta existente</summary>
                      <div className="mt-2 flex gap-2">
                        <input id="existing-image-route" placeholder="/images/catalog/producto.webp" className="min-w-0 flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                        <button type="button" onClick={() => { const input = document.getElementById("existing-image-route") as HTMLInputElement | null; const value = input?.value.trim(); if (value) { updateFormImages([...formImages, value], formImages.length); if (input) input.value = ""; } }} className="rounded-2xl bg-neutral-950 px-4 py-3 text-xs font-black text-white">Agregar</button>
                      </div>
                    </details>
                    <div className={`mt-3 rounded-2xl px-4 py-3 text-xs font-bold ${formImages.length === 4 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                      {formImages.length}/4 imágenes · necesitas portada, posterior, detalle y producto completo.
                    </div>
                  </div>

                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.collection")}
                    <select value={form.collection} onChange={(event) => changeCollection(event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="men">{t("categories.men")}</option>
                      <option value="women">{t("categories.women")}</option>
                      <option value="souvenirs">{t("categories.souvenirs")}</option>
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.category")}
                    <select value={form.category} onChange={(event) => changeCategory(event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {(form.collection === "souvenirs" ? ["art", "mugs", "embroidery"] : ["shirts", "hoodies", "caps", "pants", "bags"]).map((item) => <option key={item} value={item}>{t(`categories.${item}`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.subcategory")}
                    <select value={form.subcategory} onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {(form.collection === "souvenirs" ? SOUVENIR_SUBCATEGORIES : APPAREL_SUBCATEGORIES).map((item) => <option key={item} value={item}>{t(`${form.collection === "souvenirs" ? "shop.souvenirFilters" : "shop.subcategories"}.${item}`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.concept")}
                    <select value={form.concept} onChange={(event) => setForm((current) => ({ ...current, concept: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {CONCEPTS.map((item) => <option key={item} value={item}>{t(`concepts.${item}.title`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.color")}
                    <select value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {COLORS.map((item) => <option key={item} value={item}>{t(`shop.colors.${item}`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.gender")}
                    <select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="male">{t("profile.genders.male")}</option>
                      <option value="female">{t("profile.genders.female")}</option>
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.price")}
                    <input type="number" min="0.01" step="0.01" value={form.priceUsd} onChange={(event) => setForm((current) => ({ ...current, priceUsd: Number(event.target.value) }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.compareAt")}
                    <input type="number" min="0" step="0.01" value={form.compareAtPriceUsd ?? ""} onChange={(event) => setForm((current) => ({ ...current, compareAtPriceUsd: event.target.value ? Number(event.target.value) : null }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    Stock actual
                    <input type="number" disabled value={form.stock} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500" />
                    <span className="mt-1 block text-xs font-normal text-neutral-400">Se actualiza desde Operaciones.</span>
                  </label>
                  {form.collection !== "souvenirs" ? (
                    <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                      {t("adminProducts.form.sizes")}
                      <input value={sizesText} onChange={(event) => setSizesText(event.target.value)} placeholder="S, M, L, XL" className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                    </label>
                  ) : null}
                  <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                    {t("adminProducts.form.description")}
                    <textarea value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Explica el material, el corte, el uso y por qué conviene comprarlo." className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm leading-6 outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                    {t("adminProducts.form.story")}
                    <textarea value={form.story ?? ""} onChange={(event) => setForm((current) => ({ ...current, story: event.target.value }))} rows={4} placeholder="Cuenta de forma breve de dónde nace el concepto del producto." className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm leading-6 outline-none focus:border-primary" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <article className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-xl shadow-black/10">
                  <div className="relative">
                    <img src={formImages[formImageIndex] ?? form.image} alt={`${form.name} · vista ${formImageIndex + 1}`} className="aspect-square w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/catalog/coleccion-recuerdos-andes.png"; }} />
                    <span className="absolute right-4 top-4 rounded-full bg-black/80 px-3 py-2 text-xs font-black text-white">Vista {formImageIndex + 1}/4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 border-b border-neutral-100 p-3">
                    {formImages.map((image, index) => <button key={`${image}-preview-${index}`} type="button" onClick={() => setFormImageIndex(index)} className={`aspect-square overflow-hidden rounded-xl border-2 bg-neutral-100 ${formImageIndex === index ? "border-neutral-950" : "border-transparent"}`}><img src={image} alt={`Seleccionar vista ${index + 1}`} className="h-full w-full object-cover" /></button>)}
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">{t(`categories.${form.collection}`)} · {t(`concepts.${form.concept}.title`)}</p>
                    <h3 className="mt-3 font-display text-3xl font-black text-neutral-950">{form.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{form.description}</p>
                    <div className="mt-5 flex items-end gap-3">
                      <span className="text-3xl font-black">{formatMoney(Number(form.priceUsd), "USD")}</span>
                      {form.compareAtPriceUsd ? <span className="pb-1 text-sm font-bold text-neutral-400 line-through">{formatMoney(Number(form.compareAtPriceUsd), "USD")}</span> : null}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {textToList(sizesText).map((size) => <span key={size} className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-black">{size}</span>)}
                      <span className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-black">{t(`shop.colors.${form.color}`)}</span>
                    </div>
                  </div>
                </article>
                <aside className="space-y-4">
                  <div className="rounded-[2rem] bg-[#0a0f1a] p-6 text-white">
                    <ShieldCheck className="text-emerald-300" />
                    <h3 className="mt-4 text-xl font-black">Revisión antes de publicar</h3>
                    <p className="mt-3 text-sm leading-6 text-white/65">Esta es la apariencia comercial. Al enviarlo, un administrador o moderador revisará el contenido. Solo quedará visible cuando esté activo y aprobado.</p>
                  </div>
                  <div className="rounded-[2rem] border border-neutral-200 p-6">
                    <p className="text-sm font-black text-neutral-950">Comprobación editorial</p>
                    <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                      <li>✓ Nombre y SKU identificables</li>
                      <li>✓ Precio y descuento coherentes</li>
                      <li>✓ Imagen principal disponible</li>
                      <li>✓ Descripción útil para comprar</li>
                      <li>✓ Tallas, color y categoría definidos</li>
                    </ul>
                  </div>
                </aside>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-neutral-100 pt-5">
              {formStep === "edit" ? (
                <>
                  <button type="button" onClick={closeForm} className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100">{t("profile.actions.cancel")}</button>
                  <button type="button" onClick={openPreview} className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"><Eye size={18} /> Revisar vista previa</button>
                </>
              ) : (
                <>
                  <button type="button" disabled={saving} onClick={() => setFormStep("edit")} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"><ArrowLeft size={18} /> Volver a editar</button>
                  <button type="button" disabled={saving} onClick={() => void saveProduct("draft")} className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-neutral-100 disabled:opacity-50"><Save size={18} /> Guardar borrador</button>
                  <button type="button" disabled={saving} onClick={() => void saveProduct("active")} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Enviar a moderación</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {deletionProduct ? <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeletionProduct(null); }}>
        <form role="dialog" aria-modal="true" aria-labelledby="deletion-request-title" onSubmit={(event) => void requestPermanentDeletion(event)} className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-rose-700 to-red-950 px-6 py-7 text-white md:px-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-200">Solicitud controlada</p><h2 id="deletion-request-title" className="mt-2 font-display text-3xl font-black">Eliminar producto definitivamente</h2></div>
              <button type="button" aria-label="Cerrar" onClick={() => setDeletionProduct(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><X size={19} /></button>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
              <img src={deletionProduct.image} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              <div><p className="font-black text-neutral-950">{deletionProduct.name}</p><p className="mt-1 font-mono text-xs text-neutral-500">SKU {deletionProduct.sku}</p><p className="mt-1 text-xs text-neutral-500">Stock actual: {deletionProduct.stock ?? 0}</p></div>
            </div>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><b>Requiere aprobación del moderador.</b> Mientras se revisa, el producto quedará oculto. Si posee pedidos, devoluciones o movimientos de inventario, el sistema protegerá el historial y bloqueará la eliminación física.</div>
            <label htmlFor="deletion-reason" className="mt-5 block text-sm font-black text-neutral-800">Razón empresarial de la eliminación</label>
            <textarea id="deletion-reason" autoFocus required minLength={20} maxLength={500} rows={5} value={deletionReason} onChange={(event) => setDeletionReason(event.target.value)} placeholder="Explica por qué debe desaparecer de forma definitiva, por ejemplo: registro duplicado creado por error y sin movimientos comerciales." className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 text-sm leading-6 outline-none focus:border-rose-400" />
            <div className="mt-2 flex justify-between text-xs text-neutral-500"><span>Mínimo 20 caracteres.</span><span>{deletionReason.length}/500</span></div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => { setDeletionProduct(null); setDeletionReason(""); }} className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-black">Cancelar</button>
              <button type="submit" disabled={deletionReason.trim().length < 20 || busyProductAction !== null} className="inline-flex items-center gap-2 rounded-full bg-rose-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{busyProductAction ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />} Enviar al moderador</button>
            </div>
          </div>
        </form>
      </div> : null}
    </div>
  );
}
