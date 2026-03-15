const TIP_IDS = [4, 8, 12, 16, 20]
const PIP_IDS = [3, 6, 10, 14, 18]

function isValidLandmarks(landmarks) {
  return Array.isArray(landmarks) && landmarks.length >= 21
}

function distance2(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = (a.z ?? 0) - (b.z ?? 0)
  return dx * dx + dy * dy + dz * dz
}

export function normalizeLandmarks(landmarks) {
  if (!isValidLandmarks(landmarks)) return null

  const wrist = landmarks[0]
  const middleMcp = landmarks[9]
  if (!wrist || !middleMcp) return null

  const scale = Math.sqrt(distance2(wrist, middleMcp))
  if (!Number.isFinite(scale) || scale <= 0) return null

  const vec = []
  for (const p of landmarks.slice(0, 21)) {
    const x = ((p.x ?? 0) - (wrist.x ?? 0)) / scale
    const y = ((p.y ?? 0) - (wrist.y ?? 0)) / scale
    const z = ((p.z ?? 0) - (wrist.z ?? 0)) / scale
    vec.push(x, y, z)
  }
  return vec
}

function meanVector(vectors) {
  if (!vectors.length) return null
  const dim = vectors[0].length
  const sum = new Array(dim).fill(0)
  for (const v of vectors) {
    for (let i = 0; i < dim; i += 1) sum[i] += v[i]
  }
  return sum.map((x) => x / vectors.length)
}

function euclideanDistanceSquared(a, b) {
  let acc = 0
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i]
    acc += d * d
  }
  return acc
}

let centroidModel = null

export function getCentroidModel() {
  return centroidModel
}

export function setCentroidModel(model) {
  if (!model) {
    centroidModel = null
    return
  }
  if (!Array.isArray(model.labels) || !Array.isArray(model.centroids)) {
    throw new Error('Invalid centroid model')
  }
  centroidModel = model
}

export function trainNearestCentroidModel(dataset) {
  const samples = dataset?.samples ?? dataset
  if (!samples || typeof samples !== 'object') throw new Error('Invalid dataset')

  const labels = []
  const centroids = []

  for (const [label, rawSamples] of Object.entries(samples)) {
    const vectors = []
    const arr = Array.isArray(rawSamples) ? rawSamples : []
    for (const landmarks of arr) {
      const v = Array.isArray(landmarks) && typeof landmarks[0] === 'number' ? landmarks : normalizeLandmarks(landmarks)
      if (v && v.length) vectors.push(v)
    }
    const centroid = meanVector(vectors)
    if (centroid) {
      labels.push(label)
      centroids.push(centroid)
    }
  }

  const model = { labels, centroids }
  setCentroidModel(model)
  return model
}

export function classifyWithCentroidModel(landmarks, model) {
  const v = normalizeLandmarks(landmarks)
  if (!v) return { sign: null, confidence: 0 }
  if (!model?.labels?.length || !model?.centroids?.length) return { sign: null, confidence: 0 }

  let bestIdx = -1
  let best = Number.POSITIVE_INFINITY
  let second = Number.POSITIVE_INFINITY

  for (let i = 0; i < model.centroids.length; i += 1) {
    const d = euclideanDistanceSquared(v, model.centroids[i])
    if (d < best) {
      second = best
      best = d
      bestIdx = i
    } else if (d < second) {
      second = d
    }
  }

  if (bestIdx < 0) return { sign: null, confidence: 0 }
  const denom = second + 1e-9
  const gap = Math.max(0, Math.min(1, (second - best) / denom))
  const confidence = Math.max(0, Math.min(1, 0.3 + gap * 0.7))

  return { sign: model.labels[bestIdx] ?? null, confidence }
}

function classifyRuleBased(landmarks) {
  const wrist = landmarks[0]
  if (!wrist) return { sign: null, confidence: 0 }

  const extended = TIP_IDS.map((tipId, idx) => {
    const tip = landmarks[tipId]
    const pip = landmarks[PIP_IDS[idx]]
    if (!tip || !pip) return false
    return tip.y < pip.y
  })

  const extendedCount = extended.filter(Boolean).length

  if (extendedCount >= 4) return { sign: 'WATER', confidence: 0.55 }
  if (extendedCount === 0) return { sign: 'PAIN', confidence: 0.55 }
  if (extendedCount === 1 && extended[1]) return { sign: 'HELP', confidence: 0.5 }
  if (extendedCount === 2 && extended[1] && extended[2]) return { sign: 'BATHROOM', confidence: 0.5 }
  if (extendedCount === 3) return { sign: 'FIRE', confidence: 0.45 }

  return { sign: null, confidence: 0 }
}

export function classifyLandmarks(landmarks) {
  if (!isValidLandmarks(landmarks)) {
    return { sign: null, confidence: 0 }
  }

  if (centroidModel) return classifyWithCentroidModel(landmarks, centroidModel)
  return classifyRuleBased(landmarks)
}
