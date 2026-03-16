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
      // If no API key, we can't use LLM - but for "speak" only mode, 
      // we might not strictly need it if we only trigger TTS manually.
      // However, Agora ConvoAI usually requires valid LLM config to start.
      // We will provide a dummy structure if key is missing to prevent crash,
      // but the agent might fail to "chat" autonomously (which is fine for this use case).
      llm: {
        url: process.env.LLM_URL || 'https://api.openai.com/v1/chat/completions',
        api_key: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || 'PLACEHOLDER_KEY',
        system_messages: [
          {
            role: 'system',
            content:
              'You are a voice assistant for accessibility. Keep responses short and clear.',
          },
        ],
        max_history: 8,
        params: {
          model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        },
      },
      asr: {
        language: 'en-US',
      },
      tts: {
        vendor: 'minimax',
        params: {
          key: process.env.MINIMAX_API_KEY || process.env.AZURE_SPEECH_KEY || 'PLACEHOLDER_KEY',
          group_id: process.env.MINIMAX_GROUP_ID || '', 
          model: 'speech-01', // Minimax model name
          voice_name: process.env.MINIMAX_VOICE_NAME || 'speech-01-01', 
        },
      },
    },
  }

  // Sanitize key for logging
  const safePayload = JSON.parse(JSON.stringify(payload))
  if (safePayload.properties.llm.api_key) safePayload.properties.llm.api_key = '***'
  if (safePayload.properties.tts.params.key) safePayload.properties.tts.params.key = '***'
  
  console.log('[ConvoAI] Joining with payload:', JSON.stringify(safePayload, null, 2))

  try {
    const resp = await axios.post(url, payload, { headers })
    return resp.data
  } catch (err) {
    console.error('[ConvoAI] Error starting agent:', JSON.stringify(err.response?.data || err.message, null, 2))
    // Re-throw with more context if available
    if (err.response?.data) {
      const enhancedError = new Error(JSON.stringify(err.response.data))
      enhancedError.status = err.response.status
      throw enhancedError
    }
    throw err
  }
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

export async function stopConvoAiAgent({ appId, agentId }) {
  const url = `${baseUrl}/${appId}/agents/${agentId}/leave`
  const headers = {
    Authorization: buildBasicAuthHeader(),
    'Content-Type': 'application/json',
  }

  const payload = {}

  const resp = await axios.post(url, payload, { headers })
  return resp.data
}


