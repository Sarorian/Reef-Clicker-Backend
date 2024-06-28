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
let allowedOrigins = ["http://localhost:3000"];

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
