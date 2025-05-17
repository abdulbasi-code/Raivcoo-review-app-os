import Image from "next/image";

interface ThemeProps {
  children: React.ReactNode;
  imagePath: string;
}

export function Theme({ children, imagePath }: ThemeProps) {
  return (
    <div className="w-full relative min-h-screen">
      <Image
        src={imagePath}
        alt="Theme background"
        fill
        priority
        quality={100}
        className="object-cover z-0"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
