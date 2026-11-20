"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import Icon from "./Icon";

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const { user, favoriteIds, toggleFavorite } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const active = favoriteIds.includes(listingId);

  const handleClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setPending(true);
    setError("");

    try {
      await toggleFavorite(listingId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
      } else {
        setError(
          err instanceof Error ? err.message : "Could not update favorites"
        );
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      title={error || (active ? "Remove from saved items" : "Save this item")}
      aria-label={active ? "Remove from saved items" : "Save this item"}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition-all disabled:opacity-60 ${
        active
          ? "border-red-200 text-red-500"
          : "border-zinc-200 text-zinc-500 hover:border-red-200 hover:text-red-500"
      }`}
    >
      <Icon
        name="heart"
        className={`h-5 w-5 ${active ? "fill-current" : ""} ${
          pending ? "animate-pulse" : ""
        }`}
        style={{ fill: active ? "currentColor" : "none" }}
      />
    </button>
  );
}
