import { Like } from "../models/like.models.js";
import mongoose from "mongoose";
import { api_error } from "../utils/api_error.js";
import { api_response } from "../utils/api_response.js";
import { async_handler } from "../utils/async_handler.js";


//TODO: toggle like on video
const toggle_video_like = async_handler(async (req, res) => {
    const { video_id } = req.params
    const  user_id  = req.user._id


    const check_existence = await Like.aggregate([
        {
            $match : {
                $and : [
                    { video : new mongoose.Types.ObjectId (video_id)} , { liked_by : new mongoose.Types.ObjectId(user_id) }
                ]
            }
        }
    ])


    if(!check_existence){
        throw new api_error(500 , "Unable to fetch like docs")
    }

    if(check_existence.length === 0){
        //create a new doc
        const new_doc = await Like.create({
            liked_by : user_id,
            video : video_id
        })
        if(!new_doc){
            throw new api_error(500 , "Unable to create new doc")
        }
        return res.status(200).json(new api_response(200 , new_doc , "video liked!"))
    }
    else{
        //delete existing doc
        const like_id = check_existence[0]._id
        const deleting_doc = await Like.findByIdAndDelete(like_id)
        if(!deleting_doc){
            throw new api_error(500 , "Unable to delete doc")
        }        
        return res.status(200).json(new api_response(200 , deleting_doc , "video like deleted!"))


    }



})

//TODO: toggle like on comment
const toggle_comment_like = async_handler(async (req, res) => {
    const { comment_id } = req.params
    const  user_id  = req.user._id


    const check_existence = await Like.aggregate([
        {
            $match : {
                $and : [
                    { comment : new mongoose.Types.ObjectId(comment_id)} , { liked_by : new mongoose.Types.ObjectId(user_id) }
                ]
            }
        }
    ])


    if(!check_existence){
        throw new api_error(500 , "Unable to fetch like docs")
    }

    if(check_existence.length === 0){
        //create a new doc
        const new_doc = await Like.create({
            liked_by : user_id,
            comment : comment_id,
        })
        if(!new_doc){
            throw new api_error(500 , "Unable to create new doc")
        }
        return res.status(200).json(new api_response(200 , new_doc , "comment liked!"))
    }
    else{
        //delete existing doc
        const like_id = check_existence[0]._id
        const deleting_doc = await Like.findByIdAndDelete(like_id)
        if(!deleting_doc){
            throw new api_error(500 , "Unable to delete doc")
        }        
        return res.status(200).json(new api_response(200 , deleting_doc , "comment like deleted!"))


    }
})

//TODO: toggle like on tweet
const toggle_tweet_like = async_handler(async (req, res) => {
    const {tweet_id} = req.params
    const  user_id  = req.user._id


    const check_existence = await Like.aggregate([
        {
            $match : {
                $and : [
                    { tweet : new mongoose.Types.ObjectId(tweet_id)} , { liked_by : new mongoose.Types.ObjectId(user_id) }
                ]
            }
        }
    ])


    if(!check_existence){
        throw new api_error(500 , "Unable to fetch like docs")
    }

    if(check_existence.length === 0){
        //create a new doc
        const new_doc = await Like.create({
            liked_by : user_id,
            tweet : tweet_id,
        })
        if(!new_doc){
            throw new api_error(500 , "Unable to create new doc")
        }
        return res.status(200).json(new api_response(200 , new_doc , "tweet liked!"))
    }
    else{
        //delete existing doc
        const like_id = check_existence[0]._id
        const deleting_doc = await Like.findByIdAndDelete(like_id)
        if(!deleting_doc){
            throw new api_error(500 , "Unable to delete doc")
        }        
        return res.status(200).json(new api_response(200 , deleting_doc , "tweet like deleted!"))


    }

}
)

//TODO: get all liked videos
const get_liked_videos = async_handler(async (req, res) => {
    const user_id = req.user?._id

    const liked_videos = await Like.aggregate([
        {
            $match : {
                $and : [{comment : undefined , tweet : undefined , liked_by : new mongoose.Types.ObjectId(user_id)}]
            }
        }
    ])

    if(!liked_videos){
        throw new api_error(500 , "Unable to fetch liked videos")
    }

    if(liked_videos.length === 0){
        return res.status(200).json(new api_response(200 , liked_videos , "no liked videos"))
    }

         return res.status(200).json(new api_response(200 , liked_videos , "liked videos fetched"))

})

const get_liked_comments = async_handler(async (req, res) => {
    const user_id = req.user?._id

    const liked_comments = await Like.aggregate([
        {
            $match : {
                $and : [{video : undefined , tweet : undefined , liked_by : new mongoose.Types.ObjectId(user_id)}]
            }
        }
    ])

    if(!liked_comments){
        throw new api_error(500 , "Unable to fetch liked comments")
    }

    if(liked_comments.length === 0){
        return res.status(200).json(new api_response(200 , liked_comments , "no liked comments"))
    }

         return res.status(200).json(new api_response(200 , liked_comments , "liked comments fetched"))
})


const get_liked_tweets = async_handler(async (req, res) => {
    const user_id = req.user?._id

    const liked_tweets = await Like.aggregate([
        {
            $match : {
                $and : [{comment : undefined , video : undefined , liked_by : new mongoose.Types.ObjectId(user_id)}]
            }
        }
    ])

    if(!liked_tweets){
        throw new api_error(500 , "Unable to fetch liked tweets")
    }

    if(liked_tweets.length === 0){
        return res.status(200).json(new api_response(200 , liked_tweets , "no liked tweets"))
    }

         return res.status(200).json(new api_response(200 , liked_tweets , "liked tweets fetched"))

})



export {
    toggle_comment_like,
    toggle_tweet_like,
    toggle_video_like,
    get_liked_videos,
    get_liked_comments,
    get_liked_tweets,
}