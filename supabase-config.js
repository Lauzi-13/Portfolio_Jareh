// ============================================================
// Supabase connection settings for the booking form.
//
// 1. Create a free project at https://supabase.com
// 2. In your project: Settings -> API
// 3. Copy the "Project URL" and the "anon public" key below.
//    (The anon key is SAFE to expose in frontend code — it is
//    designed for this. Row Level Security on the "bookings"
//    table controls what it's allowed to do: insert only.)
// ============================================================

const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE";

const supabaseClient =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
