import { async_handler } from "../utils/async_handler.js";
import { api_error } from "../utils/api_error.js";
import { User } from "../models/user.models.js";
import { upload_to_cloundiary } from "../utils/cloudinary.js";
import { api_response } from "../utils/api_response.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generate_access_and_refresh_tokens = async(user_obj) => {
    try {
        console.log("sup")
        const access_token = user_obj.generate_access_token()
        const refresh_token = user_obj.generate_refresh_token()
        console.log(access_token)
        console.log(refresh_token)
        user_obj.refresh_token = refresh_token
        
        await user_obj.save({validateBeforeSave : false})
        return {access_token , refresh_token}

    } catch (error) {
        console.log(error)
        throw new api_error(500, "Token generation error" )
    }
}



const register_user = async_handler( async (req,res) => {
    //Steps for registering a user
/*
1. Get user data from frontend
2. Validations - we'll only be validating for empty responses & if user already exsisits or not (by checking email and username)
3. Check if images specifically avatar images are uploaded or not
4. Check if multer and cloudinary have successfully uploaded images to local storage and cloud respectively
5. Now create user object and enter in db
6. Check if user has been registered successfully or not, if yes then return response but make sure to remove password and refresh token and if not then return error
*/

//Getting data
const {username , fullname , email , password} = req.body
console.log("Email : " , email);
console.log("pass : " , password);
//You can also use simple syntax of if else - checking for empty responses
if([username , fullname , email , password].some((field) => {return field?.trim() === ""})){
    throw new api_error(400, "Fields are required")
}

//check for if user already exists
//you can only write user.find function in if and it'd work , no need to === null , but i am checking here if it'd work

const does_user_exsist = await User.findOne({
        $or: [{ username } , { email }]
    })

if(does_user_exsist){
    throw new api_error(409, "Username or email is already taken!")
}

console.log(`req.files -> `,req.files)
console.log(`req.body -> `,req.body)

//check for images uploaded or not - for now only avatar
const avatar_path = req.files?.avatar[0]?.path;
//const cover_image_path = req.files?.cover_image[0]?.path;

let cover_image_path;

if(req.files && Array.isArray(req.files.cover_image)){
    cover_image_path = req.files.cover_image[0].path
}



//if no local path is present for avatar means that it has not been uploaded
if(!avatar_path){
    throw new api_error(400 , "Avatar image is required 1!")
}

//upload to cloudinary - time taking
console.log(avatar_path);
const avatar_upload = await upload_to_cloundiary(avatar_path)
const cover_image_upload = await upload_to_cloundiary(cover_image_path)

// console.log(avatar_upload)
// console.log(avatar_upload.url)

//checking if uploaded on cloudinary or not
if (!avatar_upload){
    throw new api_error(400 , "Avatar image is required 2!")    
}

//Registering the user in our database
const new_user = await User.create({
    username : username.toLowerCase(),
    email,
    password,
    fullname,
    avatar : avatar_upload.url,
    cover_image: cover_image_upload?.url || "", //here we checked for cover_image url cuz uper uski koi validation nahi lagai howi hai
})


// think tank - if I just check if(!new_user){} , can we check if user created or not?

const created_user = await User.findById(new_user._id).select("-password -refresh_token")

if(!created_user){
    throw new api_error(500 , "We were unable to register you, try again!")
}

//finally user has been registered and now return the response

return res.status(201).json( new api_response(200 , created_user , "User registed successfully!") )

})




