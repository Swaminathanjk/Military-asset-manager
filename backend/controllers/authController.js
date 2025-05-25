const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  let { name, email, password, role, baseId, serviceId } = req.body;

  try {
    // Validate baseId for non-admins
    if (role !== "admin" && !baseId) {
      return res
        .status(400)
        .json({ message: "`baseId` is required for non-admin users" });
    }

    // Validate serviceId for non-admins
    if (role !== "admin" && !serviceId) {
      return res
        .status(400)
        .json({ message: "`serviceId` is required for non-admin users" });
    }

    // Add prefix based on role (lowercase role check for safety)
    const roleLower = role.toLowerCase();
    if (roleLower === "base commander" || roleLower === "commander") {
      serviceId = "CM" + serviceId;
    } else if (roleLower === "logistics officer" || roleLower === "logistics") {
      serviceId = "LG" + serviceId;
    } else if (roleLower === "personnel") {
      serviceId = "PS" + serviceId;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      baseId: role !== "admin" ? baseId : undefined,
      serviceId: role !== "admin" ? serviceId : undefined,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        baseId: newUser.baseId || null,
        serviceId: newUser.serviceId || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        serviceId: user.serviceId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        serviceId: user.serviceId || null,
      },
    });

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
