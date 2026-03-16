import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

export function createHandsTracker(options = {}) {
  // Use a fixed version CDN URL to avoid "Module.arguments" runtime errors 
  // that occur with newer WASM binaries when loaded via generic CDN links.
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
    },
  })

  hands.setOptions({
    maxNumHands: options.maxNumHands ?? 2,
    modelComplexity: options.modelComplexity ?? 1,
    minDetectionConfidence: options.minDetectionConfidence ?? 0.5,
    minTrackingConfidence: options.minTrackingConfidence ?? 0.5,
  })

  let camera = null
  let disposed = false
  let isRunning = false

  const state = {
    onResults: null,
  }

  hands.onResults((results) => {
    if (disposed || !isRunning) return
    if (state.onResults) state.onResults(results)
  })

  async function start(videoEl) {
    if (!videoEl) throw new Error('Missing video element')
    if (disposed) throw new Error('Tracker disposed')
    if (camera) return

    isRunning = true

    // Initialize Camera Utils
    camera = new Camera(videoEl, {
      onFrame: async () => {
        if (!isRunning || disposed) return
        try {
          await hands.send({ image: videoEl })
        } catch (err) {
          console.error('[Tracker] Send error:', err)
        }
      },
      width: options.width ?? 640,
      height: options.height ?? 360,
    })

    await camera.start()
  }

  function stop() {
    isRunning = false
    if (!camera) return
    try {
      camera.stop()
    } catch (err) {
      console.warn('[Tracker] Stop error:', err)
    } finally {
      camera = null
    }
  }

  function dispose() {
    disposed = true
    stop()
    try {
      hands.close()
    } catch (e) { /* ignore */ }
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