const login_user = async_handler( async (req, res) => {
    //algo
    //take data from fe
    //username or email for login
    //check if corresponding user exsist, check pass, if no user found , tell to register etc
    //if pass entered wrong then tell to retry - or maybe forget pass but not at this point
    //if correct then genereate and send access and refresh token to user - sent in form of secure cookies
    //send succssfull login response

    
    //taking data
    console.log("hi")
    const {username_or_email  , password } = req.body
    console.log(username_or_email)
    console.log(password)

    //checking if username_or_email is empty - just for my own practice
    if(username_or_email.trim() === ""){
        throw new api_error(400, "Bhai khali email ya username dal kar kia karna chahta hai!")
    }

    //my logic - direct check for username or email and its coressponding password if it fulfils the requirements

    // const does_user_exsist = await User.findOne({
    //     $and: [{$or: [{email : username_or_email} , {username : username_or_email}]} , {password}]
    // })

    // if (!does_user_exsist){
    //     throw new api_error(400 , "Invalid credentials!")
    // }


    //checking if user exisits
    const user_exisit_of_username_or_email = await User.findOne({
     $or: [{email: username_or_email} , {username : username_or_email}]
    })

    if(!user_exisit_of_username_or_email){
        throw new api_error(404 , "Incorrect username or email , try again or register yourself first!")
    }

    
    //we cannot check like this because in db we have encrypted password saved
    // if(user_exisit_of_username_or_email.password != password){
    //     throw new api_error(401, "Incorrect password, try again or forget pass")
    // }
    

    //instead we'll check password by custom method that we wrote in user model
    // if(!await user_exisit_of_username_or_email.check_password(password)){
    //     throw new api_error(401, "Incorrect password, try again or forget pass")
    // }
    
    
    
    if (!await user_exisit_of_username_or_email.check_password(password)) {
        throw new api_error(401, "Invalid user credentials")
    }
    
    
    
    const {access_token , refresh_token} = await generate_access_and_refresh_tokens(user_exisit_of_username_or_email)
    
    //xuser_exisit_of_username_or_email.select("-password -refresh_token")
    
    //Removing password and RT
    user_exisit_of_username_or_email.password = undefined
    user_exisit_of_username_or_email.refresh_token = undefined
    
     //sending cookies

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).cookie("access_token" , access_token , options).cookie("refresh_token", refresh_token , options).json(new api_response(200 ,{
        user : user_exisit_of_username_or_email,
        access_token,
        refresh_token}, "Login successfull!"))

})






const logout_user = async_handler(async (req , res) => {
    await User.findByIdAndUpdate(req.user._id , {
        $set: {
            refresh_token: undefined
        }
    },
     {   
            new: true
     }
)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("access_token" , options).clearCookie("refresh_token" , options).json(new api_response(200 , {} , "Logout successfull!"))

})


const refresh_access_token =  async_handler (async (req,res) => {

    //taking refresh token                                 (if someone cmng from mbl app)
    const user_refresh_token  = req.cookies.refresh_token || req.body.refresh_token

    if(!user_refresh_token){
        throw new api_error(400 , "User doesnt have refresh token")
    }


    //fetching the refresh token that we have in our database
    const decoded_token = jwt.verify(user_refresh_token , process.env.REFRESH_TOKEN_SECRET)    

    console.log(decoded_token)
    const user = await User.findById(decoded_token.id)

    if(!user){
        throw new api_error(400 , "No user exisits!")
    }

    const refresh_token_from_db = user.refresh_token

    if(!(refresh_token_from_db === user_refresh_token)){
        throw new api_error(400, "Refresh tokens donot match")
    }

    const {access_token , refresh_token} = await generate_access_and_refresh_tokens(user)


    const options = {
        httpOnly : true,
        secure: true,
    }

    return res.status(200).cookie("access_token",access_token,options).cookie("refresh_token",refresh_token,options).json(new api_response(200 , {} , "New tokens sent!"))
})




const change_password = async_handler (async (req, res) => {

    //  MY OWN LOGIC
    //getting current password 
    const user = req.user

    if(!user){
    throw new api_error(400 , "Error fetching user")
    }

    const current_password = user.password
    console.log("Current pass : " , current_password)
 
    //taking input old and new password
    const {old_password , new_password} = req.body

    console.log("Old pass",old_password)
    console.log("New pass",new_password)

    //cant check like this b/c jo password db say aya hai woh encrypted hai jab kay jo user say input liya hai woh encrpyted nahi
// `    if(current_password !== old_password){
//         throw new api_error(401, "Password doesnt match")
//     }`

        if(!await user.check_password(old_password)){
            throw new api_response(400 , "Password doesnt match")
        }


    //setting new password
    user.password = new_password
    //Db dosry continent may hai
    await user.save({validateBeforeSave : false})

    return res.status(200).json( new api_response(200 , {} , "Password changed successfull!") )

})


const get_current_user = async_handler (async (req, res) => {
    const user = req.user
    return res.status(200).json(new api_response(200 , {user} , "Returning current user successfully!"))
})

const update_info = async_handler(async (req,res) => {
    const {fullname , email} = req.body

    //checking for emptyness
    if(!fullname || !email){
        throw new api_error(400 , "All fields are required!")
    }
    //better method of updating multiple fields together

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set : {
            fullname,
            email : email, //both syntax are correct
        }
    },{new : true}).select("-password")


    //save - better if only 1 field to update like password
    // const user = req.user
    // if(!user){
    //     throw new api_error(400, "Unable to fetch user")
    // }
    // user.fullname = fullname
    // user.email = email
    // await user.save({validateBeforeSave : false})


    return res.status(200).json(new api_response(200 , user , "Info updated successfully!"))
})

