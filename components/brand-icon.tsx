/**
 * Logo de Bakata: una B llena con un rayo calado (energía + entrenamiento), sobre el
 * cuadrado violeta. Es la misma figura que app/icon.png y los íconos de public/.
 */
export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect width="24" height="24" rx="5.5" fill="#8d3fbd" />
      <path d="M6.8 4.6h6.4a3.7 3.7 0 0 1 2.4 6.5 4 4 0 0 1-2.2 7.8H6.8z" fill="#f7e8fa" />
      <path d="M13.3 6.2L9.9 12.5h2.7l-1.9 5.1 4.1-6.8h-2.7z" fill="#8d3fbd" />
    </svg>
  );
}
