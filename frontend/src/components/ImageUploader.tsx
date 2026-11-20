"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { assetUrl, uploadImages } from "@/lib/api";
import Alert from "./Alert";
import Icon from "./Icon";

const MAX_IMAGES = 4;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setError("");

    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      event.target.value = "";
      return;
    }

    const invalidType = files.find(
      (file) => !ALLOWED_TYPES.includes(file.type)
    );
    if (invalidType) {
      setError("Only JPG, PNG, WebP and GIF images are allowed.");
      event.target.value = "";
      return;
    }

    const tooLarge = files.find(
      (file) => file.size > MAX_SIZE_MB * 1024 * 1024
    );
    if (tooLarge) {
      setError(`Each image must be smaller than ${MAX_SIZE_MB} MB.`);
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const urls = await uploadImages(files);
      onChange([...images, ...urls].slice(0, MAX_IMAGES));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload images");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon name="camera" className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-bold text-zinc-900">Photos</h2>
            <p className="text-xs text-zinc-500">
              Listings with clear photos get more replies.
            </p>
          </div>
        </div>
        <span className="badge bg-zinc-100 text-zinc-500">
          {images.length} / {MAX_IMAGES}
        </span>
      </div>

      {error ? <Alert message={error} /> : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
            >
              <img
                src={assetUrl(image)}
                alt={`Listing photo ${index + 1}`}
                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-950/50 to-transparent" />
              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-zinc-950/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                  Cover
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-zinc-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {images.length < MAX_IMAGES ? (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 px-4 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 ${
            uploading ? "cursor-wait opacity-60" : ""
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
            {uploading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            ) : (
              <Icon name="camera" className="h-5 w-5" />
            )}
          </span>
          <span className="text-sm font-semibold text-zinc-700">
            {uploading ? "Uploading photos..." : "Add photos"}
          </span>
          <span className="text-xs text-zinc-400">
            JPG, PNG, WebP or GIF - up to {MAX_SIZE_MB} MB each
          </span>
        </label>
      ) : (
        <p className="text-xs text-zinc-400">
          Maximum of {MAX_IMAGES} photos reached. Remove one to add another.
        </p>
      )}
    </div>
  );
}
