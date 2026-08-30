import NavHeader from './NavHeader';

export default function PageShell({ title, subtitle, children, wide }) {
  return (
    <div className="min-h-screen bg-canvas">
      <NavHeader />
      <main className={`mx-auto px-6 py-10 sm:px-8 ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <p className="font-body text-sm font-semibold uppercase tracking-[0.15em] text-amber">
          Childcare Platform
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
