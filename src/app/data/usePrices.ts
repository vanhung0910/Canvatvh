import { useEffect, useState } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import type { PriceOverrides, ProductOrder } from "./products";

const CACHE_KEY = "tvh_prices";
const URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d3e30ca/prices`;

type Catalog = { prices: PriceOverrides; order: ProductOrder };

function readCache(): Catalog {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    return { prices: c.prices || {}, order: c.order || {} };
  } catch {
    return { prices: {}, order: {} };
  }
}

let current: Catalog = readCache();
let request: Promise<void> | null = null;
const listeners = new Set<(c: Catalog) => void>();

function publish(next: Catalog) {
  current = next;
  localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn(next));
}

export const setPrices = (prices: PriceOverrides) => publish({ ...current, prices });
export const setOrder = (order: ProductOrder) => publish({ ...current, order });

function refresh() {
  request ??= fetch(URL, { headers: { Authorization: `Bearer ${publicAnonKey}` } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => publish({ prices: d?.prices || {}, order: d?.order || {} }))
    .catch(() => {
      request = null; // thử lại lần sau
    });
  return request;
}

/** Giá + thứ tự admin đã sửa. Hiện ngay bản lưu cache, rồi cập nhật bản mới từ server. */
export function useCatalog(): Catalog {
  const [catalog, setState] = useState(current);
  useEffect(() => {
    listeners.add(setState);
    refresh();
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return catalog;
}

export const usePrices = (): PriceOverrides => useCatalog().prices;
