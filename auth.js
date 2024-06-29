const jwtSecret = "your_jwt_secret"; // This has to be the same key used in the JWTStrategy

const { updateRegionsWithLife } = require("./functions");
const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport"); // Your local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/* POST login. */
module.exports = (router) => {
  /**
   * Log in a user.
   * @route POST /login
   * @param {string} req.body.username - The username of the user.
   * @param {string} req.body.password - The password of the user.
   * @returns {object} JSON object containing user details and authentication token.
   */
  router.post("/login", async (req, res) => {
    passport.authenticate(
      "local",
      { session: false },
      async (error, user, info) => {
        if (error) {
          return res.status(400).json({
            message: "There is an error",
            user: user,
          });
        }
        if (!user) {
          return res.status(400).json({
            message: "User does not exist",
            user: user,
          });
        }

        req.login(user, { session: false }, async (error) => {
          if (error) {
            return res.status(500).json({ message: "Login error" });
          }

          let token = generateJWTToken(user.toJSON());
          try {
            await updateRegionsWithLife(); // Update regions with lives on login
            res.status(200).json({ user, token }); // Send response only once
          } catch (error) {
            console.error("Error updating regions:", error);
            res.status(500).json({ message: "Error updating regions" });
          }
        });
      }
    )(req, res);
  });
};
