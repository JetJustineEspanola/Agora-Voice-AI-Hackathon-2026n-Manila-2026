import { useMemo, useState } from 'react'
import CameraView from '../components/CameraView.jsx'
import SignRecognition from '../components/SignRecognition.jsx'
import VoiceOutput from '../components/VoiceOutput.jsx'
import { useCamera } from '../hooks/useCamera.js'
import SignDatasetRecorder from '../components/SignDatasetRecorder.jsx'

const SIGNS = ['HELP', 'PAIN', 'WATER', 'BATHROOM', 'FIRE']

export default function Home() {
  const { videoRef, status: cameraStatus, error: cameraError } = useCamera()
  const [landmarks, setLandmarks] = useState(null)
  const [primaryLandmarks, setPrimaryLandmarks] = useState(null)
  const [simulatedSign, setSimulatedSign] = useState(null)
  const [detectedSign, setDetectedSign] = useState(null)
  const [confidence, setConfidence] = useState(0)

  const activeSign = useMemo(() => simulatedSign ?? detectedSign, [simulatedSign, detectedSign])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-base font-semibold">Camera</h1>
          <div className="text-xs text-slate-400">Allow camera permission</div>
        </div>
        <CameraView
          videoRef={videoRef}
          status={cameraStatus}
          error={cameraError}
          landmarks={landmarks}
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Detection + Voice</h2>
          <div className="mt-1 text-sm text-slate-300">
            Detected sign: <span className="font-semibold text-white">{activeSign ?? '—'}</span>
            <span className="ml-2 text-xs text-slate-400">
              {activeSign ? `(${Math.round(confidence * 100)}%)` : ''}
            </span>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Demo Controls
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIGNS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSimulatedSign((prev) => (prev === s ? null : s))}
                className={[
                  'rounded-md px-3 py-2 text-sm font-medium',
                  simulatedSign === s
                    ? 'bg-emerald-500 text-emerald-950'
                    : 'bg-slate-800 text-slate-100 hover:bg-slate-700',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSimulatedSign(null)}
              className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
            >
              Clear
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Use buttons for reliable demos. Camera recognition is a starter stub.
          </div>
        </div>

        <div className="grid gap-4">
          <SignRecognition
            videoRef={videoRef}
            onSign={(result) => {
              setDetectedSign(result.sign)
              setConfidence(result.confidence)
            }}
            onLandmarks={setLandmarks}
            onPrimaryLandmarks={setPrimaryLandmarks}
            disabled={Boolean(simulatedSign)}
          />
          <SignDatasetRecorder primaryLandmarks={primaryLandmarks} />
          <VoiceOutput sign={activeSign} />
        </div>
      </section>
    </div>
  )
}
