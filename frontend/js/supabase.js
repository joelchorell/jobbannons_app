// Initialize the Supabase client
// Replace these with your actual Supabase credentials from your project settings
// Found at: https://app.supabase.com/project/_/settings/api
const supabaseUrl = "https://dayfozuahsvcjylrywcz.supabase.co"; // e.g., "https://abcdefghijklmnopqrst.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheWZvenVhaHN2Y2p5bHJ5d2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyOTA4NjEsImV4cCI6MjA1Nzg2Njg2MX0.pB8GnmGGClOfBkNTxG6776K-8-l0l8ubmW53aCfA8ac"; // Your project's anon/public key

// Create a client
let supabase;

// Import Supabase from CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Initialize the client
supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
