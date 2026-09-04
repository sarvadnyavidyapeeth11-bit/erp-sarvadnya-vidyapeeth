import { createClient } from "@supabase/supabase-js";

// Read Supabase environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  !supabaseUrl.includes("placeholder")
);

// Initialize Supabase Client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    })
  : null;

// Helper to subscribe to realtime changes on any table with optional row-level filter
export const subscribeToRealtimeTable = (tableName, onInsert, onUpdate, onDelete, filter = null) => {
  if (!supabase) return () => {};

  const channelName = filter ? `realtime_${tableName}_${filter.replace(/[^a-zA-Z0-9_]/g, '_')}` : `realtime_${tableName}`;
  const optionsInsert = { event: "INSERT", schema: "public", table: tableName };
  const optionsUpdate = { event: "UPDATE", schema: "public", table: tableName };
  const optionsDelete = { event: "DELETE", schema: "public", table: tableName };

  if (filter) {
    optionsInsert.filter = filter;
    optionsUpdate.filter = filter;
    optionsDelete.filter = filter;
  }

  const channel = supabase
    .channel(channelName)
    .on("postgres_changes", optionsInsert, (payload) => onInsert && onInsert(payload.new))
    .on("postgres_changes", optionsUpdate, (payload) => onUpdate && onUpdate(payload.new))
    .on("postgres_changes", optionsDelete, (payload) => onDelete && onDelete(payload.old))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

if (!isSupabaseConfigured) {
  console.info(
    "[Sarvadnya ERP] Running in Standalone Local/Demo Mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env to activate Live Supabase Cloud Database."
  );
} else {
  console.info("[Sarvadnya ERP] Connected to Live Supabase Cloud Database & Realtime Sync Engine.");
}
