import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const comment_schema = new mongoose.Schema({
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    content : {
        type : String,
        required : true,
    },
    video : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video",
    },
    //adding myself
    tweet : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Tweet",
    }
} , {timestamps : true})


//maybe for loading on different pages or for writing aggregation pipelines or show selected videos
comment_schema.plugin(mongooseAggregatePaginate)


export const Comment = mongoose.model("Comment" , comment_schema)