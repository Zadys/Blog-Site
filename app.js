let express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer"),
	app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); //must come after body-parser
app.use(express.static("public"));
app.use(methodOverride("_method"));

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/blog_db");

let blogSchema = mongoose.Schema({
	title: String,
	author: String,
	content: String,
	image: {type: String, default: "https://images.unsplash.com/photo-1578040006008-a682a395e046?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
	published: {type: Date, default: Date.now}
});

let Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res)=>{
	res.render("landing");
});

// INDEX route
app.get("/blogs", (req, res)=>{
	
	Blog.find({}, (err, blogs)=>{
		if(err) console.log("Error has ocurred");
		else {
			res.render("blogs", {blogs: blogs});
		}
	});
});

// NEW route
app.get("/blogs/new", (req, res)=>{
	res.render("new");
});

// CREATE route
app.post("/blogs", (req, res)=>{
	let newBlog = {
		title: req.body.blogTitle,
		author: req.body.authorName,
		content: req.sanitize(req.body.blogContent)
	}
	
	if(req.body.blogImage) newBlog.image = req.body.blogImage; // if the user provides an image, set it
	
	Blog.create(newBlog, (err, blog)=>{
		if(err) {
			console.log("An error ocurred trying to create a new blog");
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

// SHOW route
app.get("/blogs/:id", (req, res)=>{
	Blog.findById(req.params.id, (err, blog)=>{
		if(!err) res.render("show", {blog: blog});
	});
});

// EDIT route
app.get("/blogs/:id/edit", (req, res)=>{
	Blog.findById(req.params.id, (err, blog)=>{
		if(!err) {
			res.render("edit", {blog: blog});
		}
	});
});

// UPDATE route
app.put("/blogs/:id", (req, res)=>{
	let updatedBlog = {
		title: req.body.blogTitle,
		image: req.body.blogImage,
		content: req.sanitize(req.body.blogContent),
	}
	Blog.findByIdAndUpdate(req.params.id, updatedBlog, (err, blog)=>{
		if(err) res.redirect("blogs");
		else res.redirect(`/blogs/${req.params.id}`);
	});
});

// DELETE route
app.delete("/blogs/:id", (req, res)=>{
	Blog.findByIdAndRemove(req.params.id, (err)=>{
		if(!err) res.redirect("/blogs");
		else res.redirect(`/blogs/${req.params.id}`);
	});
});
app.listen(3000, ()=>{
	console.log("Blog server is running..!");
});
