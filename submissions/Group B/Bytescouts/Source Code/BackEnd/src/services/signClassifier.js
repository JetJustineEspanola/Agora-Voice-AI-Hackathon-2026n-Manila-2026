const TIP_IDS = [4, 8, 12, 16, 20]
const PIP_IDS = [3, 6, 10, 14, 18]

function isValidLandmarks(landmarks) {
  return Array.isArray(landmarks) && landmarks.length >= 21
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

  // TODO: Replace this with a trained TFJS classifier (landmarks → sign + confidence).
  // Suggested approach: collect 5–10s of landmarks per sign, train a small MLP, export to TFJS.
  return classifyRuleBased(landmarks)
}

