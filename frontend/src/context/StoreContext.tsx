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
import { products as fallbackCatalog } from "../data/products";
import i18n, { persistLanguage } from "../i18n/config";

const TOKEN_KEY = "eagle_token";
const USER_KEY = "eagle_user";
const CURRENCY_KEY = "eagle_currency";
const WISHLIST_KEY = "eagle_wishlist";
const CART_KEY = "eagle_cart";

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
  refreshProducts: () => Promise<void>;
  setCurrency: (c: CurrencyCode) => void;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    country?: string;
    gender?: string;
    age?: number;
    preferredLanguage?: string;
    preferredCurrency?: CurrencyCode;
    currentLocation?: string;
  }) => Promise<User>;
  uploadAvatar: (file: File) => Promise<User>;
  deleteAvatar: () => Promise<User>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    countryCode: string;
    countryFlag: string;
    birthDate: string;
    age: number;
    gender: string;
  }) => Promise<void>;
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

function readStoredUser(): User | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function readCurrency(): CurrencyCode {
  if (typeof localStorage === "undefined") return "USD";

  const c = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
  return c === "EUR" || c === "GBP" ? c : "USD";
}

function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return value === "USD" || value === "EUR" || value === "GBP";
}

function applyUserPreferences(user: User) {
  if (user.preferredLanguage) {
    void i18n.changeLanguage(user.preferredLanguage);
    persistLanguage(user.preferredLanguage);
  }

  if (isCurrencyCode(user.preferredCurrency)) {
    localStorage.setItem(CURRENCY_KEY, user.preferredCurrency);
  }
}

function readCart(): CartItem[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function readWishlist(): string[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [cart, setCart] = useState<CartItem[]>(() => readCart());
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    readCurrency(),
  );
  const [catalog, setCatalog] = useState<Product[]>(fallbackCatalog);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() =>
    readWishlist(),
  );
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
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
      const storedUser = readStoredUser();

      if (!storedUser) {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        return;
      }

      const { user: currentUser } = await api.me(t);

      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      setUser(currentUser);
      applyUserPreferences(currentUser);
      if (isCurrencyCode(currentUser.preferredCurrency)) {
        setCurrencyState(currentUser.preferredCurrency);
      }
    } catch {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
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
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    applyUserPreferences(res.user);
    if (isCurrencyCode(res.user.preferredCurrency)) {
      setCurrencyState(res.user.preferredCurrency);
    }

    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
      country: string;
      countryCode: string;
      countryFlag: string;
      birthDate: string;
      age: number;
      gender: string;
    }) => {
      const res = await api.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        country: data.country,
        gender: data.gender,
        birthDate: data.birthDate,
        age: data.age,
      });

      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      applyUserPreferences(res.user);
      if (isCurrencyCode(res.user.preferredCurrency)) {
        setCurrencyState(res.user.preferredCurrency);
      }

      setToken(res.token);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setOrders([]);
    setReturns([]);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const { products } = await api.products();
      setCatalog(products);
    } catch {
      setCatalog(fallbackCatalog);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const updateProfile = useCallback(
    async (data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      country?: string;
      gender?: string;
      age?: number;
      preferredLanguage?: string;
      preferredCurrency?: CurrencyCode;
      currentLocation?: string;
    }) => {
      if (!token) throw new Error("Login required");

      const { token: nextToken, user: updatedUser } = await api.updateProfile(
        token,
        data,
      );

      if (nextToken) {
        localStorage.setItem(TOKEN_KEY, nextToken);
        setToken(nextToken);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      applyUserPreferences(updatedUser);

      if (isCurrencyCode(updatedUser.preferredCurrency)) {
        setCurrencyState(updatedUser.preferredCurrency);
      }

      setUser(updatedUser);

      return updatedUser;
    },
    [token],
  );

  const persistUser = useCallback((updatedUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    applyUserPreferences(updatedUser);

    if (isCurrencyCode(updatedUser.preferredCurrency)) {
      setCurrencyState(updatedUser.preferredCurrency);
    }

    setUser(updatedUser);
  }, []);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!token) throw new Error("Login required");

      const { user: updatedUser } = await api.uploadAvatar(token, file);
      persistUser(updatedUser);

      return updatedUser;
    },
    [token, persistUser],
  );

  const deleteAvatar = useCallback(async () => {
    if (!token) throw new Error("Login required");

    const { user: updatedUser } = await api.deleteAvatar(token);
    persistUser(updatedUser);

    return updatedUser;
  }, [token, persistUser]);

  const changePassword = useCallback(
    async (data: { currentPassword: string; newPassword: string }) => {
      if (!token) throw new Error("Login required");

      await api.changePassword(token, data);
    },
    [token],
  );

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
          i.productId === productId
            ? { ...i, quantity: Math.max(0, quantity) }
            : i,
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

    try {
      const { orders: o } = await api.orders(token);
      setOrders(o);
    } catch {
      setOrders([]);
    }
  }, [token]);

  const refreshReturns = useCallback(async () => {
    if (!token) {
      setReturns([]);
      return;
    }

    try {
      const { returns: r } = await api.returnsList(token);
      setReturns(r);
    } catch {
      setReturns([]);
    }
  }, [token]);

  useEffect(() => {
    void refreshOrders();
    void refreshReturns();
  }, [refreshOrders, refreshReturns]);

  const checkoutWishlist = useCallback(async () => {
    if (!token) throw new Error("Login required");
    if (wishlistProductIds.length === 0) throw new Error("Wishlist empty");

    const { order } = await api.checkout(token, {
      items: wishlistProductIds.map((productId) => ({
        productId,
        quantity: 1,
      })),
    });

    clearWishlist();
    await refreshOrders();

    return order;
  }, [token, wishlistProductIds, clearWishlist, refreshOrders]);

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
      refreshProducts,
      setCurrency,
      updateProfile,
      uploadAvatar,
      deleteAvatar,
      changePassword,
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
      catalog,
      orders,
      returns,
      wishlistProductIds,
      loadingAuth,
      refreshProducts,
      setCurrency,
      updateProfile,
      uploadAvatar,
      deleteAvatar,
      changePassword,
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
