import mongoose from "mongoose";
import { Tweet } from "./tweet.models";

const like_schema = new mongoose.Schema({
    comment : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Comment",
    },
    video : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video",
    },
    liked_by : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    tweet : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Tweet"
    }
} , {timestamps : true})


export const Like = mongoose.model("Like" , like_schema)
 