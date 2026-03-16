import Home from './pages/Home.jsx'

export default function App() {
  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-lg font-semibold">Basic Sign Language Voice Bridge</div>
            <div className="text-xs text-slate-400">Agora Voice AI Hackathon Manila 2026</div>
          </div>
          <div className="text-xs text-slate-400">Team ByteScouts</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Home />
      </main>
      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
          MVP demo: Camera → Sign → Agora ConvoAI Speak → RTC audio playback
        </div>
      </footer>
    </div>
  )
}

