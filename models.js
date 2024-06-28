const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define user schema
const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Inventory: {
    fish: [
      {
        fishId: { type: mongoose.Schema.Types.ObjectId, ref: "Fish" },
        quantity: { type: Number, default: 0 },
      },
    ],
    bubbles: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Bubble" },
        quantity: { type: Number, default: 0 },
      },
    ],
  },
  Pearls: { type: Number, default: 0 },
  Upgrades: [
    { upgradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Upgrade" } },
  ],
  Achievements: [
    {
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
    },
  ],
});

// Static method to hash password
userSchema.statics.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

// Method to validate password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Define User model
const User = mongoose.model("User", userSchema);

module.exports.User = User;
