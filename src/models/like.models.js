import mongoose from "mongoose";

const like_schema = new mongoose.Schema({
    liked_by : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    comment : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Comment",
    },
    video : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video",
    },
    tweet : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Tweet"
    }
} , {timestamps : true})


export const Like = mongoose.model("Like" , like_schema)
 