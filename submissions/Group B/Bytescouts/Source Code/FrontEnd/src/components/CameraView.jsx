import { useEffect, useRef, useState } from 'react'

function formatReadyState(readyState) {
  switch (readyState) {
    case 0:
      return 'HAVE_NOTHING'
    case 1:
      return 'HAVE_METADATA'
    case 2:
      return 'HAVE_CURRENT_DATA'
    case 3:
      return 'HAVE_FUTURE_DATA'
    case 4:
      return 'HAVE_ENOUGH_DATA'
    default:
      return String(readyState)
  }
}

function normalizeHandsLandmarks(landmarks) {
  if (!landmarks) return []
  if (!Array.isArray(landmarks)) return []
  if (landmarks.length === 0) return []

  const first = landmarks[0]
  if (first && typeof first === 'object' && 'x' in first) return [landmarks]
  if (Array.isArray(first)) return landmarks

  return []
}

export default function CameraView({ videoRef, status, error, landmarks }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [videoInfo, setVideoInfo] = useState({
    videoWidth: 0,
    videoHeight: 0,
    readyState: 0,
    paused: true,
  })

  useEffect(() => {
    const video = videoRef?.current
    if (!video) return

    const id = window.setInterval(() => {
      setVideoInfo({
        videoWidth: video.videoWidth || 0,
        videoHeight: video.videoHeight || 0,
        readyState: video.readyState ?? 0,
        paused: Boolean(video.paused),
      })
    }, 500)

    return () => window.clearInterval(id)
  }, [videoRef])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const resize = () => {
      const w = Math.max(1, container.clientWidth)
      const h = Math.max(1, container.clientHeight)
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const handsLandmarks = normalizeHandsLandmarks(landmarks)
    if (handsLandmarks.length === 0) return

    const colors = ['rgba(16, 185, 129, 0.9)', 'rgba(59, 130, 246, 0.9)']
    handsLandmarks.forEach((hand, idx) => {
      ctx.fillStyle = colors[idx] ?? colors[0]
      for (const p of hand) {
        const x = (p.x ?? 0) * canvas.width
        const y = (p.y ?? 0) * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }, [landmarks])
  const handsLandmarks = normalizeHandsLandmarks(landmarks)
  const handsCount = handsLandmarks.length

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-slate-800 bg-black"
      >
        <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>
      <div className="text-xs text-slate-400">
        Status:{' '}
        <span className="font-semibold text-slate-200">
          {status === 'ready' ? 'Ready' : status}
        </span>
        {error ? <span className="ml-2 text-rose-300">Error: {error}</span> : null}
      </div>
      <div className="grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
        <div>
          Video:{' '}
          <span className="font-semibold text-slate-200">
            {videoInfo.videoWidth}×{videoInfo.videoHeight}
          </span>
        </div>
        <div>
          ReadyState:{' '}
          <span className="font-semibold text-slate-200">{formatReadyState(videoInfo.readyState)}</span>
          <span className="ml-2">{videoInfo.paused ? 'Paused' : 'Playing'}</span>
        </div>
        <div className="sm:col-span-2">
          Hands:{' '}
          <span className="font-semibold text-slate-200">{handsCount > 0 ? handsCount : '0'}</span>
        </div>
      </div>
    </div>
  )
}
