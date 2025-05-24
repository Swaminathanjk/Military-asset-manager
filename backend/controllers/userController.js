const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, baseId, serviceId } = req.body;

    // Role-based validations
    if (role !== "admin" && !baseId) {
      return res
        .status(400)
        .json({ message: "Base ID is required for roles other than admin." });
    }
    if (role === "personnel" && !serviceId) {
      return res
        .status(400)
        .json({ message: "Service ID is required for personnel role." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      baseId: baseId || null,
      serviceId: serviceId || null,
    });

    // Do not return password
    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    res.status(201).json({ message: "User created", data: userToReturn });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists.` });
    }
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("baseId").select("-password");
    res.json({ data: users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("baseId")
      .select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ data: user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, baseId, serviceId, password } = req.body;

    // Role-based validations
    if (role) {
      if (role !== "admin" && !baseId) {
        return res
          .status(400)
          .json({ message: "Base ID is required for roles other than admin." });
      }
      if (role === "personnel" && !serviceId) {
        return res
          .status(400)
          .json({ message: "Service ID is required for personnel role." });
      }
    }

    // If password provided, hash it before update
    let updateData = { ...req.body };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("baseId")
      .select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated", data: updated });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists.` });
    }
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User id missing in request" });
    }

    const user = await User.findById(req.user.id)
      .populate("baseId")
      .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};
