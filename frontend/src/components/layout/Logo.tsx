export function EagleLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-sm border border-white/10 shadow-lg">
        
        <img
          src="/images/logo/logo-eg.svg"
          alt="Sprint Logo"
          className="h-10 w-10 object-contain brightness-0 invert"
        />

        <div className="mt-1 flex overflow-hidden rounded-sm">
          <div className="h-1.5 w-4 bg-primary" />
          <div className="h-1.5 w-4 bg-[#224faf]" />
          <div className="h-1.5 w-4 bg-accent" />
        </div>
      </div>

      <div className="leading-tight">
        <span className="font-display text-2xl font-bold text-white tracking-wide">
          Sprint
        </span>

        <p className="ml-0.98 text-[10px] uppercase tracking-[0.40em] text-white/50">
            Ecuador
        </p>
      </div>
    </div>
  );
}