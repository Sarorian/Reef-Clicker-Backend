const mongoose = require("mongoose");
const Models = require("./models.js");
const Life = Models.Life;
const Region = Models.Region;

const updateRegionsWithLife = async () => {
  const allLives = await Life.find({});
  const regionUpdates = {};

  // Group lives by region
  allLives.forEach((life) => {
    if (!regionUpdates[life.Region]) {
      regionUpdates[life.Region] = [];
    }
    regionUpdates[life.Region].push(life._id);
  });

  // Update each region with its respective lives
  const updatePromises = Object.keys(regionUpdates).map((regionId) =>
    Region.findByIdAndUpdate(
      regionId,
      { Lifes: regionUpdates[regionId] },
      { new: true, useFindAndModify: false }
    )
  );

  await Promise.all(updatePromises);
  console.log("Regions updated with lives");
};

module.exports = { updateRegionsWithLife };
