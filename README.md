# 🎓 CampusMarket
> **One clear place for college students to list an item, receive offers, reserve it for one buyer, and complete the deal safely.**

---

## 🎯 Project Overview
**CampusMarket** is a full-stack web application built specifically for college campuses to streamline the buying, selling, and exchanging of pre-owned student essentials—including textbooks, electronics, dorm furniture, and stationery.

Instead of relying on chaotic group chats and outdated notice boards, CampusMarket provides a centralized, structured marketplace. Every item has a clear availability status, every offer is tracked from start to finish, and personal contact information remains strictly private until both parties agree on a deal.

---

## 💡 The Problem
Campus peer-to-peer trading currently relies on informal channels like WhatsApp groups, social media pages, and physical bulletin boards. This creates three major friction points for students:
* **Buried Listings & Clutter:** Useful items get lost in endless chat threads within hours, making it nearly impossible to search or browse by category.
* **Ambiguous Item Status:** Buyers waste time messaging sellers about items that were already sold or reserved days ago.
* **Privacy & Spam Risks:** Students are forced to broadcast their personal phone numbers to hundreds of strangers just to negotiate a simple campus pickup.

---

## 🛠️ Our Solution (The 5-Step Deal Lifecycle)
CampusMarket replaces guesswork with a structured, state-driven workflow that protects both buyers and sellers:

1. **Create a Listing:** A seller posts an item with photos, condition details, campus pickup location, and a listing type (*For Sale*, *For Exchange*, or *Free*).
2. **Browse & Make an Offer:** Buyers filter the catalog, save favorites, and submit an offer with an optional message.
3. **Accept & Reserve:** When a seller accepts an offer, the system automatically changes the item's status to **Reserved** and closes all competing pending offers.
4. **Unlock Contact Details:** Only after acceptance are the buyer's and seller's phone numbers and emails revealed to each other to coordinate an in-person campus handoff.
5. **Close the Deal:** Once the item is handed over, the seller marks the listing as **Sold**, permanently removing it from the active marketplace.

---

## ✨ Core Features

### 🛍️ Buyer Experience
* **Advanced Search & Filtering:** Quickly narrow down campus listings by category, price range, item condition, and hostel/campus location.
* **Detailed Item Views:** Inspect multi-photo galleries, seller academic details (college & course), and recommended similar items.
* **Favorites Watchlist:** Bookmark items to track availability and compare options before making an offer.
* **Offer Management & Alerts:** Track the live status of all sent offers (*Pending*, *Accepted*, *Rejected*) and receive status notifications.

### 🏷️ Seller Experience
* **Flexible Listing Modes:** Support for traditional **Paid Sales**, **Item-for-Item Exchanges**, and **Free Giveaways**.
* **Full Lifecycle Controls:** Easily edit details, temporarily **Pause** a listing, or delete items at any time.
* **Unified Seller Dashboard:** View all active listings, review incoming offers side-by-side, and manage deal statuses from a single screen.

### 🔒 Built-in Privacy & Guardrails
* **Gated Contact Sharing:** Phone numbers and emails are stripped from public API responses and UI views until an offer is officially accepted.
* **Single-Buyer Locking:** Once an item is marked *Reserved*, *Paused*, or *Sold*, the backend automatically blocks any new incoming offers to prevent double-booking.
* **Role-Based Action Controls:** Strict ownership checks ensure only the listing creator can accept, reject, or modify item states.

---

## 🏗️ System Architecture & Data Flow
CampusMarket follows a decoupled client-server architecture designed for speed, data integrity, and media scalability:

```text
[ Next.js Frontend ]  <--->  [ Express REST API ]  <--->  [ MongoDB Database ]

         |                            |
         +------> [ Cloudinary ] <----+
                  (Image Hosting)
```

* **Client Layer:** Handles responsive UI rendering, multi-criteria filtering, and role-based dashboard views.
* **API & Business Logic Layer:** Enforces state transitions (e.g., locking competing offers upon acceptance) and applies privacy filters before returning user data.
* **Persistence & Media Layer:** Stores structured user, listing, and offer documents in MongoDB while offloading image optimization and delivery to Cloudinary.

---

## 💻 Tech Stack

| Layer | Technology | Role in CampusMarket |
| :--- | :--- | :--- |
| **Frontend** | **Next.js & React** | Component-based UI, routing, and state management |
| **Styling** | **Tailwind CSS** | Responsive, mobile-first campus marketplace design |
| **Backend** | **Node.js & Express** | RESTful API, authentication, and deal-locking rules |
| **Database** | **MongoDB** | Flexible document storage for listings, offers, and notifications |
| **Cloud Storage** | **Cloudinary** | Automated image uploads, compression, and CDN delivery |

---

## 📌 Current Project Scope
To keep the MVP focused, fast, and reliable for campus use, the current version operates within these boundaries:
* **Offline Handoffs:** Deals and payments are completed face-to-face on campus once contact details are unlocked.
* **Self-Reported Campus Profiles:** Students list their college and course on their profile without third-party ID verification.
* **Standard Notifications:** Status updates and alerts sync automatically upon page navigation and refresh.


