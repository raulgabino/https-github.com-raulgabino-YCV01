export default function SkeletonCard() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-white/20">
      <div className="flex items-start justify-between mb-3">
        <div className="h-6 bg-white/20 rounded w-3/4 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite] absolute top-2" />
        </div>
        <div className="h-5 bg-white/20 rounded-full w-16 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite] absolute top-1.5" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-4 bg-white/20 rounded w-full relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite] absolute top-1" />
        </div>
        <div className="h-4 bg-white/20 rounded w-5/6 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite] absolute top-1" />
        </div>
        <div className="h-4 bg-white/20 rounded w-4/6 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite] absolute top-1" />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="h-10 bg-white/20 rounded-xl flex-1 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite] absolute top-4" />
        </div>
        <div className="h-10 bg-white/20 rounded-xl w-20 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite] absolute top-4" />
        </div>
      </div>
    </div>
  )
}
