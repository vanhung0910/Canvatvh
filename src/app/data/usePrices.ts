import { useEffect, useState } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import type { PriceOverrides } from "./products";

const CACHE_KEY = "tvh_prices";
const URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d3e30ca/prices`;

function readCache(): PriceOverrides {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

let current: PriceOverrides = readCache();
let request: Promise<void> | null = null;
const listeners = new Set<(p: PriceOverrides) => void>();

export function setPrices(next: PriceOverrides) {
  current = next;
  localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn(next));
}

function refresh() {
  request ??= fetch(URL, { headers: { Authorization: `Bearer ${publicAnonKey}` } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => setPrices(d?.prices || {}))
    .catch(() => {
      request = null; // thử lại lần sau
    });
  return request;
}

/** Giá admin đã sửa. Hiện ngay bản lưu cache, rồi cập nhật bản mới từ server. */
export function usePrices(): PriceOverrides {
  const [prices, setState] = useState(current);
  useEffect(() => {
    listeners.add(setState);
    refresh();
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return prices;
}
