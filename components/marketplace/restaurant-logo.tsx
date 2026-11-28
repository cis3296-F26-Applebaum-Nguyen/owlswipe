import Image from "next/image";

import type { Restaurant } from "@/lib/restaurants";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RestaurantLogo({ restaurant, className }: { restaurant: Restaurant; className?: string }) {
  if (restaurant.logoSrc) {
    return (
      <Image
        alt=""
        className={cn("size-12 shrink-0 rounded-lg bg-white object-contain p-1", className)}
        height={48}
        src={restaurant.logoSrc}
        width={48}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-lg text-sm font-bold text-white shadow-inner",
        className,
      )}
      style={{ backgroundColor: restaurant.brandColor }}
    >
      {initials(restaurant.name)}
    </span>
  );
}
