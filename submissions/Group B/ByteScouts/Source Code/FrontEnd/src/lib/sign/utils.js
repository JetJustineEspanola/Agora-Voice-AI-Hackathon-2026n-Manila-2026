export function pickPrimaryHand(results) {
  const lmsArr = results?.multiHandLandmarks ?? []
  const handednessArr = results?.multiHandedness ?? []

  if (lmsArr.length === 0) return { primaryLandmarks: null, primaryHandedness: null }

  const rightIndex = handednessArr.findIndex((h) => h?.label === 'Right')
  const idx = rightIndex >= 0 ? rightIndex : 0

  return {
    primaryLandmarks: lmsArr[idx] ?? lmsArr[0] ?? null,
    primaryHandedness: handednessArr[idx]?.label ?? null,
  }
}

