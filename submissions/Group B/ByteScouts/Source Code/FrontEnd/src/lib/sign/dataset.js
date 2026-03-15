function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function normalizeDatasetShape(dataset) {
  if (!dataset || typeof dataset !== 'object') return { version: 1, samples: {} }
  if (dataset.version !== 1) return { version: 1, samples: {} }
  if (!dataset.samples || typeof dataset.samples !== 'object') return { version: 1, samples: {} }
  return { version: 1, samples: dataset.samples }
}

export function createDatasetStore({ storageKey }) {
  const key = storageKey || 'bslvb.sign.dataset.v1'

  function read() {
    const raw = localStorage.getItem(key)
    if (!raw) return { version: 1, samples: {} }
    const parsed = safeJsonParse(raw)
    return normalizeDatasetShape(parsed)
  }

  function write(dataset) {
    localStorage.setItem(key, JSON.stringify(dataset))
  }

  function addSample(label, landmarks) {
    if (!label) return
    if (!Array.isArray(landmarks) || landmarks.length < 21) return

    const dataset = read()
    const next = { ...dataset, samples: { ...dataset.samples } }
    const arr = Array.isArray(next.samples[label]) ? [...next.samples[label]] : []
    arr.push(landmarks)
    next.samples[label] = arr
    write(next)
  }

  function clear() {
    write({ version: 1, samples: {} })
  }

  function exportJson() {
    return JSON.stringify(read(), null, 2)
  }

  function importJson(text) {
    const parsed = safeJsonParse(text)
    const dataset = normalizeDatasetShape(parsed)
    write(dataset)
    return dataset
  }

  function getCounts() {
    const dataset = read()
    const counts = {}
    for (const [k, v] of Object.entries(dataset.samples)) {
      counts[k] = Array.isArray(v) ? v.length : 0
    }
    return counts
  }

  function getDataset() {
    return read()
  }

  return { addSample, clear, exportJson, importJson, getCounts, getDataset }
}

