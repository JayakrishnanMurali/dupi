import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";
import type { Database } from "./types";

export const createClient = () => {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
};
