#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read

/**
 * One-time script to change admin password
 * Usage: deno run --allow-env --allow-net --allow-read scripts/change-admin-password.ts <new-password>
 */

import { createClient } from 'npm:@supabase/supabase-js@2'

// Load environment variables from .env.local or .env
async function loadEnv() {
  const envFiles = ['.env.local', '.env']
  
  for (const envFile of envFiles) {
    try {
      const text = await Deno.readTextFile(envFile)
      const lines = text.split('\n')
      
      for (const line of lines) {
        const trimmed = line.trim()
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue
        
        const match = trimmed.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          const value = match[2].trim().replace(/^["']|["']$/g, '') // Remove quotes
          Deno.env.set(key, value)
        }
      }
      console.log(`📁 Loaded environment from ${envFile}`)
      break
    } catch {
      // File doesn't exist, try next
      continue
    }
  }
}

await loadEnv()

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const ADMIN_EMAIL = 'info@espboards.dev'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  console.error('Make sure you have these in your .env.local or .env file')
  console.error('\nCurrent values:')
  console.error(`  SUPABASE_URL: ${SUPABASE_URL || 'NOT SET'}`)
  console.error(`  SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '***SET***' : 'NOT SET'}`)
  Deno.exit(1)
}

const newPassword = Deno.args[0]

if (!newPassword) {
  console.error('❌ Error: Please provide a new password')
  console.error('Usage: deno run --allow-env --allow-net --allow-read scripts/change-admin-password.ts <new-password>')
  Deno.exit(1)
}

if (newPassword.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long')
  Deno.exit(1)
}

console.log('🔄 Connecting to Supabase...')

// Create admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log(`🔍 Looking for user: ${ADMIN_EMAIL}`)

// Get user by email
const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

if (listError) {
  console.error('❌ Error listing users:', listError.message)
  Deno.exit(1)
}

const user = users?.find(u => u.email === ADMIN_EMAIL)

if (!user) {
  console.error(`❌ Error: User with email ${ADMIN_EMAIL} not found`)
  console.log('\nAvailable users:')
  users?.forEach(u => console.log(`  - ${u.email} (${u.id})`))
  Deno.exit(1)
}

console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)
console.log('🔄 Updating password...')

// Update user password
const { data, error } = await supabase.auth.admin.updateUserById(
  user.id,
  { password: newPassword }
)

if (error) {
  console.error('❌ Error updating password:', error.message)
  Deno.exit(1)
}

console.log('✅ Password successfully updated!')
console.log(`\nYou can now login with:`)
console.log(`  Email: ${ADMIN_EMAIL}`)
console.log(`  Password: ${newPassword}`)
console.log('\n🔒 Make sure to keep this password secure!')
