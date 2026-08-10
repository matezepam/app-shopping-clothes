import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type RegistrationResponse } from "../lib/api";
import type {
  CartItem,
  CurrencyCode,
  Order,
  Product,
  ReturnRequest,
  User,
} from "../types/store";
import i18n, { persistLanguage } from "../i18n/config";

const TOKEN_KEY = "eagle_token";
const REFRESH_TOKEN_KEY = "eagle_refresh_token";
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
  }) => Promise<RegistrationResponse>;
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
  checkout: (delivery: { shippingAddress: string; contactPhone: string }) => Promise<Order>;
  requestReturn: (payload: {
    orderId: string;
    productId: string;
    quantity: number;
    reason: string;
  }) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
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
  return "USD";
}

function applyUserPreferences(user: User) {
  if (user.preferredLanguage) {
    void i18n.changeLanguage(user.preferredLanguage);
    persistLanguage(user.preferredLanguage);
  }

  localStorage.setItem(CURRENCY_KEY, "USD");
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
  const [catalog, setCatalog] = useState<Product[]>([]);
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

  const setCurrency = useCallback((_c: CurrencyCode) => {
    setCurrencyState("USD");
    localStorage.setItem(CURRENCY_KEY, "USD");
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
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        return;
      }

      let activeToken = t;
      let currentUser: User;
      try {
        ({ user: currentUser } = await api.me(activeToken));
      } catch {
        const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error("Session expired");
        const renewed = await api.refresh(refreshToken, storedUser.email);
        activeToken = renewed.token;
        sessionStorage.setItem(TOKEN_KEY, activeToken);
        setToken(activeToken);
        ({ user: currentUser } = await api.me(activeToken));
      }

      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      setUser(currentUser);
      applyUserPreferences(currentUser);
      setCurrencyState("USD");
    } catch {
      setUser(null);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
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
    const { user: currentUser } = await api.me(res.token);

    sessionStorage.setItem(TOKEN_KEY, res.token);
    if (res.refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    applyUserPreferences(currentUser);
    setCurrencyState("USD");

    setToken(res.token);
    setUser(currentUser);
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
      return api.register({
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

    },
    [],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
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
      setCatalog([]);
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

      const { user: updatedUser } = await api.updateProfile(
        token,
        data,
      );

      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      applyUserPreferences(updatedUser);

      setCurrencyState("USD");

      setUser(updatedUser);

      return updatedUser;
    },
    [token],
  );

  const persistUser = useCallback((updatedUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    applyUserPreferences(updatedUser);

    setCurrencyState("USD");

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
    if (!user?.currentLocation || !user.phone) throw new Error("Completa tu dirección y teléfono en el perfil");

    const { order } = await api.checkout(token, {
      items: wishlistProductIds.map((productId) => ({
        productId,
        quantity: 1,
      })),
      shippingAddress: user?.currentLocation ?? "",
      contactPhone: user?.phone ?? "",
    });

    clearWishlist();
    await refreshOrders();

    return order;
  }, [token, user, wishlistProductIds, clearWishlist, refreshOrders]);

  const checkout = useCallback(async (delivery: { shippingAddress: string; contactPhone: string }) => {
    if (!token) throw new Error("Login required");
    if (cart.length === 0) throw new Error("Cart empty");

    const { order } = await api.checkout(token, {
      items: cart.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
      })),
      ...delivery,
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
