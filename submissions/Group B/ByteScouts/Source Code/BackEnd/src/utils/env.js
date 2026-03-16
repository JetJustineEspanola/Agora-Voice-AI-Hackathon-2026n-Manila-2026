import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

export function loadEnv() {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const rootEnvPath = path.resolve(dirname, '../../.env')
  dotenv.config({ path: rootEnvPath })
  dotenv.config()
}

