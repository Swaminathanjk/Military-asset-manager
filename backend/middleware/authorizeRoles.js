const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const userRole = req.user.role.toLowerCase();
    const normalizedRoles = allowedRoles.map((role) => role.toLowerCase());

   

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    next();
  };
};

module.exports = authorizeRoles;
