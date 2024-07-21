import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {api_error} from "../utils/api_error.js"
import {api_response} from "../utils/api_response.js"
import {async_handler} from "../utils/async_handler.js"

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

    if(!new_tweet){
        throw new api_error(400 , "Cannot create new tweet")
    }

    return res.status(200).json(new api_response(200 , new_tweet , "Tweet Created!"))


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

  return res.status(200).json(new api_response(200 , updated_tweet , "Tweet updated!"))

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

export {
    create_tweet,
    get_user_tweets,
    update_tweet,
    delete_tweet
}