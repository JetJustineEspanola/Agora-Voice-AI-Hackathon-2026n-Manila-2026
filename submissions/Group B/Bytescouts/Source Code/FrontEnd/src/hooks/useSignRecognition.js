import { useEffect, useMemo, useState } from 'react'
import { classifyLandmarksRuleBased, createHandsTracker, pickPrimaryHand } from '../lib/sign/index.js'

export function useSignRecognition({ videoRef, enabled, classifier }) {
  const [status, setStatus] = useState('idle')
  const [prediction, setPrediction] = useState({ sign: null, confidence: 0 })
  const [handsLandmarks, setHandsLandmarks] = useState([])
  const [primaryLandmarks, setPrimaryLandmarks] = useState(null)
  const tracker = useMemo(() => createHandsTracker({ maxNumHands: 2 }), [])

  useEffect(() => {
    if (!enabled) {
      setStatus('disabled')
      setPrediction({ sign: null, confidence: 0 })
      setHandsLandmarks([])
      setPrimaryLandmarks(null)
      tracker.stop()
      return
    }

    const video = videoRef?.current
    if (!video) return

    let cancelled = false
    let lastSentAt = 0

    tracker.setOnResults((results) => {
      if (cancelled) return
      const now = Date.now()
      if (now - lastSentAt < 250) return
      lastSentAt = now

      const all = results?.multiHandLandmarks ?? []
      setHandsLandmarks(all)

      const { primaryLandmarks } = pickPrimaryHand(results)
      setPrimaryLandmarks(primaryLandmarks)
      if (!primaryLandmarks) {
        setPrediction({ sign: null, confidence: 0 })
        return
      }

      const fn = classifier ?? classifyLandmarksRuleBased
      setPrediction(fn(primaryLandmarks))
    })

    async function start() {
      setStatus('starting')
      await tracker.start(video)
      if (!cancelled) setStatus('running')
    }

    start().catch(() => {
      if (!cancelled) setStatus('error')
    })

    return () => {
      cancelled = true
      tracker.stop()
    }
  }, [classifier, enabled, tracker, videoRef])

  return { status, prediction, handsLandmarks, primaryLandmarks }
}
