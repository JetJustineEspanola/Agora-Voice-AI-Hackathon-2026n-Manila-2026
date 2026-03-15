import crypto from 'crypto'
import { buildRtcToken, RtcRole } from '../services/agoraTokenService.js'
import { speakConvoAiAgent, startConvoAiAgent } from '../services/convoAiService.js'

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
    next(err)
  }
}

export async function speakVoiceSession(req, res, next) {
  try {
    const appId = requireEnv('AGORA_APP_ID')
    const { agentId, text } = req.body || {}

    if (!agentId || !text) {
      const err = new Error('agentId and text are required')
      err.status = 400
      throw err
    }

    await speakConvoAiAgent({ appId, agentId, text })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

