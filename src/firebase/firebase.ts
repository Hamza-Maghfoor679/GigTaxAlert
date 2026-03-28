import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nmeycrcrinthkqkdkmcj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZXljcmNyaW50aGtxa2RrbWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDgyOTUsImV4cCI6MjA4OTUyNDI5NX0.OsN4fvDVquKwogMYXOB4_oxj_6JMC_IJnqGbUKQi7ww'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,       // persist session on device
        autoRefreshToken: true,      // auto refresh expired tokens
        persistSession: true,        // keep user logged in
        detectSessionInUrl: false,   // required for React Native
    },
})