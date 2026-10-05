import Image from "next/image";

export function Logo({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Image
      src={tone === "dark" ? "/brand/logo-on-dark.png" : "/brand/logo-color.png"}
      alt="ALFA GLASS"
      width={289}
      height={56}
      priority
      unoptimized
      className={`h-auto w-[138px] md:w-[156px] ${className}`}
    />
  );
}
