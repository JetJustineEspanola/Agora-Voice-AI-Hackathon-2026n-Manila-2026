import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

export function createHandsTracker(options) {
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  })

  hands.setOptions({
    maxNumHands: options?.maxNumHands ?? 2,
    modelComplexity: options?.modelComplexity ?? 1,
    minDetectionConfidence: options?.minDetectionConfidence ?? 0.6,
    minTrackingConfidence: options?.minTrackingConfidence ?? 0.6,
  })

  let camera = null
  let disposed = false

  const state = {
    onResults: null,
  }

  hands.onResults((results) => {
    if (disposed) return
    state.onResults?.(results)
  })

  async function start(videoEl) {
    if (!videoEl) throw new Error('Missing video element')
    if (disposed) throw new Error('Tracker disposed')
    if (camera) return

    camera = new Camera(videoEl, {
      onFrame: async () => {
        await hands.send({ image: videoEl })
      },
      width: options?.width ?? 640,
      height: options?.height ?? 360,
    })

    await camera.start()
  }

  function stop() {
    if (!camera) return
    try {
      camera.stop()
    } finally {
      camera = null
    }
  }

  function dispose() {
    disposed = true
    stop()
  }

  return {
    setOnResults(fn) {
      state.onResults = fn
    },
    start,
    stop,
    dispose,
  }
}

