const AdminUser = require("../models/AdminUser");

const adminMiddleware = async (req, res, next) => {
  try {
    const headerEmail = (req.headers["x-user-email"] || req.user?.email || "").toLowerCase();

    if (!headerEmail) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Missing user email" });
    }

    const adminRecord = await AdminUser.findOne({
      where: { email: headerEmail, isActive: true },
    });

    if (!adminRecord) {
      return res
        .status(403)
        .json({ error: "Forbidden: Admin access required" });
    }

    req.isAdmin = true;
    req.adminUser = adminRecord;
    return next();
  } catch (error) {
    console.error("Error validating admin access", error);
    return res.status(500).json({ error: "Failed to validate admin access" });
  }
};

module.exports = adminMiddleware;
