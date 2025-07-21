const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema; // ✅ Add this
const passportLocalMongoose=require("passport-local-mongoose");


const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    }

});

userSchema.plugin(passportLocalMongoose);//it Automatically adds username,hashing,password,slating to schema
module.exports=mongoose.model("User",userSchema);

