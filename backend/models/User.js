const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "base commander", "logistics officer", "personnel"],
      required: true,
    },

    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Base",
      required: function () {
        return this.role !== "admin";
      },
      default: null,
    },

    serviceId: {
      type: String,
      required: function () {
        return this.role === "personnel";
      },
      unique: true,
      sparse: true, // Only creates unique index when not null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
