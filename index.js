require("dotenv").config();

const express = require("express"),
  bodyParser = require("body-parser"),
  axios = require("axios");
app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require("mongoose"),
  Models = require("./models.js"),
  Users = Models.User,
  Lifes = Models.Life,
  Regions = Models.Region;
const { check, validationResult } = require("express-validator");
app.use(bodyParser.json());

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:3000",
  "file:///C:/Users/shamo/lifeInputPage/index.html",
  null,
  "null",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 3 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Inventory: { fish: [], bubbles: [] },
            Pearls: 0,
            Upgrades: [],
            Achievements: [],
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.post("/regions", (req, res) => {
  Regions.findOne({ Name: req.body.Name })
    .then((region) => {
      if (region) {
        return res.status(400).send(req.body.Name + " already exists");
      } else {
        Regions.create({
          Name: req.body.Name,
          Description: req.body.Description,
          Lifes: [],
        })
          .then((region) => {
            res.status(201).json(region);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

app.post("/lifes", (req, res) => {
  const {
    Name,
    Region,
    Type,
    Description,
    Rarity,
    Value,
    MaxSize,
    MinSize,
    ScientificName,
  } = req.body;

  Lifes.findOne({ Name })
    .then((life) => {
      if (life) {
        return res.status(400).send(Name + " already exists");
      } else {
        Regions.findOne({ Name: Region })
          .then((region) => {
            if (!region) {
              return res
                .status(400)
                .send("Region " + Region + " does not exist");
            } else {
              Lifes.create({
                Name,
                Region: region._id,
                Type,
                Description,
                Rarity,
                Value,
                MaxSize,
                MinSize,
                ScientificName,
              })
                .then((life) => {
                  res.status(201).json(life);
                })
                .catch((error) => {
                  console.error(error);
                  res.status(500).send("Error: " + error);
                });
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database successfully");
  } catch (e) {
    console.error("Error connecting to the database:", e.message);
  }
};

connectDB();

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
