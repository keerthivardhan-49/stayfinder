
// if(process.env.NODE_ENV !=="production"){
//     require('dotenv').config();
//     console.log("Loaded .env file in development");
// }
// // console.log(process.env.SECRET);



const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');


//Including Models
const Listing = require('./Models/listing');
const Review =require("./Models/review.js");
const User=require("./Models/user.js");


app.use(methodOverride('_method'));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.engine('ejs',ejsMate);



const wrapAsync = require('./utils/wrapAsync');
const ExpressError= require("./utils/ExpressError.js");
// schema validation
const { listingSchema,reviewSchema } = require("./schema.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");


if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    console.log("✅ Loaded .env for development");
}

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



const store = MongoStore.create({
    mongoUrl: dbUrl,               // URL of MongoDB (Atlas or localhost)
    crypto: {
        secret: "honey"            // Used to encrypt session data before storing
    },
    touchAfter: 24 * 3600          // Limit session updates to once every 24 hrs
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION Store",err);
});

const sessionOptions = {
    store: store,                 // use the MongoDB session store
    secret: "honey",              // used to sign the session ID cookie (prevent tampering)
    resave: false,                // don’t force session to be saved if unmodified
    saveUninitialized: true,     // save new sessions even if not modified
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // set expiry 7 days ahead
        maxAge: 7 * 24 * 60 * 60 * 1000,                // cookie valid for 7 days
        httpOnly: true           // JS can’t access this cookie (XSS protection)
    }
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));//all user should be authenticated by LocalStrategy

passport.serializeUser(User.serializeUser());//Meaning is to store all information about user into session
passport.deserializeUser(User.deserializeUser());//Meaning is to unstore all information about user into session


//Middleware used to send local variable data to all ejs files
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");//to automatically render success to all views
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


//Assessing Routes
const listingsRouter= require("./routes/listingRouter.js");
const reviewsRouter=require("./routes/reviewRouter.js");
const userRouter=require("./routes/userRouter.js");


//root route
// app.get("/",(req,res)=>{
//     res.send("hi iam root");
// });




//using routes from listing.js and review.js
app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);



app.all("/{*any}",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found !"))
}); 

// TO Handle ERRORs we use error handling MIDDLEWARES  THESE ARE USED TO HIDE COMPLEX CODE ERROR TO USERS OF WEBSITE

app.use((err,req,res,next)=>{
    // console.log(err);
    let{status=500,message="something went wrong!"}=err;
    res.render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("server is listening  on 8080");
})

