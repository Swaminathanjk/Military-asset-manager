const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      console.log("No user or role in request object");
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const userRole = req.user.role.toLowerCase();
    const normalizedRoles = allowedRoles.map((role) => role.toLowerCase());

    console.log("User role (lowercase):", userRole);
    console.log("Allowed roles (lowercase):", normalizedRoles);

    if (!normalizedRoles.includes(userRole)) {
      console.log("Access denied. Role not in allowed list.");
      return res.status(403).json({ message: "Unauthorized role" });
    }

    console.log("Access granted");
    next();
  };
};

module.exports = authorizeRoles;
