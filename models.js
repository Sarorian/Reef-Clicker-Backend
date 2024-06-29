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

const lifeSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  Type: {
    type: String,
    enum: [
      "Fish",
      "Eel",
      "Shark",
      "Ray",
      "Crustacean",
      "Cephalopod",
      "Jelly",
      "Reptile",
      "Mammal",
      "Bird",
    ],
    required: true,
  },
  Description: { type: String },
  Rarity: {
    type: String,
    enum: [
      "Common",
      "Uncommon",
      "Rare",
      "Ultra Rare",
      "Legendary",
      "Mythic",
      "Exotic",
    ],
    default: "Common",
  },
  Value: { type: Number, default: 0 },
  MaxSize: { type: Number, required: true },
  MinSize: { type: Number, required: true },
  ScientificName: { type: String, required: true },
});

const regionSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String },
  Lifes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Life" }],
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
const Life = mongoose.model("Life", lifeSchema, "lifes");
const Region = mongoose.model("Region", regionSchema);

module.exports.User = User;
module.exports.Life = Life;
module.exports.Region = Region;
