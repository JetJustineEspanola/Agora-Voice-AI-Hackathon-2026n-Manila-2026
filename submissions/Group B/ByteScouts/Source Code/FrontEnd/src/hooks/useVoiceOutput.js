import { useCallback, useMemo, useRef, useState } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { api } from '../lib/api.js'

const DEFAULT_SIGN_MESSAGES = {
  HELP: 'Help! Please assist me.',
  PAIN: 'I am in pain. Please help me.',
  WATER: 'I need water, please.',
  BATHROOM: 'I need to use the bathroom.',
  FIRE: 'Fire! Please call for help.',
}

export function useVoiceOutput() {
  const rtcClientRef = useRef(null)
  const playingTrackRef = useRef(null)

  const [session, setSession] = useState(null)
  const [rtcStatus, setRtcStatus] = useState('idle')
  const [error, setError] = useState(null)

  const canSpeak = useMemo(() => Boolean(session?.agentId), [session?.agentId])

  const startSession = useCallback(async () => {
    setError(null)
    setRtcStatus('starting')

    try {
      const resp = await api.post('/api/voice/session/start', {})
      const nextSession = resp.data
      setSession(nextSession)

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      rtcClientRef.current = client

      client.on('user-published', async (user, mediaType) => {
        if (mediaType !== 'audio') return
        await client.subscribe(user, mediaType)
        const track = user.audioTrack
        if (track) {
          playingTrackRef.current?.stop()
          playingTrackRef.current = track
          track.play()
        }
      })

      client.on('user-unpublished', () => {
        playingTrackRef.current?.stop()
        playingTrackRef.current = null
      })

      await client.join(nextSession.appId, nextSession.channel, nextSession.rtcToken, nextSession.uid)
      setRtcStatus('joined')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setRtcStatus('error')
    }
  }, [])

  const stopSession = useCallback(async () => {
    setError(null)
    try {
      playingTrackRef.current?.stop()
      playingTrackRef.current = null
      await rtcClientRef.current?.leave()
      rtcClientRef.current = null
    } finally {
      setSession(null)
      setRtcStatus('idle')
    }
  }, [])

  const speakSign = useCallback(
    async (sign, overrides) => {
      if (!session?.agentId) return
      const text = overrides?.text ?? DEFAULT_SIGN_MESSAGES[sign] ?? `Detected sign: ${sign}.`

      // TODO: Add confidence thresholding / cooldown to avoid repeated speech spam.
      await api.post('/api/voice/session/speak', { agentId: session.agentId, text })
    },
    [session?.agentId],
  )

  return { session, rtcStatus, error, canSpeak, startSession, stopSession, speakSign }
}

