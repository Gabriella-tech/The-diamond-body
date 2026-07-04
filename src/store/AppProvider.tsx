import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AppCtx,
  type AppState,
  type CartItem,
  type Order,
  type Toast,
  type User,
  type OrderStatus,
  type PaymentStatus,
  type PaymentMethod,
  type DeliveryMethod,
} from "./store";
import { NATIONS, type Nation } from "../data/nations";
import { SEED_PICKUP_STATIONS, type PickupStation, DELIVERY_FEE } from "../data/pickupStations";
import { PRODUCTS, type Product } from "../data/products";
import { apiService } from "../apiService";

const LS_KEY = "diamondbody.v4";

type Persisted = {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  pickupStations: PickupStation[];
  subscribers: string[];
};

function loadInitial(): Persisted {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (!parsed.pickupStations || parsed.pickupStations.length === 0) {
        parsed.pickupStations = SEED_PICKUP_STATIONS;
      }
      return parsed;
    }
  } catch {}
  return {
    user: null,
    cart: [],
    wishlist: [],
    orders: seedOrders(),
    pickupStations: SEED_PICKUP_STATIONS,
    subscribers: ["wellness@example.com", "kemi@example.com"],
  };
}

const SEED_CUSTOMERS = [
  { name: "Amara Okafor",   email: "amara@example.com",   phone: "+2348012345001", city: "Lekki",         state: "Lagos",   street: "12 Admiralty Way" },
  { name: "Tunde Adebayo",  email: "tundec@example.com",  phone: "+2348012345002", city: "Abuja",         state: "FCT",     street: "Plot 5, Wuse II" },
  { name: "Ngozi Ibe",      email: "ngozi@example.com",   phone: "+2348012345003", city: "Port Harcourt", state: "Rivers",  street: "22 Aba Road" },
  { name: "Kemi Bello",     email: "kemi@example.com",    phone: "+2348012345004", city: "Ibadan",        state: "Oyo",     street: "10 Bodija Street" },
  { name: "Emeka Uzo",      email: "emekac@example.com",  phone: "+2348012345005", city: "Enugu",         state: "Enugu",   street: "8 Independence Layout" },
  { name: "Funmi Alabi",    email: "funmi@example.com",   phone: "+2348012345006", city: "Lekki",         state: "Lagos",   street: "44 Chevron Drive" },
  { name: "David Mensah",   email: "davidc@example.com",  phone: "+2348012345007", city: "Ikeja",         state: "Lagos",   street: "9 Allen Avenue" },
  { name: "Chioma Eze",     email: "chiomac@example.com", phone: "+2348012345008", city: "Owerri",        state: "Imo",     street: "5 Wetheral Road" },
  { name: "Yusuf Bala",     email: "yusuf@example.com",   phone: "+2348012345009", city: "Kano",          state: "Kano",    street: "11 Bompai Road" },
  { name: "Blessing Akpan", email: "blessingc@example.com",phone:"+2348012345010", city: "Uyo",           state: "Akwa Ibom", street: "3 Oron Road" },
];

function pad(n: number, w = 4) { return String(n).padStart(w, "0"); }

function seedOrders(): Order[] {
  const orders: Order[] = [];
  const statuses: OrderStatus[] = ["Pending", "Awaiting Payment", "Paid", "Processing", "Shipped", "Delivered", "Cancelled"];
  const methods: PaymentMethod[] = ["Paystack", "Bank Transfer"];

  const rand = mulberry32(20260411);

  for (let i = 0; i < 20; i++) {
    const c = SEED_CUSTOMERS[i % SEED_CUSTOMERS.length];
    const nation = NATIONS[i % NATIONS.length];
    const numItems = 1 + Math.floor(rand() * 3);
    const items: Order["items"] = [];
    for (let j = 0; j < numItems; j++) {
      const p = PRODUCTS[Math.floor(rand() * PRODUCTS.length)];
      if (items.find((it) => it.productId === p.id)) continue;
      items.push({ productId: p.id, name: p.name, price: p.price, quantity: 1 + Math.floor(rand() * 3) });
    }
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

    const deliveryMethod: DeliveryMethod = i % 2 === 0 ? "Home Delivery" : "Pickup Station";
    const shipping = deliveryMethod === "Pickup Station" ? 0 : DELIVERY_FEE;
    const pickup = deliveryMethod === "Pickup Station"
      ? SEED_PICKUP_STATIONS[i % SEED_PICKUP_STATIONS.length]
      : null;

    const discount = i % 5 === 0 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + shipping - discount;

    const method: PaymentMethod = methods[i % 2];
    const status: OrderStatus = statuses[i % statuses.length];
    let paymentStatus: PaymentStatus = "Paid";
    let bankProofUrl: string | undefined;
    let paystackReference: string | undefined;

    if (method === "Paystack") {
      paymentStatus = status === "Pending" || status === "Awaiting Payment" ? "Unpaid" : "Paid";
      if (paymentStatus === "Paid") paystackReference = "PSK_" + Math.floor(rand() * 1e8).toString(36).toUpperCase();
    } else {
      if (status === "Pending") {
        paymentStatus = "Unpaid";
      } else if (status === "Awaiting Payment") {
        paymentStatus = "Awaiting Verification";
        bankProofUrl = `https://res.cloudinary.com/diamondbody/image/upload/v1/proofs/proof_${pad(i + 1)}.jpg`;
      } else {
        paymentStatus = "Paid";
        bankProofUrl = `https://res.cloudinary.com/diamondbody/image/upload/v1/proofs/proof_${pad(i + 1)}.jpg`;
      }
    }

    const dateBase = new Date("2026-02-01T09:00:00Z").getTime();
    const date = new Date(dateBase + i * 36 * 60 * 60 * 1000).toISOString();

    orders.push({
      id: "DB-2026-" + pad(i + 1),
      date,
      userId: "u-seed-" + (i + 1),
      customerName: c.name,
      email: c.email,
      phone: c.phone,
      address: {
        id: "addr-" + (i + 1),
        label: "Home",
        fullName: c.name,
        phone: c.phone,
        street: c.street,
        city: c.city,
        state: c.state,
        country: "Nigeria",
      },
      items,
      total,
      shippingFee: shipping,
      discount,
      promoCode: discount > 0 ? "DIAMOND10" : undefined,
      paymentMethod: method,
      paymentStatus,
      paystackReference,
      bankProofUrl,
      status,
      nationId: nation.id,
      nationName: nation.name,
      nationSlug: nation.slug,
      referralCode: i % 3 === 0 ? `REF-${pad(1000 + i, 4)}` : undefined,
      deliveryMethod,
      pickupStationId: pickup?.id,
      pickupStationName: pickup?.name,
      trackingNumber: ["Shipped", "Delivered"].includes(status) ? "DHL-" + pad(99210000 + i) : undefined,
    });
  }
  return orders;
}

