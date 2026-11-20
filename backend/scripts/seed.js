require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const connectDB = require("../src/confing/db");
const User = require("../src/models/User");
const Listing = require("../src/models/Listing");
const Enquiry = require("../src/models/Enquiry");
const Notification = require("../src/models/Notification");

const DEMO_PASSWORD = "password123";
const DEMO_EMAILS = ["arjun@campus.edu", "priya@campus.edu", "rahul@campus.edu"];

const daysAgo = (days, hours = 0) => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000);
};

const userSeeds = [
  {
    name: "Arjun Mehta",
    email: "arjun@campus.edu",
    college: "IIT Delhi",
    course: "B.Tech Computer Science",
    phone: "9876543210",
    contactPreference: "phone",
    createdAt: daysAgo(180),
  },
  {
    name: "Priya Sharma",
    email: "priya@campus.edu",
    college: "IIT Delhi",
    course: "B.Tech Electronics",
    phone: "9812345678",
    contactPreference: "email",
    createdAt: daysAgo(150),
  },
  {
    name: "Rahul Verma",
    email: "rahul@campus.edu",
    college: "Delhi University",
    course: "B.Com Honours",
    phone: "9898989898",
    contactPreference: "phone",
    createdAt: daysAgo(120),
  },
];

const listingSeeds = [
  {
    key: "dsaBook",
    seller: 0,
    title: "Data Structures and Algorithms Textbook",
    description:
      "Cormen CLRS 3rd edition. Covers all topics for semester exams and placement preparation. A few highlights in the first three chapters, otherwise in very good shape.",
    price: 450,
    category: "books",
    condition: "good",
    listingType: "sale",
    status: "available",
    location: "IIT Delhi, Hostel 4",
    daysAgo: 1,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "calculator",
    seller: 0,
    title: "Casio FX-991EX Scientific Calculator",
    description:
      "Original Casio calculator with slide cover. Used for one semester only. All keys work perfectly, includes quick start guide.",
    price: 850,
    category: "electronics",
    condition: "like_new",
    listingType: "sale",
    status: "reserved",
    location: "IIT Delhi, Central Library",
    daysAgo: 3,
    images: [
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "studyTable",
    seller: 0,
    title: "Study Table with Storage Drawer",
    description:
      "Sturdy wooden study table, perfect for a hostel or rented room. Has one wide drawer and a small shelf. Buyer needs to arrange pickup.",
    price: 1800,
    category: "furniture",
    condition: "good",
    listingType: "sale",
    status: "reserved",
    location: "IIT Delhi, Hostel 4",
    daysAgo: 8,
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "drawingKit",
    seller: 0,
    title: "Engineering Drawing Kit",
    description:
      "Full engineering drawing kit with compass, set squares, scale and pencils. Free to a first-year student who can pick it up from campus.",
    price: 0,
    category: "stationery",
    condition: "fair",
    listingType: "free",
    status: "available",
    location: "IIT Delhi, Hostel 4",
    daysAgo: 2,
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "headphones",
    seller: 0,
    title: "Bluetooth Over-Ear Headphones",
    description:
      "Wireless headphones with about 20 hours of battery life. Comes with charging cable and carry pouch. Great for online lectures.",
    price: 1200,
    category: "electronics",
    condition: "good",
    listingType: "sale",
    status: "sold",
    location: "IIT Delhi, Hostel 4",
    daysAgo: 20,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "chemNotes",
    seller: 1,
    title: "Organic Chemistry Notes - Full Semester",
    description:
      "Complete handwritten notes with reaction charts and practice questions. Covers the full semester syllabus and previous year questions.",
    price: 300,
    category: "books",
    condition: "good",
    listingType: "sale",
    status: "available",
    location: "IIT Delhi, Girls Hostel 2",
    daysAgo: 4,
    images: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "bookshelf",
    seller: 1,
    title: "Wooden Bookshelf - 4 Shelves",
    description:
      "Compact bookshelf with four shelves. No damage, easy to move. Selling because I am shifting to another city for an internship.",
    price: 2200,
    category: "furniture",
    condition: "like_new",
    listingType: "sale",
    status: "available",
    location: "IIT Delhi, Girls Hostel 2",
    daysAgo: 6,
    images: [
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "drafter",
    seller: 1,
    title: "Mini Drafter and Drawing Board",
    description:
      "Mini drafter with a drawing board in good condition. Happy to exchange for a good quality wireless mouse or a programming book.",
    price: 0,
    category: "stationery",
    condition: "good",
    listingType: "exchange",
    status: "available",
    location: "IIT Delhi, Girls Hostel 2",
    daysAgo: 5,
    images: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "laptop",
    seller: 1,
    title: "HP Pavilion Laptop - i5, 8GB RAM",
    description:
      "Reliable laptop for classes and coding practice. 256GB SSD, Windows 11 installed. Minor scratches on the lid, battery holds about 4 hours.",
    price: 18000,
    category: "electronics",
    condition: "fair",
    listingType: "sale",
    status: "available",
    location: "IIT Delhi, Girls Hostel 2",
    daysAgo: 7,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "labCoat",
    seller: 1,
    title: "Lab Coat - Size M",
    description:
      "Clean white lab coat, size medium. Used for one chemistry lab semester. Free pickup from the hostel gate.",
    price: 0,
    category: "other",
    condition: "good",
    listingType: "free",
    status: "available",
    location: "IIT Delhi, Girls Hostel 2",
    daysAgo: 10,
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "gatePapers",
    seller: 2,
    title: "GATE Previous Year Papers Bundle",
    description:
      "Printed question papers from the last 10 years for GATE ECE. Useful for practice and revision. No markings inside.",
    price: 500,
    category: "books",
    condition: "like_new",
    listingType: "sale",
    status: "available",
    location: "Delhi University, North Campus",
    daysAgo: 2,
    images: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "chair",
    seller: 2,
    title: "Ergonomic Office Chair",
    description:
      "Comfortable office chair with adjustable height and armrests. Ideal for long study sessions. Pickup only.",
    price: 2500,
    category: "furniture",
    condition: "good",
    listingType: "sale",
    status: "sold",
    location: "Delhi University, North Campus",
    daysAgo: 25,
    images: [
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "racket",
    seller: 2,
    title: "Yonex Badminton Racket",
    description:
      "Lightweight badminton racket with a fresh grip. Looking to exchange for a table tennis bat or a good quality football.",
    price: 0,
    category: "other",
    condition: "good",
    listingType: "exchange",
    status: "available",
    location: "Delhi University, Sports Complex",
    daysAgo: 9,
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    key: "deskLamp",
    seller: 2,
    title: "Old Desk Lamp",
    description:
      "Simple desk lamp with adjustable neck. The switch is a little loose but it works. Listing is currently paused.",
    price: 200,
    category: "electronics",
    condition: "fair",
    listingType: "sale",
    status: "available",
    isActive: false,
    location: "Delhi University, North Campus",
    daysAgo: 30,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

const enquirySeeds = [
  {
    listing: "dsaBook",
    buyer: 1,
    message:
      "Hi! Is the DSA book still available? I can pick it up from Hostel 4 tomorrow evening.",
    offerPrice: 400,
    status: "pending",
    daysAgo: 0,
    hoursAgo: 3,
  },
  {
    listing: "calculator",
    buyer: 2,
    message: "I need this calculator for my exams next week. Would 750 work?",
    offerPrice: 750,
    status: "accepted",
    responseMessage: "Sure, 750 is fine. You can pick it up from the library tomorrow.",
    daysAgo: 2,
    hoursAgo: 1,
  },
  {
    listing: "laptop",
    buyer: 0,
    message: "Is the battery replaceable? Can I see it before deciding?",
    offerPrice: null,
    status: "pending",
    daysAgo: 1,
    hoursAgo: 2,
  },
  {
    listing: "bookshelf",
    buyer: 2,
    message: "Will you accept 2000? I can arrange a pickup this weekend.",
    offerPrice: 2000,
    status: "rejected",
    responseMessage: "Sorry, I already have an offer closer to the listed price.",
    daysAgo: 3,
    hoursAgo: 4,
  },
  {
    listing: "gatePapers",
    buyer: 0,
    message: "Do these papers include detailed solutions as well?",
    offerPrice: 450,
    status: "withdrawn",
    daysAgo: 4,
    hoursAgo: 0,
  },
  {
    listing: "racket",
    buyer: 1,
    message: "Hi, I have a table tennis bat I could exchange. Are you interested?",
    offerPrice: null,
    status: "pending",
    daysAgo: 0,
    hoursAgo: 6,
  },
];

const favoriteSeeds = {
  0: ["chemNotes", "laptop", "gatePapers"],
  1: ["dsaBook", "calculator", "chair"],
  2: ["studyTable", "labCoat"],
};

const seed = async () => {
  await connectDB();

  const demoUsers = await User.find({ email: { $in: DEMO_EMAILS } }).select("_id");
  const demoUserIds = demoUsers.map((user) => user._id);
  const demoListings = await Listing.find({ seller: { $in: demoUserIds } }).select("_id");
  const demoListingIds = demoListings.map((listing) => listing._id);

  if (demoUserIds.length > 0) {
    await Promise.all([
      Enquiry.deleteMany({
        $or: [
          { buyer: { $in: demoUserIds } },
          { seller: { $in: demoUserIds } },
          { listing: { $in: demoListingIds } },
        ],
      }),
      Notification.deleteMany({
        $or: [
          { user: { $in: demoUserIds } },
          { listing: { $in: demoListingIds } },
        ],
      }),
      Listing.deleteMany({ _id: { $in: demoListingIds } }),
      User.deleteMany({ _id: { $in: demoUserIds } }),
    ]);
    console.log("Removed previous demo data");
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = [];

  for (const seedUser of userSeeds) {
    const user = new User({
      ...seedUser,
      password: hashedPassword,
      createdAt: seedUser.createdAt,
      updatedAt: seedUser.createdAt,
    });
    await user.save({ timestamps: false });
    users.push(user);
  }

  const listings = {};

  for (const seedListing of listingSeeds) {
    const createdAt = daysAgo(seedListing.daysAgo);
    const listing = new Listing({
      seller: users[seedListing.seller]._id,
      title: seedListing.title,
      description: seedListing.description,
      price: seedListing.price,
      category: seedListing.category,
      condition: seedListing.condition,
      listingType: seedListing.listingType,
      images: seedListing.images,
      status: seedListing.status,
      isActive: seedListing.isActive !== false,
      location: seedListing.location,
      createdAt,
      updatedAt: createdAt,
    });
    await listing.save({ timestamps: false });
    listings[seedListing.key] = listing;
  }

  const enquiries = [];

  for (const seedEnquiry of enquirySeeds) {
    const listing = listings[seedEnquiry.listing];
    const createdAt = daysAgo(seedEnquiry.daysAgo, seedEnquiry.hoursAgo);
    const enquiry = new Enquiry({
      listing: listing._id,
      buyer: users[seedEnquiry.buyer]._id,
      seller: listing.seller,
      message: seedEnquiry.message,
      offerPrice: seedEnquiry.offerPrice,
      status: seedEnquiry.status,
      responseMessage: seedEnquiry.responseMessage || "",
      respondedAt:
        seedEnquiry.status === "accepted" || seedEnquiry.status === "rejected"
          ? new Date(createdAt.getTime() + 3 * 60 * 60 * 1000)
          : null,
      createdAt,
      updatedAt: createdAt,
    });
    await enquiry.save({ timestamps: false });
    enquiries.push({ enquiry, seed: seedEnquiry });

    await Notification.create({
      user: listing.seller,
      type: "enquiry_received",
      message: `${users[seedEnquiry.buyer].name} sent an enquiry on "${listing.title}"`,
      listing: listing._id,
      enquiry: enquiry._id,
      isRead: seedEnquiry.daysAgo > 1,
    });

    if (seedEnquiry.status === "accepted" || seedEnquiry.status === "rejected") {
      await Notification.create({
        user: enquiry.buyer,
        type: "enquiry_response",
        message: `Your enquiry on "${listing.title}" was ${enquiry.status}`,
        listing: listing._id,
        enquiry: enquiry._id,
        isRead: seedEnquiry.status === "rejected",
      });
    }
  }

  for (const [userIndex, listingKeys] of Object.entries(favoriteSeeds)) {
    const user = users[Number(userIndex)];
    user.favorites = listingKeys.map((key) => listings[key]._id);
    await user.save({ timestamps: false });
  }

  console.log("Seed complete");
  console.log("Demo users (password: password123):");
  userSeeds.forEach((user) => console.log(`- ${user.email}`));
  console.log(`Listings created: ${Object.keys(listings).length}`);
  console.log(`Enquiries created: ${enquiries.length}`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
