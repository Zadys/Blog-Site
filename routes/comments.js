let express = require("express"),
    router = express.Router({ mergeParams: true }),
    Blog = require("../models/blog"),
    Comment = require("../models/comment"),
    middleware = require("../middleware"); // index.js is automatically required



// NEW route
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
        if (err) console.log(err);
        else res.render("comments/new", { blog: blog });
    })
});

// CREATE route
router.post("/", (req, res) => {

    Blog.findById(req.params.id, (err, blog) => {
        if (err) {
            req.flash("error", err.message);
            console.log(err);
        } else {
            let newComment = req.body.comment;
            newComment.text = req.sanitize(newComment.text);
            Comment.create(newComment, (err, comment) => {
                if (err) console.log(err);
                else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    blog.comments.push(comment);
                    blog.save(() => {
                        res.redirect(`/blogs/${blog._id}`);
                    });
                }
            });
        }
    });
});

//EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if (err) {
            req.flash("error", err.message);
            console.log(err);
        }
        else res.render("comments/edit", { blogId: req.params.id, comment: comment });
    });
});

//UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    let updatedComment = req.body.comment;
    Comment.findByIdAndUpdate(req.params.comment_id, updatedComment, (err, comment) => {
        if (err) console.log(err);
        else res.redirect(`/blogs/${req.params.id}`);
    });
});

//DESTROY route
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, (err) => {
        if (err) console.log(err);
        else {
            req.flash("success", "Comment successfully removed");
            res.redirect(`/blogs/${req.params.id}`);
        }
    });
});

module.exports = router;