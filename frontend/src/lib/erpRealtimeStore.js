import { isSupabaseConfigured } from "./supabaseClient";

const STORE_KEY = "__sarvadnyaErpRealtimeStore";

const getStore = () => {
  if (typeof window === "undefined") return {};
  if (!window[STORE_KEY]) {
    window[STORE_KEY] = {};
  }
  return window[STORE_KEY];
};

const clone = (value) => {
  if (value === undefined || value === null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

export const readRealtimeValue = (key, fallback = null) => {
  const store = getStore();
  if (Object.prototype.hasOwnProperty.call(store, key)) {
    return clone(store[key]);
  }

  if (!isSupabaseConfigured && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      console.error(error);
    }
  }

  return fallback;
};

export const readRealtimeList = (key, fallback = []) => {
  const value = readRealtimeValue(key, fallback);
  return Array.isArray(value) ? value : fallback;
};

export const writeRealtimeValue = (key, value, eventName = "", detail = {}) => {
  const store = getStore();
  store[key] = clone(value);

  if (!isSupabaseConfigured && typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }

  if (eventName && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  return value;
};

export const writeRealtimeList = (key, rows = [], eventName = "", detail = {}) => (
  writeRealtimeValue(key, Array.isArray(rows) ? rows : [], eventName, detail)
);
