const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "angelo.quispe.l@tecsup.edu.pe").toLowerCase();

const adminMiddleware = (req, res, next) => {
  const headerEmail = (req.headers["x-user-email"] || req.user?.email || "").toLowerCase();

  if (!headerEmail) {
    return res.status(401).json({ error: "Unauthorized: Missing user email" });
  }

  if (headerEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  req.isAdmin = true;
  return next();
};

module.exports = adminMiddleware;
