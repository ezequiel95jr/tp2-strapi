import Image from "next/image";

// Logo de SnapIt. La versión compacta ("Sit") es para la barra lateral colapsada.
// Las imágenes salen de docs/logo-SnapIt.png y docs/logo-minimal-SnapIt.png,
// recortadas y con el fondo transparente para que se vean bien en modo oscuro.
export default function Logo({ compacto = false }: { compacto?: boolean }) {
  if (compacto) {
    return (
      <Image
        src="/images/logo/snapit-icono.png"
        alt="SnapIt"
        width={43}
        height={32}
        priority
      />
    );
  }

  return (
    <Image
      src="/images/logo/snapit.png"
      alt="SnapIt"
      width={97}
      height={40}
      priority
    />
  );
}
