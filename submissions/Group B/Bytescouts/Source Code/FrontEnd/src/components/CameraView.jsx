export default function CameraView({ videoRef, status, error }) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-black">
        <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
      </div>
      <div className="text-xs text-slate-400">
        Status:{' '}
        <span className="font-semibold text-slate-200">
          {status === 'ready' ? 'Ready' : status}
        </span>
        {error ? <span className="ml-2 text-rose-300">Error: {error}</span> : null}
      </div>
    </div>
  )
}
