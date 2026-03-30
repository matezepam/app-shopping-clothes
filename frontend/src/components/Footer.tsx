import { Link } from "react-router-dom";
import { LanguageCurrencyBar } from "./LanguageCurrencyBar";

export function Footer() {
  return (
    <footer className="bg-[#0a0f1a] text-white">

      <div className="container mx-auto px-4 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-12">

          <div className="lg:col-span-2 space-y-8">

            <div className="flex items-center gap-4">
              <div className="flex overflow-hidden rounded-sm">
                <div className="w-3 h-8 bg-primary"></div>
                <div className="w-3 h-8 bg-[#224faf]"></div>
                <div className="w-3 h-8 bg-accent"></div>
              </div>

              <h2 className="font-display text-3xl font-bold">
                Estilo EC
              </h2>
            </div>

            <p className="text-white/70 text-base leading-relaxed max-w-md">
              Moda ecuatoriana con estilo único. Celebramos nuestra cultura y tradiciones a través de diseños contemporáneos y sostenibles.
            </p>

            <div className="space-y-2 text-base text-white/70">
              <p className="flex items-center gap-2">
                <span className="text-primary">●</span> Quito, Ecuador
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-400">●</span> +593 99 123 4567
              </p>
              <p className="flex items-center gap-2">
                <span className="text-accent">●</span> hola@estiloec.com
              </p>
            </div>

            <div className="flex gap-4">
              <a href="#" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-secondary transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 5.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2zm0 1.8A3 3 0 1 0 15 12a3 3 0 0 0-3-3zm5.2-.9a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z"/>
                </svg>
              </a>

              <a href="#" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-secondary transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h3v12H9zm4.5-6C9.9 2 7 4.9 7 8v2h2V8c0-2.2 1.8-4 4-4s4 1.8 4 4v2h2V8c0-3.1-2.9-6-5.5-6z"/>
                </svg>
              </a>

              <a href="#" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-secondary transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 5.9c-.8.4-1.6.6-2.4.7.9-.5 1.5-1.3 1.8-2.2-.8.5-1.7.9-2.7 1.1A4.1 4.1 0 0 0 12 8.1c0 .3 0 .6.1.9A11.7 11.7 0 0 1 3 5.1a4.1 4.1 0 0 0 1.3 5.5c-.6 0-1.2-.2-1.7-.5v.1c0 2 1.4 3.7 3.3 4.1-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.6 2 2.7 3.7 2.8A8.3 8.3 0 0 1 2 19.5 11.7 11.7 0 0 0 8.3 21c7.6 0 11.8-6.3 11.8-11.8v-.5c.8-.5 1.5-1.3 2-2.1z"/>
                </svg>
              </a>

              <a href="#" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-secondary transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.8 0 3.2 0 4.3.1 3 .1 4.5 1.6 4.6 4.6.1 1.1.1 1.5.1 4.3s0 3.2-.1 4.3c-.1 3-1.6 4.5-4.6 4.6-1.1.1-1.5.1-4.3.1s-3.2 0-4.3-.1c-3-.1-4.5-1.6-4.6-4.6C3 14.2 3 13.8 3 11s0-3.2.1-4.3C3.2 3.7 4.7 2.2 7.7 2.1 8.8 2 9.2 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-display text-xl font-semibold text-primary">
              Tienda
            </p>
            <div className="space-y-3 text-base">
              <Link to="/mujer" className="block text-white/70 hover:text-white transition-colors">Mujer</Link>
              <Link to="/hombre" className="block text-white/70 hover:text-white transition-colors">Hombre</Link>
              <Link to="/accesorios" className="block text-white/70 hover:text-white transition-colors">Accesorios</Link>
              <Link to="/nuevos" className="block text-white/70 hover:text-white transition-colors">Nuevos Llegados</Link>
              <Link to="/ofertas" className="block text-white/70 hover:text-white transition-colors">Ofertas</Link>
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-display text-xl font-semibold text-blue-700">
              Empresa
            </p>
            <div className="space-y-3 text-base">
              <Link to="/about" className="block text-white/70 hover:text-white transition-colors">Sobre Nosotros</Link>
              <Link to="/tiendas" className="block text-white/70 hover:text-white transition-colors">Tiendas</Link>
              <Link to="/trabaja" className="block text-white/70 hover:text-white transition-colors">Trabaja con Nosotros</Link>
              <Link to="/sostenibilidad" className="block text-white/70 hover:text-white transition-colors">Sostenibilidad</Link>
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-display text-xl font-semibold text-accent">
              Ayuda
            </p>
            <div className="space-y-3 text-base">
              <Link to="/contacto" className="block text-white/70 hover:text-white transition-colors">Servicio al Cliente</Link>
              <Link to="/envios" className="block text-white/70 hover:text-white transition-colors">Envíos y Entregas</Link>
              <Link to="/devoluciones" className="block text-white/70 hover:text-white transition-colors">Devoluciones</Link>
              <Link to="/tallas" className="block text-white/70 hover:text-white transition-colors">Guía de Tallas</Link>
              <Link to="/faq" className="block text-white/70 hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>

        </div>

        <div className="mt-10 flex justify-center">
          <LanguageCurrencyBar />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col items-center gap-4 text-sm text-white/50">

          <p>© 2026 Estilo EC. Todos los derechos reservados.</p>

          <div className="flex gap-6">
            <Link to="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link to="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
          </div>

          <div className="flex overflow-hidden rounded-full">
            <div className="w-8 h-2 bg-primary"></div>
            <div className="w-8 h-2 bg-blue-500"></div>
            <div className="w-8 h-2 bg-accent"></div>
          </div>

        </div>
      </div>

    </footer>
  );
}