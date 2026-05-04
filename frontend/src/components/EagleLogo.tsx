export function EagleLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex overflow-hidden rounded-sm">
        <div className="h-8 w-3 bg-primary" />
        <div className="h-8 w-3 bg-[#224faf]" />
        <div className="h-8 w-3 bg-accent" />
      </div>
      <div className="leading-tight">
        <span className="font-display text-2xl font-bold text-white">
          Eagle
        </span>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
          Ecuador
        </p>
      </div>
    </div>
  );
}
