const passport = require('passport')
const db = require("../module/db");
const bcrypt = require('bcrypt');

const saltRounds = 10;
// get signup route
exports.getAuthSignup = async (req, res) => {
    res.render('signup.ejs');
}

// get login route
exports.getAuthLogin = async (req, res) => {
    res.render('login.ejs');
}

// post signup
exports.authSignup = async (req, res) => {
       const { fullname, username, email, password } = req.body;
    console.log(fullname, username,email, password)
                try {
            const result = await db.query("SELECT * FROM users WHERE email = $1 OR username = $2", [
                email, username
            ]);
    
            if (result.rows.length > 0) {
                res.render("signup.ejs", { error: "User already exists with this email/username." });
            } else {
                // Hashing the password
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                    if (err) {
                        console.error("Error hashing password:", err);
                        return res.render("signup.ejs", { error: "An error occurred during signup." });
                    }
    
                    try {
                        const result = await db.query(
                            "INSERT INTO users (fullname, username, email, hash_password) VALUES ($1, $2, $3, $4) RETURNING *",
                            [fullname, username, email, hash]
                        );
                            // res.redirect("/add")
                            // Start a new session and save the user data
                        const user = result.rows[0];
                        req.login(user, (err) => {
                          // console.log("success");
                          if (err) return console.log(err);
                          
                          res.redirect("/dashboard");
                        })
                        req.session.user = user;
                        console.log(req.user)
                    } catch (err) {
                        console.error("Error inserting user:", err);
                        res.render("signup.ejs", { error: "Something went wrong with the database. Please try again." });
                    }
                });
            }
        } catch (err) {
            console.error("Signup error:", err);
            res.render("signup.ejs", { error: "Something went wrong." });
        }
}


exports.AuthLogin = passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
      })

exports.dashboard = async(req, res) => {
         const userId = req.user.id
         const users = req.user
    try {
        const result = await db.query("SELECT COUNT(*) FROM books WHERE uploaded_by = $1", [userId]);
           const bookCount = result.rows[0].count;
        
    res.render("dashboard.ejs", {
        user: users,
        bookCount
    })
    } catch (error) {
        console.error(error)
        res.render("dashboard", {error: "something went wrong"})
    }
}

exports.logout = async (req,res)=> {
    req.session.destroy(err =>{
    if (err) {
      console.log(err);
      res.redirect("/dashboard")// stay on profile
    }else{
       res.redirect("/")
    }
  })
}