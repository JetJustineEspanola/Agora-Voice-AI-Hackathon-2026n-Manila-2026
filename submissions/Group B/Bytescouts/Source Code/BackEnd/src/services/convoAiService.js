import axios from 'axios'

const baseUrl = 'https://api.agora.io/api/conversational-ai-agent/v2/projects'

function buildBasicAuthHeader() {
  const customerId = process.env.AGORA_CUSTOMER_ID
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET
  if (!customerId || !customerSecret) {
    const err = new Error('Missing AGORA_CUSTOMER_ID / AGORA_CUSTOMER_SECRET')
    err.status = 500
    throw err
  }
  const token = Buffer.from(`${customerId}:${customerSecret}`).toString('base64')
  return `Basic ${token}`
}

export async function startConvoAiAgent({ appId, agentName, channel, rtcToken, agentRtcUid, remoteRtcUid }) {
  const url = `${baseUrl}/${appId}/join`
  const headers = {
    Authorization: buildBasicAuthHeader(),
    'Content-Type': 'application/json',
  }

  const payload = {
    name: agentName,
    properties: {
      channel,
      token: rtcToken,
      agent_rtc_uid: String(agentRtcUid),
      remote_rtc_uids: [String(remoteRtcUid)],
      idle_timeout: 0,
      llm: {
        url: 'https://api.openai.com/v1/chat/completions',
        api_key: process.env.OPENAI_API_KEY || '',
        system_messages: [
          {
            role: 'system',
            content:
              'You are a voice assistant for accessibility. Keep responses short and clear.',
          },
        ],
        max_history: 8,
        params: {
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        },
      },
      asr: {
        language: 'en-US',
      },
      tts: {
        vendor: 'microsoft',
        params: {
          key: process.env.AZURE_SPEECH_KEY || '',
          region: process.env.AZURE_SPEECH_REGION || 'eastus',
          voice_name: process.env.AZURE_TTS_VOICE || 'en-US-AndrewMultilingualNeural',
        },
      },
    },
  }

  const resp = await axios.post(url, payload, { headers })
  return resp.data
}

export async function speakConvoAiAgent({ appId, agentId, text }) {
  const url = `${baseUrl}/${appId}/agents/${agentId}/speak`
  const headers = {
    Authorization: buildBasicAuthHeader(),
    'Content-Type': 'application/json',
  }

  const payload = {
    text,
    priority: 'INTERRUPT',
    interruptable: true,
  }

  const resp = await axios.post(url, payload, { headers })
  return resp.data
}

