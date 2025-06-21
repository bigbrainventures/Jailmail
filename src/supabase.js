import { createClient } from '@supabase/supabase-js'

// These are placeholder values - you'll need to replace them with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create a Supabase client that we can use throughout our app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// This function helps us get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// This function helps us sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
} 