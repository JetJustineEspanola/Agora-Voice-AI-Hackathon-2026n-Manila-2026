import { useState } from 'react'
import { useVoiceOutput } from '../hooks/useVoiceOutput.js'

export default function VoiceOutput({ sign }) {
  const { session, rtcStatus, error, canSpeak, startSession, stopSession, speakSign } =
    useVoiceOutput()
  const [customText, setCustomText] = useState('')

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Voice Output (Agora ConvoAI)</div>
        <div className="text-xs text-slate-400">{rtcStatus}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!session ? (
          <button
            type="button"
            onClick={startSession}
            className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
          >
            Start Voice Session
          </button>
        ) : (
          <button
            type="button"
            onClick={stopSession}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
          >
            Stop Session
          </button>
        )}

        <button
          type="button"
          disabled={!canSpeak || !sign}
          onClick={() => speakSign(sign, customText ? { text: customText } : undefined)}
          className={[
            'rounded-md px-3 py-2 text-sm font-semibold',
            canSpeak && sign
              ? 'bg-indigo-500 text-indigo-950 hover:bg-indigo-400'
              : 'bg-slate-800 text-slate-500',
          ].join(' ')}
        >
          Speak Detected Sign
        </button>
      </div>

      <div className="mt-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Custom Speak Text (optional)
        </label>
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Override TTS message for demo…"
          className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="mt-3 text-xs text-slate-400">
        TODO: Add auto-speak when sign changes (with debounce + confidence threshold).
      </div>

      {error ? <div className="mt-2 text-xs text-rose-300">Error: {error}</div> : null}
    </div>
  )
}

