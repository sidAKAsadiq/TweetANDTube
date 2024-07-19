import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const video_schema = new Schema({
    video_file : {
        type: String, //cloudnary url
        required: true,
    },
    thumbnail : {   
        type: String,
        required: true,
    },
    title : {
        type: String,
        required: true,
    },
    description : {
        type: String,
        required: true,
    },  
    duration : {
        type: Number, //Cloudnary gives info about media it gives
        required: true,
    },      
    views: {
        type: Number,
        defualt: 0,
    },
    is_published: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
},{timestamps : true})

//this will allow us to write complex aggregation queries for database
video_schema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video" , video_schema)