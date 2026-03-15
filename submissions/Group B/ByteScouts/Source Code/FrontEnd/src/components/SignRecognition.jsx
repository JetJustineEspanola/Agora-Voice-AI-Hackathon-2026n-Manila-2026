import { useEffect, useMemo, useRef } from 'react'
import { useSignRecognition } from '../hooks/useSignRecognition.js'

function stabilizePrediction(history, options) {
  const minConfidence = options?.minConfidence ?? 0.7
  const stableFrames = options?.stableFrames ?? 5
  const candidates = history.filter((p) => p?.sign && (p?.confidence ?? 0) >= minConfidence)
  if (candidates.length < stableFrames) return { sign: null, confidence: 0 }

  const counts = new Map()
  for (const p of candidates) counts.set(p.sign, (counts.get(p.sign) ?? 0) + 1)
  let bestSign = null
  let bestCount = 0
  for (const [k, v] of counts.entries()) {
    if (v > bestCount) {
      bestCount = v
      bestSign = k
    }
  }

  if (!bestSign || bestCount < stableFrames) return { sign: null, confidence: 0 }
  const bestAvg =
    candidates.filter((c) => c.sign === bestSign).reduce((acc, c) => acc + (c.confidence ?? 0), 0) /
    bestCount

  return { sign: bestSign, confidence: bestAvg }
}

export default function SignRecognition({ videoRef, onSign, onLandmarks, onPrimaryLandmarks, disabled }) {
  const { status, prediction, handsLandmarks, primaryLandmarks } = useSignRecognition({
    videoRef,
    enabled: !disabled,
  })

  useEffect(() => {
    if (!onLandmarks) return
    onLandmarks(handsLandmarks)
  }, [handsLandmarks, onLandmarks])

  useEffect(() => {
    if (!onPrimaryLandmarks) return
    onPrimaryLandmarks(primaryLandmarks)
  }, [onPrimaryLandmarks, primaryLandmarks])

  const handsCount = Array.isArray(handsLandmarks) ? handsLandmarks.length : 0

  const smoothingOptions = useMemo(() => ({ minConfidence: 0.7, stableFrames: 5, windowSize: 8 }), [])
  const historyRef = useRef([])
  const lastEmittedRef = useRef({ sign: null })

  useEffect(() => {
    if (!disabled) return
    historyRef.current = []
    lastEmittedRef.current = { sign: null }
    onSign?.({ sign: null, confidence: 0 })
  }, [disabled, onSign])

  useEffect(() => {
    const windowSize = smoothingOptions.windowSize ?? 8
    historyRef.current = [...historyRef.current, prediction].slice(-windowSize)
    const stable = stabilizePrediction(historyRef.current, smoothingOptions)
    if (stable.sign !== lastEmittedRef.current.sign) {
      lastEmittedRef.current = { sign: stable.sign }
      onSign?.(stable)
    }
  }, [onSign, prediction, smoothingOptions])

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Sign Recognition</div>
        <div className="text-xs text-slate-400">
          {disabled ? 'Disabled (demo buttons active)' : status}
        </div>
      </div>
      <div className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
        <div>
          Hands:{' '}
          <span className="font-semibold text-slate-200">{handsCount > 0 ? handsCount : '0'}</span>
        </div>
        <div>
          Sign:{' '}
          <span className="font-semibold text-slate-200">{prediction.sign ?? '—'}</span>
          <span className="ml-2">{Math.round((prediction.confidence ?? 0) * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
