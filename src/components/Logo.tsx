import Image from "next/image";

export function Logo({ variant = "color", className = "" }: { variant?: "color" | "white"; className?: string }) {
  return (
    <Image
      src={variant === "white" ? "/brand/logo-on-dark.png" : "/brand/logo-color.png"}
      alt="ALFA GLASS"
      width={289}
      height={56}
      priority
      unoptimized
      className={`h-auto w-[138px] md:w-[156px] ${className}`}
    />
  );
}
