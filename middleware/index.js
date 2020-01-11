const Blog = require("../models/blog"),
    Comment = require("../models/comment");

const middlewareObj = {


    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) return next();

        req.flash("error", "Please login first to do that."); // defines a flash(key, value)
        res.redirect("/login");
    },

    checkBlogOwnership: (req, res, next) => {
        if (req.isAuthenticated()) {
            Blog.findById(req.params.id, (err, blog) => {
                if (err) req.flash("error", "Something went wrong... please try again.");
                else {

                    //does the blog even exist?
                    if (!blog) {
                        req.flash("error", "Blog not found.");
                        return res.redirect("back");
                    }
                    //does user own blog?
                    if (blog.author.id.equals(req.user._id)) next();
                    else {
                        req.flash("error", "Sorry, you don't own that blog.");
                        res.redirect("back");
                    }
                }
            });
        } else {
            res.redirect("/login");
        }
    },

    checkCommentOwnership: (req, res, next) => {
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, (err, comment) => {
                if (err) res.redirect("back")
                else {

                    if (!comment) {
                        req.flash("error", "Comment not found.");
                        return res.redirect("back");
                    }
                    //does user own blog?
                    if (comment.author.id.equals(req.user._id)) next();
                    else {
                        req.flash("error", "Sorry, you dont own that comment.");
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("error", "Please login first to do that.");
            res.redirect("/login");
        }
    }
};

module.exports = middlewareObj;