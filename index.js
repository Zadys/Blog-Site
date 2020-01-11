let express = require("express"),
    passport = require("passport"),
    router = express.Router(),
    User = require("../models/user");

// ROOT route
router.get("/", (req, res) => {
    res.render("landing");
});


// AUTH routes
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Welcome to the site, ${user.username}!`);
            res.redirect("/blogs");
        });
    });
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You've been logged out.");
    res.redirect("/blogs");
});

let isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    res.redirect("/login");
}

module.exports = router;