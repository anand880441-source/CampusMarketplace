"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, assetUrl, uploadImages } from "@/lib/api";
import Alert from "./Alert";
import Icon from "./Icon";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [college, setCollege] = useState(user?.college || "");
  const [course, setCourse] = useState(user?.course || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [contactPreference, setContactPreference] = useState<"email" | "phone">(
    user?.contactPreference || "email"
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api("/api/users/me", {
        method: "PATCH",
        auth: true,
        body: {
          name: name.trim(),
          college: college.trim(),
          course: course.trim(),
          phone: phone.trim(),
          contactPreference,
        },
      });

      await refreshUser();
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Profile photos must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setUploadingAvatar(true);

    try {
      const urls = await uploadImages([file]);
      if (!urls[0]) {
        throw new Error("Upload did not return an image path");
      }

      await api("/api/users/me", {
        method: "PATCH",
        auth: true,
        body: { profileImage: urls[0] },
      });
      await refreshUser();
      setSuccess("Profile photo updated.");
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Could not upload photo"
      );
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const removeAvatar = async () => {
    setUploadingAvatar(true);
    setAvatarError("");
    setSuccess("");

    try {
      await api("/api/users/me", {
        method: "PATCH",
        auth: true,
        body: { profileImage: "" },
      });
      await refreshUser();
      setSuccess("Profile photo removed.");
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Could not remove photo"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="container-page max-w-5xl space-y-6 py-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to dashboard
        </Link>
        <p className="eyebrow mt-2">Account</p>
        <h1 className="page-title mt-1">Your profile</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add a photo and details so buyers know who they are meeting. Contact
          details stay private until you accept an offer.
        </p>
      </div>

      {error ? <Alert message={error} /> : null}
      {success ? <Alert type="success" message={success} /> : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600" />
            <div className="px-5 pb-5">
              <div className="-mt-10 flex items-end justify-between">
                <div className="relative">
                  {user?.profileImage ? (
                    <img
                      src={assetUrl(user.profileImage)}
                      alt={user.name}
                      className="h-20 w-20 rounded-2xl border-4 border-white bg-zinc-100 object-cover shadow-sm"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-extrabold text-indigo-700 shadow-sm">
                      {(user?.name || "S").charAt(0).toUpperCase()}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    title="Change profile photo"
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md ring-2 ring-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {uploadingAvatar ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <Icon name="camera" className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {user?.profileImage ? (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={uploadingAvatar}
                    className="text-xs font-medium text-zinc-400 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <h2 className="mt-3 text-lg font-bold text-zinc-900">
                {user?.name || "Student"}
              </h2>
              <p className="truncate text-sm text-zinc-500">{user?.email}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {user?.college ? (
                  <span className="badge bg-zinc-100 text-zinc-600">
                    {user.college}
                  </span>
                ) : null}
                {user?.course ? (
                  <span className="badge bg-zinc-100 text-zinc-600">
                    {user.course}
                  </span>
                ) : null}
              </div>

              {avatarError ? (
                <div className="mt-3">
                  <Alert message={avatarError} />
                </div>
              ) : null}

              <Link
                href={`/sellers/${user?._id}`}
                className="btn btn-secondary mt-4 w-full"
              >
                <Icon name="eye" className="h-4 w-4" />
                View public profile
              </Link>
            </div>
          </div>

          <div className="card flex items-start gap-2 p-4 text-xs leading-5 text-zinc-500">
            <Icon
              name="lock"
              className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
            />
            Your phone number and email are only shared with a buyer or seller
            after an offer is accepted.
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon name="user" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-zinc-900">Personal details</h2>
                <p className="text-xs text-zinc-500">
                  This is what other students see on your listings.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  className="input"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="college">
                    College
                  </label>
                  <input
                    id="college"
                    className="input"
                    maxLength={150}
                    placeholder="For example: ABC Institute of Technology"
                    value={college}
                    onChange={(event) => setCollege(event.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="course">
                    Course
                  </label>
                  <input
                    id="course"
                    className="input"
                    maxLength={150}
                    placeholder="For example: B.Tech CSE, 2nd year"
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon name="phone" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-zinc-900">Contact details</h2>
                <p className="text-xs text-zinc-500">
                  Shared only after an offer is accepted.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input bg-zinc-50"
                  value={user?.email || ""}
                  readOnly
                  disabled
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Your email is used to log in and cannot be changed here.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="phone">
                  Phone number
                </label>
                <input
                  id="phone"
                  className="input"
                  maxLength={20}
                  placeholder="For example: 9876543210"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="contactPreference">
                  Preferred contact method
                </label>
                <select
                  id="contactPreference"
                  className="input"
                  value={contactPreference}
                  onChange={(event) =>
                    setContactPreference(
                      event.target.value as "email" | "phone"
                    )
                  }
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  If you choose phone but have not added a number, your email is
                  shown instead.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Icon name="check" className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </button>
            <Link href="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <Link href="/listings/new" className="btn btn-ghost">
              <Icon name="plus" className="h-4 w-4" />
              Sell an item
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