function mulberry32(seed: number) {
  let a = seed;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const init = useMemo(loadInitial, []);
  const [user, setUser] = useState<User | null>(init.user);
  const [cart, setCart] = useState<CartItem[]>(init.cart);
  const [wishlist, setWishlist] = useState<string[]>(init.wishlist);
  const [orders, setOrders] = useState<Order[]>(init.orders);
  const [pickupStations, setPickupStations] = useState<PickupStation[]>(init.pickupStations);
  const [subscribers, setSubscribers] = useState<string[]>(init.subscribers);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Backend Pipeline State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const nations: Nation[] = NATIONS;

  useEffect(() => {
    async function fetchLiveProducts() {
      setLoading(true);
      setError(null);
      try {
        const liveData = await apiService.getProducts();
        // Only override our items if the server actually has products inside its database
        if (liveData && Array.isArray(liveData) && liveData.length > 0) {
          setProducts(liveData);
        }
      } catch (err: any) {
        console.error("Backend fetch failed, holding onto local fallbacks:", err);
        setError(err.message || "Failed to load products from server");
      } finally {
        setLoading(false);
      }
    }
    fetchLiveProducts();
  }, []);

  useEffect(() => {
    const data: Persisted = { user, cart, wishlist, orders, pickupStations, subscribers };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch {}
  }, [user, cart, wishlist, orders, pickupStations, subscribers]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((cur) => cur.filter((x) => x.id !== id));
  }, []);

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      setCart((cur) => {
        const found = cur.find((c) => c.productId === productId);
        if (found) {
          return cur.map((c) =>
            c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c
          );
        }
        return [...cur, { productId, quantity }];
      });
      toast({ type: "success", message: "Added to cart" });
    },
    [toast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((cur) => cur.filter((c) => c.productId !== productId));
  }, []);

  const updateCartQty = useCallback((productId: string, quantity: number) => {
    setCart((cur) =>
      cur
        .map((c) => (c.productId === productId ? { ...c, quantity } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((cur) => {
        if (cur.includes(productId)) {
          toast({ type: "info", message: "Removed from wishlist" });
          return cur.filter((id) => id !== productId);
        }
        toast({ type: "success", message: "Added to wishlist" });
        return [...cur, productId];
      });
    },
    [toast]
  );

  const addOrder = useCallback((order: Order) => {
    setOrders((cur) => [order, ...cur]);
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const addPickupStation = useCallback((p: PickupStation) => {
    setPickupStations((cur) => [p, ...cur]);
  }, []);
  const updatePickupStation = useCallback((id: string, patch: Partial<PickupStation>) => {
    setPickupStations((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);
  const deletePickupStation = useCallback((id: string) => {
    setPickupStations((cur) => cur.filter((p) => p.id !== id));
  }, []);

  const subscribe = useCallback(
    (email: string) => {
      setSubscribers((cur) => (cur.includes(email) ? cur : [...cur, email]));
      toast({ type: "success", message: "Subscribed to wellness updates" });
    },
    [toast]
  );

  const value: AppState = {
    products,
    loading,
    error,
    user,
    cart,
    wishlist,
    orders,
    nations,
    pickupStations,
    subscribers,
    toasts,
    setUser,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    toggleWishlist,
    addOrder,
    updateOrder,
    addPickupStation,
    updatePickupStation,
    deletePickupStation,
    subscribe,
    toast,
    dismissToast,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}