import express from 'express'
import cors from 'cors'
import { loadEnv } from './src/utils/env.js'
import { errorHandler } from './src/middleware/errorHandler.js'
import { signRouter } from './src/routes/signRoutes.js'
import { voiceRouter } from './src/routes/voiceRoutes.js'

loadEnv()

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: false,
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api', signRouter)
app.use('/api', voiceRouter)

app.use(errorHandler)

const port = Number(process.env.PORT || 5050)
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
