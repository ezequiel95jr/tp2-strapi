// Logotipo de texto hasta tener un logo definitivo
export default function Logo({ compacto = false }: { compacto?: boolean }) {
  if (compacto) {
    return (
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-500 text-lg font-bold text-white">
        S
      </span>
    );
  }

  return (
    <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
      Snap<span className="text-brand-500">It</span>
    </span>
  );
}
