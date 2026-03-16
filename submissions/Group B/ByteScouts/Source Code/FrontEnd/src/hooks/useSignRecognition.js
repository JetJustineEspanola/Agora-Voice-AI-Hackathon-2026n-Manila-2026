import { useEffect, useMemo, useState } from 'react'
import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'
import { api } from '../lib/api.js'

function buildHands() {
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  })

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  })

  return hands
}

export function useSignRecognition({ videoRef, enabled }) {
  const [status, setStatus] = useState('idle')
  const [lastResult, setLastResult] = useState({ sign: null, confidence: 0 })
  const [landmarks, setLandmarks] = useState(null)
  const hands = useMemo(() => buildHands(), [])

  useEffect(() => {
    if (!enabled) {
      setStatus('disabled')
      return
    }

    const video = videoRef?.current
    if (!video) return

    let cancelled = false
    let camera = null
    let lastSentAt = 0

    hands.onResults(async (results) => {
      if (cancelled) return
      const lms = results.multiHandLandmarks?.[0] ?? null
      setLandmarks(lms)

      if (!lms) {
        setLastResult({ sign: null, confidence: 0 })
        return
      }

      const now = Date.now()
      if (now - lastSentAt < 250) return
      lastSentAt = now

      try {
        const resp = await api.post('/api/recognize-sign', { landmarks: lms })
        if (cancelled) return
        setLastResult(resp.data)
      } catch {
        if (cancelled) return
        setLastResult((prev) => prev)
      }
    })

    async function start() {
      setStatus('starting')

      camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video })
        },
        width: 640,
        height: 360,
      })

      await camera.start()
      if (!cancelled) setStatus('running')
    }

    start().catch(() => {
      if (!cancelled) setStatus('error')
    })

    return () => {
      cancelled = true
      try {
        camera?.stop()
      } catch {
        // no-op
      }
    }
  }, [enabled, hands, videoRef])

  return { status, lastResult, landmarks }
}

