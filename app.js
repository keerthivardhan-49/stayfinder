// ✅ Load environment variables from .env file in development
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    console.log("✅ Loaded .env for development");
}

// ✅ Core & Security Dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const compression = require("compression");

// ✅ Express App Initialization
const app = express();

// ✅ Mongoose Models
const Listing = require('./Models/listing');
const Review = require("./Models/review");
const User = require("./Models/user");

// ✅ Utility Modules
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

// ✅ Middleware: Static, Form Parsing, Method Override
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

// ✅ Security & Performance Middlewares
app.use(helmet());
app.use(compression());

// ✅ View Engine Setup
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Session & Auth Libraries
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// ✅ MongoDB Connection
const dbUrl = process.env.ATLASDB_URL;

if (process.env.NODE_ENV !== "production") {
    console.log("📡 Connecting to MongoDB...");
}

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}
main();

// ✅ Mongo Store for Sessions
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("❌ ERROR in MONGO SESSION Store", err);
});

// ✅ Session Configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false, // changed from true → false
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

// ✅ Force HTTPS in Production (Render)
if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

// ✅ Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Flash + Current User Injection
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ✅ Routes
const listingsRouter = require("./routes/listingRouter");
const reviewsRouter = require("./routes/reviewRouter");
const userRouter = require("./routes/userRouter");

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// ✅ Health Check Route (optional)
app.get("/health", (req, res) => {
    res.send("OK");
});

// ✅ 404 Handler
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// ✅ Error Handler
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).render("error.ejs", { message });
});

// ✅ Start Server
const port = 8080;
app.listen(port, () => {
    console.log(`✅ Server is listening on port ${port}`);
});
