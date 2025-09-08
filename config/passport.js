const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../module/db");
const bcrypt = require("bcrypt");

// ----- LOCAL STRATEGY (email or username + password) -----
passport.use(
  new LocalStrategy(
    { usernameField: "emailOrUsername", passwordField: "password" },
    async (emailOrUsername, password, cb) => {
      try {
        const result = await db.query(
          "SELECT * FROM users WHERE email = $1 OR username = $1",
          [emailOrUsername]
        );

        if (result.rows.length === 0) {
          return cb(null, false, { message: "User not found" });
        }

        const user = result.rows[0];

        bcrypt.compare(password, user.hash_password, (err, isMatch) => {
          if (err) return cb(err);

          if (isMatch) {
            return cb(null, user);
          } else {
            return cb(null, false, { message: "Incorrect password" });
          }
        });
      } catch (error) {
        console.error("Login error:", error);
        return cb(error);
      }
    }
  )
);


// ----- GOOGLE STRATEGY -----
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/profile",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails[0].value;
        const fullname = profile.displayName;
        const username = profile.displayName.replace(/\s+/g, "").toLowerCase(); // auto-username
        const photo = profile.photos?.[0]?.value || null;

        // Check if user exists
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);

        if (result.rows.length === 0) {
          // Create new user with photo
          const insert = await db.query(
            `INSERT INTO users (fullname, username, email, hash_password, photo) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fullname, username, email, "google-oauth", photo]
          );

          cb(null, insert.rows[0]);
        } else {
          // Update photo if missing/changed
          const existingUser = result.rows[0];
          if (!existingUser.photo || existingUser.photo !== photo) {
            const update = await db.query(
              `UPDATE users SET photo = $1 WHERE id = $2 RETURNING *`,
              [photo, existingUser.id]
            );
            return cb(null, update.rows[0]);
          }

          cb(null, existingUser);
        }
      } catch (error) {
        console.error("Google auth error:", error);
        cb(error, null);
      }
    }
  )
);


// ----- SESSION SERIALIZE -----
passport.serializeUser((user, cb) => {
  cb(null, user.id); // store only id in session
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err, null);
  }
});
