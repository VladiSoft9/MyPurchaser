import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if(!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Correct Supabase URL and Anon / Publishable Key must be provided in environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
