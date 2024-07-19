import mongoose, {Schema} from "mongoose";
//importing schmea so we dont have to write mongoose.schmea and just write schema
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const user_schema = new Schema({
    username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },    
    fullname : {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, //cloudnary url
        required: true,
    },
    cover_image: {
        type: String, //cloudnary url
    },
    watch_history: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required!"],
    },
    refresh_token: {
        type: String,

    },    
    
}, {timestamps : true})

//Saving encrypted password to db if modified and just before save() method is called
user_schema.pre("save" , async function (next) {
     if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
        next()
     }
     else{
        return next()
     }
})

//Verification of password
user_schema.methods.check_password = async function (password) {
    console.log("In check password")
    console.log("pass : ", password);
    console.log("this.pass : ", this.password);
    return await bcrypt.compare(password, this.password)
}

    
//Generating access and Refresh tokens

user_schema.methods.generate_access_token = function (){
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
user_schema.methods.generate_refresh_token = function (){
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User" , user_schema)