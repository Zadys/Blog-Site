let express = require("express"),
    router = express.Router(),
    Blog = require("../models/blog"),
    middleware = require("../middleware");

// INDEX route
router.get("/", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) console.log("Error has ocurred");
        else {
            if (req.user) var username = req.user.username; //get an error with let
            res.render("blogs/blogs", { blogs: blogs, username: username });
        }
    });
});

// NEW route
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("blogs/new");
});

// CREATE route
router.post("/", middleware.isLoggedIn, (req, res) => {

    let newBlog = req.body.blog;

    if (!req.body.blog.image) newBlog.image = undefined; // sets image to default if no url provided
    req.body.blog.content = req.sanitize(req.body.blog.content); // sanitize the content

    let author = { id: req.user._id, username: req.user.username };
    newBlog.author = author;

    Blog.create(newBlog, (err, blog) => {
        if (err) {
            console.log("An error ocurred trying to create a new blog");
            res.render("blogs/new");
        } else {
            res.redirect("blogs");
        }
    });
});

// SHOW route
router.get("/:id", (req, res) => {

    Blog.findById(req.params.id).populate("comments").exec((err, blog) => {

        if (err) {
            //req.flash("error", err.message);
            console.log(err);
            res.redirect("blogs/blogs");
        }
        else {
            res.render("blogs/show", { blog: blog });
        }
    });
});

// EDIT route
router.get("/:id/edit", middleware.checkBlogOwnership, (req, res) => {
    console.log(`${req.params.id}\t${typeof req.params.id}`);
    Blog.findById(req.params.id, (err, blog) => {
        if (err) {
            req.flash("error", err.message);
            console.log(err);
        }
        else res.render("blogs/edit", { blog: blog });
    });
});

// UPDATE route
router.put("/:id", middleware.checkBlogOwnership, (req, res) => {

    req.body.blog.content = req.sanitize(req.body.blog.content);
    let updatedBlog = req.body.blog;

    if (!updatedBlog.image) updatedBlog.image = imageGen();
    console.log(updatedBlog.image);

    Blog.findByIdAndUpdate(req.params.id, updatedBlog, (err, blog) => {
        if (err) res.redirect("blogs");
        else res.redirect(`/blogs/${req.params.id}`);
    });
});

// DELETE route
router.delete("/:id", middleware.checkBlogOwnership, (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err) => {
        if (!err) res.redirect("/blogs");
        else {
            Comment.deleteMany({ _id: { $in: blog.comments } }, (err) => {
                if (err) {
                    req.flash("error", err.message);
                    console.log(err);
                }
                else res.redirect(`/blogs/${req.params.id}`);
            });
        }
    });
});

module.exports = router;