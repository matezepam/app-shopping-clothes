export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-blue-500 border-t-primary" />

          <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-md" />

          <div className="absolute inset-7 rounded-full bg-primary shadow-lg shadow-primary/40" />
        </div>

        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white">
            Sprint
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Cargando experiencia...
          </p>
        </div>

        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}