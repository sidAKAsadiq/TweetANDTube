import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose from "mongoose";

const subscription_schema = new mongoose.Schema({
   //I think subscribers ka array hona chahiyey
    subscriber : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    channel : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },    
} , {timestamps : true})

subscription_schema.plugin(mongooseAggregatePaginate)


export const Subscription = mongoose.model("Subscription" , subscription_schema)