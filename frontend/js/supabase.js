// Initialize the Supabase client
// Replace these with your actual Supabase credentials
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

// Create a client
let supabase;

// Import Supabase from CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Initialize the client
supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
