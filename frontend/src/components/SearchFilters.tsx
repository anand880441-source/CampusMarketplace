"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  CONDITION_OPTIONS,
  LISTING_TYPE_LABELS,
  LISTING_TYPE_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/constants";
import type { Category } from "@/lib/types";
import Icon from "./Icon";
import type { IconName } from "./Icon";

interface FilterValues {
  search: string;
  category: string;
  condition: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  sort: string;
}

const categoryIcons: Record<Category, IconName> = {
  books: "book",
  electronics: "laptop",
  furniture: "chair",
  stationery: "pencil",
  other: "box",
};

const emptyValues: FilterValues = {
  search: "",
  category: "",
  condition: "",
  listingType: "",
  minPrice: "",
  maxPrice: "",
  location: "",
  sort: "newest",
};

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [values, setValues] = useState<FilterValues>(emptyValues);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const next: FilterValues = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      condition: searchParams.get("condition") || "",
      listingType: searchParams.get("listingType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      location: searchParams.get("location") || "",
      sort: searchParams.get("sort") || "newest",
    };

    setValues(next);

    if (
      next.condition ||
      next.listingType ||
      next.minPrice ||
      next.maxPrice ||
      next.location
    ) {
      setShowAdvanced(true);
    }
  }, [searchParams]);

  const update = (key: keyof FilterValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const navigate = (nextValues: FilterValues) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  const applyWith = (overrides: Partial<FilterValues>) => {
    navigate({ ...values, ...overrides });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(values);
  };

  const clearParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  const handleClear = () => {
    router.push("/");
  };

  const activeFilters = [
    searchParams.get("search"),
    searchParams.get("category"),
    searchParams.get("condition"),
    searchParams.get("listingType"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.get("location"),
  ].filter(Boolean).length;

  const activeChips: { key: string; label: string }[] = [];
  const searchValue = searchParams.get("search");
  const categoryValue = searchParams.get("category") as Category | null;
  const conditionValue = searchParams.get("condition");
  const typeValue = searchParams.get("listingType");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const location = searchParams.get("location");

  if (searchValue) {
    activeChips.push({ key: "search", label: `"${searchValue}"` });
  }
  if (categoryValue && CATEGORY_LABELS[categoryValue]) {
    activeChips.push({
      key: "category",
      label: CATEGORY_LABELS[categoryValue],
    });
  }
  if (conditionValue) {
    activeChips.push({
      key: "condition",
      label: conditionValue.replace("_", " ") + " condition",
    });
  }
  if (typeValue) {
    activeChips.push({
      key: "listingType",
      label:
        LISTING_TYPE_LABELS[typeValue as keyof typeof LISTING_TYPE_LABELS] ||
        typeValue,
    });
  }
  if (minPrice) activeChips.push({ key: "minPrice", label: `Min Rs ${minPrice}` });
  if (maxPrice) activeChips.push({ key: "maxPrice", label: `Max Rs ${maxPrice}` });
  if (location) activeChips.push({ key: "location", label: location });

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-lg shadow-indigo-100/40 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            className="input pl-10"
            placeholder="Search textbooks, calculators, furniture..."
            value={values.search}
            onChange={(event) => update("search", event.target.value)}
            aria-label="Search listings"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1 lg:flex-none">
            Search
            <Icon name="arrow-right" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced((open) => !open)}
            className={`btn btn-secondary ${
              showAdvanced ? "border-indigo-300 text-indigo-700" : ""
            }`}
          >
            <Icon name="sliders" className="h-4 w-4" />
            Filters
            {activeFilters > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {activeFilters}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => applyWith({ category: "" })}
          className={`chip ${values.category === "" ? "chip-active" : ""}`}
        >
          All items
        </button>
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => applyWith({ category: option.value })}
            className={`chip ${values.category === option.value ? "chip-active" : ""}`}
          >
            <Icon name={categoryIcons[option.value]} className="h-3.5 w-3.5" />
            {option.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sort" className="text-xs font-semibold text-zinc-500">
            Sort
          </label>
          <select
            id="sort"
            className="input w-auto py-1.5 text-xs"
            value={values.sort}
            onChange={(event) => applyWith({ sort: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeChips.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3">
          <span className="mr-1 text-xs font-semibold text-zinc-400">
            Active
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => clearParam(chip.key)}
                aria-label={`Remove ${chip.label} filter`}
                className="rounded-full p-0.5 hover:bg-indigo-100"
              >
                <Icon name="x" className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 text-xs font-semibold text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}

      {showAdvanced ? (
        <div className="mt-4 border-t border-zinc-100 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div>
              <label className="label" htmlFor="condition">
                Condition
              </label>
              <select
                id="condition"
                className="input"
                value={values.condition}
                onChange={(event) => update("condition", event.target.value)}
              >
                <option value="">Any condition</option>
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
                value={values.listingType}
                onChange={(event) => update("listingType", event.target.value)}
              >
                <option value="">All types</option>
                {LISTING_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="minPrice">
                Min price (Rs)
              </label>
              <input
                id="minPrice"
                type="number"
                min="0"
                className="input"
                placeholder="0"
                value={values.minPrice}
                onChange={(event) => update("minPrice", event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="maxPrice">
                Max price (Rs)
              </label>
              <input
                id="maxPrice"
                type="number"
                min="0"
                className="input"
                placeholder="Any"
                value={values.maxPrice}
                onChange={(event) => update("maxPrice", event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="input"
                placeholder="Hostel or campus"
                value={values.location}
                onChange={(event) => update("location", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="submit" className="btn btn-primary btn-small">
              Apply filters
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-ghost btn-small"
            >
              Reset everything
            </button>
            <p className="text-xs text-zinc-400">
              Tip: accepted offers automatically reserve the item for the buyer.
            </p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
