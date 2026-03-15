import crypto from 'crypto'
import { buildRtcToken, RtcRole } from '../services/agoraTokenService.js'
import { speakConvoAiAgent, startConvoAiAgent, stopConvoAiAgent } from '../services/convoAiService.js'

// Simple in-memory rate limiter
const rateLimits = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 20

function checkRateLimit(ip) {
  const now = Date.now()
  let record = rateLimits.get(ip)
  
  if (!record || record.resetTime < now) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
    rateLimits.set(ip, record)
    return true
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false
  }
  
  record.count += 1
  return true
}

function requireEnv(name) {
  const v = process.env[name]
  if (!v) {
    const err = new Error(`Missing ${name}`)
    err.status = 500
    throw err
  }
  return v
}

export async function startVoiceSession(req, res, next) {
  try {
    const ip = req.ip || req.socket.remoteAddress
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' })
    }

    const appId = requireEnv('AGORA_APP_ID')
    const appCertificate = requireEnv('AGORA_APP_CERTIFICATE')

    const channel = `bslvb_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`
    const agentUid = crypto.randomInt(100000, 999999)
    const clientUid = crypto.randomInt(100000, 999999)

    const agentRtcToken = buildRtcToken({
      appId,
      appCertificate,
      channel,
      uid: agentUid,
      role: RtcRole.PUBLISHER,
    })

    const clientRtcToken = buildRtcToken({
      appId,
      appCertificate,
      channel,
      uid: clientUid,
      role: RtcRole.SUBSCRIBER,
    })

    const agentName = `bslvb_agent_${crypto.randomUUID().slice(0, 8)}`
    const joinResp = await startConvoAiAgent({
      appId,
      agentName,
      channel,
      rtcToken: agentRtcToken,
      agentRtcUid: agentUid,
      remoteRtcUid: clientUid,
    })

    res.json({
      appId,
      channel,
      uid: clientUid,
      rtcToken: clientRtcToken,
      agentId: joinResp.agent_id,
    })
  } catch (err) {
    console.error('startVoiceSession error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to start voice session' })
  }
}

export async function speakVoiceSession(req, res, next) {
  try {
    const ip = req.ip || req.socket.remoteAddress
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' })
    }

    const appId = requireEnv('AGORA_APP_ID')
    const { agentId, text } = req.body || {}

    if (!agentId || typeof agentId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing agentId' })
    }
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Invalid or missing text' })
    }

    await speakConvoAiAgent({ appId, agentId, text: text.trim() })
    res.json({ ok: true })
  } catch (err) {
    console.error('speakVoiceSession error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to speak via agent' })
  }
}

export async function stopVoiceSession(req, res, next) {
  try {
    const appId = requireEnv('AGORA_APP_ID')
    const { agentId } = req.body || {}

    if (!agentId || typeof agentId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing agentId' })
    }

    await stopConvoAiAgent({ appId, agentId })
    res.json({ ok: true })
  } catch (err) {
    console.error('stopVoiceSession error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to stop agent' })
  }
}

