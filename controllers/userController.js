const User=require("../Models/user");

module.exports.RenderSignUpForm=(req,res)=>{
    res.render("./users/signup.ejs");
}

module.exports.putSignUpInfo=async(req,res)=>{
    try{
    let{username,email,password}=req.body;
    const newUser=new User({email:email,username:username});
    const registredUser=await User.register(newUser,password);
    console.log(registredUser);
    //to make auto login just after signup
        req.login(registredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","User was registered Successfully");
            res.redirect("/listings");
        })

    
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}

module.exports.RenderloginForm=(req,res)=>{
    res.render("users/login.ejs")
}

module.exports.postLoginInfo=async(req,res)=>{
        req.flash("success","Welcome to Wanderlust! You are logged in");

        let redirectUrl=res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
}

module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);//calling error handling middleware
        }
        req.flash("success","You are logged out successfully")
        res.redirect("/listings");
    })
}