const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

// Initialize the Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

export { supabase };
