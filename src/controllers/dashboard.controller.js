import { api_error } from "../utils/api_error.js";
import { api_response } from "../utils/api_response.js";
import { async_handler } from "../utils/async_handler.js";
import mongoose from "mongoose";
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { Tweet } from "../models/tweet.models.js";

// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const get_channel_stats = async_handler(async (req, res) => {
    const user_channel_id = req.user?._id
    
    const results = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(user_channel_id)
            }
        },
        {
            $group : {
                _id : null,
                total_views : {$sum : "$views"}
            }
        }
    ])

    const total_subscribers_docs = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(user_channel_id)
            }
        },
    ])

    
    const total_videos_docs = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(user_channel_id)
            }
        },
    ])
    
    const total_tweets_docs = await Tweet.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(user_channel_id)
            }
        },
    ])   



    const total_subscribers = total_subscribers_docs.length
    const total_videos = total_videos_docs.length



    //For calculating total likes recieved by a channel -> this approach might be inefficient
    let total_likes_on_videos = 0;

    for(let i = 0 ; i<total_videos_docs.length ; i++){
        const video_id = total_videos_docs[i]._id
        
        

        const like_docs_of_given_video = await Like.aggregate([
            {
                $match : {
                    video : new mongoose.Types.ObjectId(video_id)
                }
            }
        ])

        total_likes_on_videos += like_docs_of_given_video.length
    }

    let total_likes_on_tweets = 0;

    for(let i = 0 ; i<total_tweets_docs.length ; i++){
        const tweet_id = total_tweets_docs[i]._id
        
        

        const like_docs_of_given_tweet = await Like.aggregate([
            {
                $match : {
                    tweet : new mongoose.Types.ObjectId(tweet_id)
                }
            }
        ])

        total_likes_on_tweets += like_docs_of_given_tweet.length
    }

    results.push(total_subscribers)
    results.push(total_videos)
    results.push(total_likes_on_videos)
    results.push(total_likes_on_tweets)



    return res.status(200).json(new api_response(200 , results , "test"))


})

// TODO: Get all the videos uploaded by the channel
const get_channel_videos = async_handler(async (req, res) => {
    const user_channel_id = req.user?._id

    const channel_videos = await Video.aggregate([
        {
            $match : {
                owner: new mongoose.Types.ObjectId(user_channel_id)
            }
        }
    ])

    if(!channel_videos){
        throw new api_error(500 , "unable to fetch your channel videos")
    }
    if(channel_videos.length === 0){
        return res.status(200).json(new api_response(200 , channel_videos , "No videos uploaded"))
    }

    return res.status(200).json(new api_response(200 , channel_videos , "videos uploaded fetched"))

})

export {
    get_channel_stats, 
    get_channel_videos
    }