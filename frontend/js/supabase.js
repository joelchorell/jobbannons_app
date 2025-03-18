// Initialize the Supabase client
// Replace these with your actual Supabase credentials from your project settings
// Found at: https://app.supabase.com/project/_/settings/api
const supabaseUrl = "YOUR_SUPABASE_URL"; // e.g., "https://abcdefghijklmnopqrst.supabase.co"
const supabaseKey = "YOUR_SUPABASE_ANON_KEY"; // Your project's anon/public key

// Create a client
let supabase;

// Import Supabase from CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Initialize the client
supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
