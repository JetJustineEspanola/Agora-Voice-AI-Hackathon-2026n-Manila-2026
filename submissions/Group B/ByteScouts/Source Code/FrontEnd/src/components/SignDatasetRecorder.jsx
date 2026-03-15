import { useMemo, useState } from 'react'
import { createDatasetStore } from '../lib/sign/index.js'
import { api } from '../lib/api.js'

const SIGNS = ['HELP', 'PAIN', 'WATER', 'BATHROOM', 'FIRE']

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function SignDatasetRecorder({ primaryLandmarks }) {
  const store = useMemo(() => createDatasetStore({ storageKey: 'bslvb.sign.dataset.v1' }), [])
  const [counts, setCounts] = useState(() => store.getCounts())
  const [importText, setImportText] = useState('')
  const [status, setStatus] = useState('idle')

  const canCapture = Array.isArray(primaryLandmarks) && primaryLandmarks.length >= 21

  function refreshCounts() {
    setCounts(store.getCounts())
  }

  async function trainBackend() {
    setStatus('training')
    try {
      const dataset = store.getDataset()
      await api.post('/api/sign-model/train', { dataset })
      setStatus('trained')
    } catch {
      setStatus('train_error')
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Dataset Recorder</div>
        <div className="text-xs text-slate-400">
          {canCapture ? 'Hand ready' : 'Show a hand to capture'}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SIGNS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={!canCapture}
            onClick={() => {
              store.addSample(s, primaryLandmarks)
              refreshCounts()
            }}
            className={[
              'rounded-md px-3 py-2 text-sm font-semibold',
              canCapture
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-600',
            ].join(' ')}
          >
            + {s} <span className="ml-1 text-xs text-slate-400">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            downloadText('bslvb_dataset.json', store.exportJson())
          }}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-indigo-950 hover:bg-indigo-400"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => {
            store.clear()
            refreshCounts()
          }}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={trainBackend}
          className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          Train Backend
        </button>
        <div className="self-center text-xs text-slate-400">{status}</div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste exported dataset JSON here to import…"
          className="min-h-24 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500"
        />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              store.importJson(importText)
              refreshCounts()
            }}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
          >
            Import JSON
          </button>
          <div className="text-xs text-slate-400">
            Capture 50–200 samples per sign for a solid demo.
          </div>
        </div>
      </div>
    </div>
  )
}

