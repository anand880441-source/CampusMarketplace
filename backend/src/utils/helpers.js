const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const paginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const contactForUser = (user) => {
  if (!user) return {};
  if (user.contactPreference === "phone" && user.phone) {
    return { phone: user.phone };
  }
  return { email: user.email };
};

const publicUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    college: user.college || "",
    course: user.course || "",
    profileImage: user.profileImage || "",
    contactPreference: user.contactPreference || "email",
    contact: contactForUser(user),
    memberSince: user.createdAt,
  };
};

const isOwner = (doc, userId) => {
  return String(doc.seller && doc.seller._id ? doc.seller._id : doc.seller) === String(userId);
};

module.exports = {
  getPagination,
  paginationMeta,
  escapeRegex,
  contactForUser,
  publicUser,
  isOwner,
};
