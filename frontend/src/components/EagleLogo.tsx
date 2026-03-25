export function EagleLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        className="h-9 w-9 text-eagle-gold"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M20 4L34 14V26L20 36L6 26V14L20 4Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M14 22c2.5-5 9.5-5 12 0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="20" cy="17" r="2" fill="currentColor" />
      </svg>
      <div className="leading-tight">
        <span className="font-display text-lg font-bold tracking-[0.2em] text-eagle-foam">
          EAGLE
        </span>
        <p className="text-[10px] uppercase tracking-[0.35em] text-eagle-sand/70">
          Ecuador
        </p>
      </div>
    </div>
  );
}
