const supabaseUrl = "https://dayfozuahsvcjylrywcz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheWZvenVhaHN2Y2p5bHJ5d2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyOTA4NjEsImV4cCI6MjA1Nzg2Njg2MX0.pB8GnmGGClOfBkNTxG6776K-8-l0l8ubmW53aCfA8ac";

// Initialize the Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

export { supabase };
