import { useEffect } from 'react'
import { useSignRecognition } from '../hooks/useSignRecognition.js'

export default function SignRecognition({ videoRef, onSign, disabled }) {
  const { status, lastResult } = useSignRecognition({ videoRef, enabled: !disabled })

  useEffect(() => {
    if (!onSign) return
    onSign(lastResult)
  }, [lastResult, onSign])

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Sign Recognition</div>
        <div className="text-xs text-slate-400">
          {disabled ? 'Disabled (demo buttons active)' : status}
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        TODO: Improve classifier accuracy (rule-based → TFJS model).
      </div>
    </div>
  )
}