const update_avatar = async_handler(async (req,res) => {
                        //not the req.files wala syntax like in register user cuz here we only have single file while there we had 2 different files!
    const avatar_path = req.file?.path
    //took local path 

    //check for local path
    if(!avatar_path){
        throw new api_response(400 , "Avatar image is required!")
    }

    //uploading in cloud
    const avatar_upload = await upload_to_cloundiary(avatar_path)

    if(!avatar_upload.url){
        throw new api_error(500, "Could'nt upload file to cloudinary")
    }

    const user = req.user
    if(!user){
        throw new api_error(400 , "unable to fetch user!")
    }
    //saving in db
    user.avatar = avatar_upload.url
    await user.save({validateBeforeSave : false})


    res.status(200).json(new api_response(200 , user /*avatar_upload*/ , "Avatar updated successfully!"))


})


const update_cover_image = async_handler(async (req, res) => {
    //taking local path
    const cover_image_path = req.file?.path

    //if no file is uploaded , we'll just return but wont give error cuz cover image was not required anyways -> my thought
    if(!cover_image_path){
       return res.status(200).json(new api_response(200 ,{} , "No updation took place"))
    }

    //uploading to cloudinary
    const cover_image_upload = await upload_to_cloundiary(cover_image_path)

    if(!cover_image_upload){
        throw new api_error(500, "Cant update cover image on cloud!")
    }
    //saving
    const user = req.user
    user.cover_image = cover_image_upload.url
   await user.save({validateBeforeSave : false})
    return res.status(200).json(new api_response(200 ,user /*cover_image_upload*/ , "Cover image updated successfully"))


})


const get_channel_profile = async_handler(async (req,res) => {
    
    const {username_of_channel} = req.params

    console.log(username_of_channel)

    if(!username_of_channel?.trim()){
        throw new api_error(400 , "No such channel exisit!")
    }

    //Channel will be an array of objects - returned by Aggregate 
    const channel = await User.aggregate([
    {
        $match : {
            username : username_of_channel //iss may mery pass channel jiska hai uska user model hai na kay uska jo logged in hai
        }
    },  
    {
        $lookup: {
            from : "subscriptions", //iss model may say dekho
            localField: "_id", //user kay db may kis naam say hai
            foreignField: "channel", //subscriptions kay db may kis naam say hai
            as: "subscribers", //resultant array ka kia naam hai
        }
    },
    {
        $lookup: {
            from : "subscriptions", //iss model may say dekho
            localField: "_id", //user kay db may kis naam say hai
            foreignField: "subscriber", //subscriptions kay db may kis naam say hai
            as: "channels_subscibed", //resultant array ka kia naam hai
        }
    },
    {
        $addFields: {
            number_of_subscribers : {
                $size : "$subscribers"
            },
            number_of_subscribed_channels : {
                $size : "$channels_subscibed"
            },
            is_subscriber : {
                $cond : {
                    if: {       //id        , array or object 
                        $in : [req.user?._id , "$subscribers.subscriber"]
                    },
                    then: true,
                    else: false
                 }
            }
        }
    },
    {
        //5th pipeline
        $project: {
             username : 1,
             fullname : 1,
             email : 1,
             avatar : 1,
             cover_image : 1,
             number_of_subscribers : 1,
             number_of_subscribed_channels: 1,
             is_subscriber: 1,
        }
    }
])


console.log(channel)

    if(!channel?.length){
        throw new api_error(404 , "channel not found!")
    }


    return res.status(200).json(new api_response(200 , channel[0] , "Channel details fetched successfully!"))

})


const watch_history = async_handler (async (req,res) => {

    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField: "watch_history",
                foreignField: "_id",
                as: "watch_history",
                pipeline: [ //Sub pipeline
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [ //Sub - Sub pipelime
                                {
                                    $project: {
                                        username: 1,
                                        avatar : 1,
                                    }
                                }
                            ]
                        }
                    },                
                    {
                        $addFields : { //To send object to frontend instead of array - optional step
                           owner :
                           {
                            $first : "$owner"
                           }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new api_response(200 , user[0].watch_history , "Watch history successfully fetched!" ))
    

})


export {register_user,login_user,logout_user,refresh_access_token,change_password,get_current_user,update_info,update_avatar,update_cover_image,get_channel_profile,watch_history}