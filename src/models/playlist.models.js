import mongoose from "mongoose";

const playlist_schema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    videos : [{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Video",
        required : true,
    }],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
} , {timestamps : true})


export const Playlist = mongoose.model("Playlist" , playlist_schema)