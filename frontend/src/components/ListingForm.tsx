"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  CATEGORY_OPTIONS,
  CONDITION_OPTIONS,
  LISTING_TYPE_OPTIONS,
} from "@/lib/constants";
import type { Category, Condition, Listing, ListingType } from "@/lib/types";
import Alert from "./Alert";
import Icon from "./Icon";
import ImageUploader from "./ImageUploader";
import PageLoader from "./PageLoader";

interface FormState {
  title: string;
  description: string;
  price: string;
  category: Category;
  condition: Condition;
  listingType: ListingType;
  location: string;
  images: string[];
}

const initialState: FormState = {
  title: "",
  description: "",
  price: "",
  category: "books",
  condition: "good",
  listingType: "sale",
  location: "",
  images: [],
};

export default function ListingForm({ listingId }: { listingId?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const isEditing = Boolean(listingId);

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    let active = true;

    const loadListing = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api<{ success: boolean; data: Listing }>(
          `/api/listings/${listingId}`
        );

        if (!active) return;

        const listing = res.data;
        const sellerId =
          typeof listing.seller === "string"
            ? listing.seller
            : listing.seller._id;

        if (user && sellerId !== user._id) {
          setNotAllowed(true);
          setError("You can only edit your own listings.");
          return;
        }

        setForm({
          title: listing.title,
          description: listing.description,
          price: String(listing.price),
          category: listing.category,
          condition: listing.condition,
          listingType: listing.listingType,
          location: listing.location || "",
          images: listing.images || [],
        });
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load listing");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadListing();

    return () => {
      active = false;
    };
  }, [listingId, user]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (form.listingType === "sale") {
      if (form.price === "" || Number.isNaN(Number(form.price))) {
        setError("Please enter a valid price.");
        return;
      }
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      condition: form.condition,
      listingType: form.listingType,
      location: form.location.trim(),
      images: form.images,
      price: form.listingType === "sale" ? Number(form.price) : 0,
    };

    try {
      if (listingId) {
        await api<{ success: boolean; data: Listing }>(
          `/api/listings/${listingId}`,
          { method: "PATCH", auth: true, body: payload }
        );
        router.push(`/listings/${listingId}`);
      } else {
        const res = await api<{ success: boolean; data: Listing }>(
          "/api/listings",
          { method: "POST", auth: true, body: payload }
        );
        router.push(`/listings/${res.data._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save listing");
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading listing..." />;
  }

  if (notAllowed) {
    return (
      <div className="space-y-4">
        <Alert message={error} />
        <Link href="/dashboard" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <Alert message={error} /> : null}

      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon name="tag" className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-bold text-zinc-900">Item details</h2>
            <p className="text-xs text-zinc-500">
              Honest, specific details help your item sell faster.
            </p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="input"
            required
            minLength={3}
            maxLength={120}
            placeholder="For example: Engineering Mathematics textbook"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="input"
              value={form.category}
              onChange={(event) =>
                update("category", event.target.value as Category)
              }
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="condition">
              Condition
            </label>
            <select
              id="condition"
              className="input"
              value={form.condition}
              onChange={(event) =>
                update("condition", event.target.value as Condition)
              }
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="listingType">
              Listing type
            </label>
            <select
              id="listingType"
              className="input"
              value={form.listingType}
              onChange={(event) =>
                update("listingType", event.target.value as ListingType)
              }
            >
              {LISTING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.listingType === "sale" ? (
          <div className="sm:w-56">
            <label className="label" htmlFor="price">
              Price (INR)
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              className="input"
              required
              placeholder="0"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            {form.listingType === "free"
              ? "This item will be listed as free for another student."
              : "This item will be listed for exchange with another student."}
          </p>
        )}

        <div>
          <label className="label" htmlFor="location">
            Location on or near campus
          </label>
          <input
            id="location"
            className="input"
            maxLength={100}
            placeholder="For example: Hostel B, Main campus"
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="label" htmlFor="description">
              Description
            </label>
            <span className="text-[11px] text-zinc-400">
              {form.description.length} / 2000
            </span>
          </div>
          <textarea
            id="description"
            className="input min-h-32"
            required
            minLength={10}
            maxLength={2000}
            placeholder="Share the condition, edition, age, accessories and anything else buyers should know."
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <ImageUploader
          images={form.images}
          onChange={(images) => update("images", images)}
        />
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Icon name="shield" className="h-3.5 w-3.5" />
          Your contact details stay private until you accept an offer.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={listingId ? `/listings/${listingId}` : "/dashboard"}
            className="btn btn-secondary"
          >
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Icon name="check" className="h-4 w-4" />
            )}
            {saving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Publish listing"}
          </button>
        </div>
      </div>
    </form>
  );
}
