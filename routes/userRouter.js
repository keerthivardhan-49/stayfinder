const express=require("express");
const router=express.Router({mergeParams:true});
const User=require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController= require("../controllers/userController");



//------------------------BEFORE Using router.route(path)------------------------------------------------------
// router.get("/signup",userController.RenderSignUpForm);
// router.post("/signup",wrapAsync(userController.putSignUpInfo));


//---------------------------AFTER  using router.route(path)---------------------------------------------------
router.route("/signup")
.get(userController.RenderSignUpForm)
.post(wrapAsync(userController.putSignUpInfo))


//--------------------------------------------------------Login----------------------------------------------------
router.get("/login",userController.RenderloginForm);

// passport.authenticate() is middleware provided by the Passport.js library,
//  used for handling authentication (verifying user credentials like username and password).
router.post("/login",
    saveRedirectUrl,//saves actions before [LOGIN]

    //we need to check weather credentials are present in database or not
    //this is done by passport middleware
    passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),
    userController.postLoginInfo
);

// ------------------------------------------------------Logout----------------------------------------------9
//--req.logout()  removes userDATA from session
router.get("/logout",userController.logout);


module.exports=router;