"use client";

import Link from "next/link";
import { useEffect } from "react";
import Icon from "@/components/Icon";
import ListingGrid from "@/components/ListingGrid";
import Protected from "@/components/Protected";
import { useAuth } from "@/context/AuthContext";

function FavoritesContent() {
  const { favorites, refreshFavorites } = useAuth();

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  return (
    <div className="container-page space-y-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h1 className="page-title mt-1">Saved items</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {favorites.length > 0
              ? `${favorites.length} item${
                  favorites.length === 1 ? "" : "s"
                } saved for later. Items may be reserved or sold by the time you return.`
              : "Keep track of listings you want to revisit or buy later."}
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          <Icon name="search" className="h-4 w-4" />
          Browse marketplace
        </Link>
      </div>

      <ListingGrid
        listings={favorites}
        emptyTitle="No saved items yet"
        emptyMessage="Tap the heart on any listing to save it here for later. Saved items stay even after they sell."
      />
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Protected>
      <FavoritesContent />
    </Protected>
  );
}
