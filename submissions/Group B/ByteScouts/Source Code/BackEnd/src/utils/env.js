import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

export function loadEnv() {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  
  // The .env file is in "Source Code/"
  // Current file: .../Source Code/BackEnd/src/utils/env.js
  // Path to .env: ../../../.env
  
  const envPath = path.resolve(dirname, '../../../.env')
  const result = dotenv.config({ path: envPath })
  
  if (result.error) {
    console.warn(`WARNING: Could not load .env from ${envPath}`)
    // Try default local .env just in case
    dotenv.config()
  } else {
    console.log(`[OK] Loaded .env from ${envPath}`)
  }

  // Debug critical keys
  console.log('Loaded Environment Variables Check:')
  console.log('  AGORA_APP_ID:', process.env.AGORA_APP_ID ? 'Set' : 'MISSING')
  console.log('  MINIMAX_API_KEY:', process.env.MINIMAX_API_KEY ? 'Set' : 'MISSING')
  console.log('  LLM_API_KEY:', process.env.LLM_API_KEY ? 'Set' : 'MISSING')
}

