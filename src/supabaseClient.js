// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zqgtxgphvkdlnlqruykb.supabase.co'
const supabaseAnonKey = 'sb_publishable_16djQTEqE5Sb6hJ1HaGDlw_dczpx68-'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)