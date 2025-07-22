// ✅ Load environment variables from .env file in development
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    console.log("✅ Loaded .env for development");
}

// ✅ Import Core Dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// ✅ Initialize Express App
const app = express();

// ✅ Import Mongoose Models
const Listing = require('./Models/listing');
const Review = require("./Models/review");
const User = require("./Models/user");

// ✅ Middleware for method override (_method in forms), parsing form data, and serving static files
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

// ✅ Set up EJS as the view engine with ejs-mate layouts
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Utility Modules
const wrapAsync = require('./utils/wrapAsync'); // for clean async error handling
const ExpressError = require("./utils/ExpressError"); // custom error class
const { listingSchema, reviewSchema } = require("./schema"); // Joi schemas for validation

// ✅ Session and Authentication Libraries
const session = require("express-session");
const MongoStore = require("connect-mongo"); // for storing session data in MongoDB
const flash = require("connect-flash"); // flash messages for feedback
const passport = require("passport");
const LocalStrategy = require("passport-local");

// ✅ Connect to MongoDB Atlas using environment variable
const dbUrl = process.env.ATLASDB_URL;
console.log("📡 Connecting to MongoDB URL:", dbUrl);

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}
main();

// ✅ Configure session store using connect-mongo
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET, // encrypt session data
    },
    touchAfter: 24 * 3600 // session update limit: once every 24 hours
});

// ✅ Handle MongoStore errors
store.on("error", (err) => {
    console.log("❌ ERROR in MONGO SESSION Store", err);
});

// ✅ Session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET, // secret key to sign session ID cookie
    resave: false, // don’t save session if not modified
    saveUninitialized: true, // save uninitialized sessions
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // expires in 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true // prevents client-side JavaScript from accessing the cookie
    }
};

// ✅ Use session and flash middlewares
app.use(session(sessionOptions));
app.use(flash());

// ✅ Configure Passport for user authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // local strategy using passport-local-mongoose
passport.serializeUser(User.serializeUser()); // how to store user in session
passport.deserializeUser(User.deserializeUser()); // how to remove user from session

// ✅ Middleware to inject flash messages and current user info to all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // logged-in user info
    next();
});

// ✅ Routes
const listingsRouter = require("./routes/listingRouter");
const reviewsRouter = require("./routes/reviewRouter");
const userRouter = require("./routes/userRouter");

// ✅ Use Routers
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// ✅ Catch-All Route for 404 errors
app.all("/{*any}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).render("error.ejs", { message });
});

// ✅ Start Server (Render provides process.env.PORT)
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`✅ Server is listening on port ${port}`);
});

