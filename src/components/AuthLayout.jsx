// Signature element: a grid of dots standing in for "seats" in a room —
// a few are filled (amber) to nod at the seat-booking core of the product,
// without needing an illustration asset.
function SeatGrid() {
  const rows = 6;
  const cols = 8;
  const filled = new Set(['1-2', '1-3', '2-5', '3-1', '3-2', '4-6', '5-3', '0-6']);

  return (
    <div className="grid grid-cols-8 gap-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const key = `${r}-${c}`;
          return (
            <span
              key={key}
              className={`h-2.5 w-2.5 rounded-full ${
                filled.has(key) ? 'bg-amber' : 'bg-white/15'
              }`}
            />
          );
        })
      )}
    </div>
  );
}

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-harbor px-12 py-14 text-white md:flex">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-amber-light">
            Childcare Platform
          </p>
          <h1 className="font-display mt-6 max-w-sm text-4xl font-semibold leading-tight">
            Every seat, held for the right child.
          </h1>
          <p className="mt-4 max-w-sm text-white/70">
            Guardians, sitters, and drivers, coordinated in one place — with a
            waitlist that promotes fairly, not just first-come-first-served.
          </p>
        </div>
        <div>
          <SeatGrid />
          <p className="mt-4 text-xs text-white/50">
            Live room capacity, visualized.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-canvas px-6 py-14">
        <div className="w-full max-w-sm">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.15em] text-amber">
            {eyebrow}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8 rounded-xl2 bg-surface p-8 shadow-sm ring-1 ring-black/5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
