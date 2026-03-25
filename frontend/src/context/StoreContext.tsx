import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type {
  CartItem,
  CurrencyCode,
  Order,
  Product,
  ReturnRequest,
  User,
} from "../types/store";
import { products as catalog } from "../data/products";

const TOKEN_KEY = "eagle_token";
const CURRENCY_KEY = "eagle_currency";
const WISHLIST_KEY = "eagle_wishlist";

type StoreContextValue = {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  currency: CurrencyCode;
  catalog: Product[];
  orders: Order[];
  returns: ReturnRequest[];
  wishlistProductIds: string[];
  loadingAuth: boolean;
  setCurrency: (c: CurrencyCode) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addToCart: (productId: string, qty?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  checkoutWishlist: () => Promise<Order>;
  refreshOrders: () => Promise<void>;
  refreshReturns: () => Promise<void>;
  checkout: () => Promise<Order>;
  requestReturn: (payload: {
    orderId: string;
    productId: string;
    quantity: number;
    reason: string;
  }) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function readCurrency(): CurrencyCode {
  if (typeof localStorage === "undefined") return "USD";
  const c = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
  return c === "EUR" || c === "GBP" ? c : "USD";
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("eagle_cart");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    readCurrency(),
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(
    () => {
      try {
        const raw = localStorage.getItem(WISHLIST_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
      } catch {
        return [];
      }
    },
  );
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    localStorage.setItem("eagle_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistProductIds));
  }, [wishlistProductIds]);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }, []);

  const hydrateUser = useCallback(async (t: string | null) => {
    if (!t) {
      setUser(null);
      setLoadingAuth(false);
      return;
    }
    try {
      const { user: u } = await api.me(t);
      setUser(u);
    } catch {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    void hydrateUser(token);
  }, [token, hydrateUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.register({ name, email, password });
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setOrders([]);
    setReturns([]);
    // Wishlist local (no del servidor) se mantiene para UX, pero puedes
    // limpiarla si prefieres:
    // setWishlistProductIds([]);
  }, []);

  const addToCart = useCallback((productId: string, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === productId);
      if (found) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: Math.max(0, quantity) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistProductIds((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      return [...prev, productId];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistProductIds.includes(productId),
    [wishlistProductIds],
  );

  const clearWishlist = useCallback(() => setWishlistProductIds([]), []);

  const refreshOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      return;
    }
    const { orders: o } = await api.orders(token);
    setOrders(o);
  }, [token]);

  const checkoutWishlist = useCallback(async () => {
    if (!token) throw new Error("Login required");
    if (wishlistProductIds.length === 0) throw new Error("Wishlist empty");
    const { order } = await api.checkout(token, {
      items: wishlistProductIds.map((productId) => ({
        productId,
        // Wishlist: compras 1 unidad por item (ajustable luego).
        quantity: 1,
      })),
    });
    clearWishlist();
    await refreshOrders();
    return order;
  }, [token, wishlistProductIds, clearWishlist, refreshOrders]);

  const refreshReturns = useCallback(async () => {
    if (!token) {
      setReturns([]);
      return;
    }
    const { returns: r } = await api.returnsList(token);
    setReturns(r);
  }, [token]);

  useEffect(() => {
    void refreshOrders();
    void refreshReturns();
  }, [refreshOrders, refreshReturns]);

  const checkout = useCallback(async () => {
    if (!token) throw new Error("Login required");
    if (cart.length === 0) throw new Error("Cart empty");
    const { order } = await api.checkout(token, {
      items: cart.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
      })),
    });
    clearCart();
    await refreshOrders();
    return order;
  }, [token, cart, clearCart, refreshOrders]);

  const requestReturn = useCallback(
    async (payload: {
      orderId: string;
      productId: string;
      quantity: number;
      reason: string;
    }) => {
      if (!token) throw new Error("Login required");
      await api.createReturn(token, payload);
      await refreshReturns();
    },
    [token, refreshReturns],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      user,
      token,
      cart,
      currency,
      catalog,
      orders,
      returns,
      wishlistProductIds,
      loadingAuth,
      setCurrency,
      login,
      register,
      logout,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
      checkoutWishlist,
      refreshOrders,
      refreshReturns,
      checkout,
      requestReturn,
    }),
    [
      user,
      token,
      cart,
      currency,
      orders,
      returns,
      loadingAuth,
      setCurrency,
      login,
      register,
      logout,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
      checkoutWishlist,
      refreshOrders,
      refreshReturns,
      checkout,
      requestReturn,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useProduct(id: string): Product | undefined {
  const { catalog } = useStore();
  return catalog.find((p) => p.id === id);
}
