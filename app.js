let express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer"),
	flash = require("connect-flash"),
	User = require("./models/user"),
	passport = require("passport"),
	localStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	seedDB = require("./seeds"),
	app = express();

let blogRoutes = require("./routes/blogs"),
	commentRoutes = require("./routes/comments"),
	indexRoutes = require("./routes/index");

//===== EXPRESS =====//
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); //must come after body-parser
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//===== MONGOOSE =====//
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost/blog_db");

app.use(flash()); // must come before Passport config

app.locals.moment = require("moment");

//===== PASSPORT =====//
app.use(require("express-session")({
	secret: "very unpredictable secret",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//this is a middleware that will pass in user information on ALL routes
app.use((req, res, next) => {
	res.locals.currentUser = req.user; //the name after locals is what you use inside templates
	res.locals.errorMessage = req.flash("error");
	res.locals.successMessage = req.flash("success");

	next();
});


// express router things
app.use("/blogs", blogRoutes);
app.use("/blogs/:id/comments", commentRoutes); //make sure to {mergeParams: true} to be able to use ":id"
app.use(indexRoutes);


//seedDB();

app.listen(3000, () => {
	console.log("Blog server is running..!");
});
