import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {api_error} from "../utils/api_error.js"
import {api_response} from "../utils/api_response.js"
import {async_handler} from "../utils/async_handler.js"
import * as geminiAi_model from "../utils/geminiAi_model.js"
import { Subscription } from "../models/subscription.models.js"


const create_tweet = async_handler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    const owner = req.user?._id

    if(!content){
        throw new api_error(400 , "Tweet's content is required")
    }

    const new_tweet = await Tweet.create({
        content,
        owner,
    })

    const corrected = await geminiAi_model.grammatical_check(content)

    const suggested_corrections = corrected
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines    

    if(!new_tweet){
        throw new api_error(400 , "Cannot create new tweet")
    }

    return res.status(200).json(new api_response(200 ,{ new_tweet , suggested_corrections }, "Tweet Created!"))


})

const get_user_tweets = async_handler(async (req, res) => {
    // TODO: get user tweets
    const current_user = req.user?._id

    const user_tweets = await Tweet.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(current_user)
            }
        }
    ])

    if(!user_tweets){
        throw new api_error(500 , "Unable to fetch current user tweets")
    }

    if(user_tweets.length === 0){
        return res.status(200).json(new api_response(200 , user_tweets , "no tweets by current user"))
    }

        return res.status(200).json(new api_response(200 , user_tweets , "tweets fetched!"))
        
})

//TODO: update tweet
const update_tweet = async_handler(async (req, res) => {
  const { tweet_id } = req.params  
  const { new_content } = req.body

  if(!isValidObjectId(tweet_id)){
    throw new api_error(400 , "invalid tweet id format")
  }

  const tweet = await Tweet.findById(tweet_id)

  if(!tweet){
    throw new api_error(500 , "cant fetch tweet")
  }

  tweet.content = new_content
  const updated_tweet = await tweet.save({validateBeforeSave : false})
  
  const corrected = await geminiAi_model.grammatical_check(new_content)

  const suggested_corrections = corrected
  .split("\n") // Split the string into lines
  .filter(line => line.trim() !== "") // Remove empty lines


  return res.status(200).json(new api_response(200 , {updated_tweet, suggested_corrections} , "Tweet updated!"))

})

//TODO: delete tweet
const delete_tweet = async_handler(async (req, res) => {
    const { tweet_id } = req.params  

    if(!isValidObjectId(tweet_id)){
        throw new api_error(400 , "invalid tweet id format")
      }

    const deleted_tweet = await Tweet.findByIdAndDelete(tweet_id)

    if(!deleted_tweet){
        throw new api_error(500 , "cant delete tweet")
      }

      return res.status(200).json(new api_response(200 , deleted_tweet , "Tweet deleted!"))
})

const tweet_grammatical_check = async_handler(async (req,res) => {
    const  {tweet_id} = req.params
    
    const tweet = await Tweet.findById(tweet_id)

    const tweet_content = tweet.content

    const corrected = await geminiAi_model.grammatical_check(tweet_content)

    const suggested_corrections = corrected
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines

   return res.status(200).json(new api_response(200 , suggested_corrections , "Ai descriptions suggested!"))

})

const get_tweets_homepage = async_handler(async(req,res)=>{
    //finding top 5 most watched and recent videos

    const latest_tweets = await Tweet.aggregate([
        {
            $sort : {
                "createdAt" : -1,
            }
        },
        {
            $limit : 5
        }
    ])

    const tweets_for_homepage = [latest_tweets]

    //fetching videos of subscribed channels
    const subscribed_channels = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    for(let i = 0 ; i < subscribed_channels.length ; i++){
        const channel_id = subscribed_channels[i].channel

        const channel_tweets = await Tweet.aggregate([
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(channel_id)
                }
            },
            {
                $sort : {
                    "createdAt" : -1 
                }
            },
            {
                $limit : 5
            }
        ])

        if(channel_tweets.length !== 0)
            tweets_for_homepage.push(channel_tweets)
    }

    //We can further down add filteration and randomness for selecting videos based on use cases!

    res.status(200).json(new api_response(200 , {tweets_for_homepage} , "Tweets for homepage fetched!"))
})

const get_tweets_based_on_interest = async_handler(async (req,res) => {
    const { interest } = req.query

    console.log(interest)
    const interest_based_tweets_string = await geminiAi_model.interest_based_tweets_suggestions(interest)
    const interest_based_tweets =interest_based_tweets_string 
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines

    return res.status(200).json(new api_response(200 , interest_based_tweets , "Ai interest based tweets fetched!"))
})


export {
    create_tweet,
    get_user_tweets,
    update_tweet,
    delete_tweet,
    tweet_grammatical_check,
    get_tweets_homepage, 
    get_tweets_based_on_interest,
}
