import { isValidObjectId, mongo } from "mongoose"
import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { api_error } from "../utils/api_error.js"
import { api_response } from "../utils/api_response.js"
import { async_handler } from "../utils/async_handler.js"


const add_comment_tweet = async_handler(async (req, res) => {
    // TODO: add a comment 
    const { tweet_id } = req.params
    const { user_id } = req.user?._id
    const { content } = req.body

    const new_tweet_comment = await Comment.create({
        owner : user_id,
        tweet : tweet_id,
        content,
    })

    if(!new_tweet_comment){
        throw new api_error(500 , "unable to comment")
    }

    return res.status(200).json(new api_response(200 , new_tweet_comment , "commented"))
    

})


//TODO: get all comments for a video
const get_video_comments = async_handler(async (req, res) => {
    const {video_id} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(video_id)){
        throw new api_error(400 , "Invalid video format id")
    }

    const page_int = parseInt(page , 10)
    const limit_int = parseInt(limit , 10)

    const skip_value = (page_int - 1) * limit_int

    const video_comments = await Comment.aggregate([
        {
            $match : {
                video : new mongoose.Types.ObjectId(video_id)
            }
        },
        {
            $skip : skip_value
        },
        {
            $limit: limit_int
        }
    ])

    if(!video_comments){
        throw new api_error(500 , "we cant fetch comments")
    }
    if(video_comments.length === 0){
        return res.status(200).json(new api_response(200 , video_comments , "No comments on this video"))
    }

    return res.status(200).json(new api_response(200 , video_comments , "comments fetched"))


})

//TODO: get all comments for a video - My own func as I want commenting on tweets too
const get_tweet_comments = async_handler(async (req, res) => {
    const {tweet_id} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(tweet_id)){
        throw new api_error(400 , "Invalid video format id")
    }

    const page_int = parseInt(page , 10)
    const limit_int = parseInt(limit , 10)

    const skip_value = (page_int - 1) * limit_int

    const tweet_comments = await Comment.aggregate([
        {
            $match : {
                tweet : new mongoose.Types.ObjectId(tweet_id)
            }
        },
        {
            $skip : skip_value
        },
        {
            $limit: limit_int
        }
    ])

    if(!tweet_comments){
        throw new api_error(500 , "we cant fetch comments")
    }
    if(tweet_comments.length === 0){
        return res.status(200).json(new api_response(200 , tweet_comments , "No comments on this tweet"))
    }

    return res.status(200).json(new api_response(200 , tweet_comments , "comments fetched"))

})


const add_comment_video = async_handler(async (req, res) => {
    // TODO: add a comment
    const { video_id } = req.params
    const { user_id } = req.user?._id
    const { content } = req.body

    const new_video_comment = await Comment.create({
        owner : user_id,
        video : video_id,
        content,
    })

    if(!new_video_comment){
        throw new api_error(500 , "unable to comment")
    }

    return res.status(200).json(new api_response(200 , new_video_comment , "commented"))



})

const edit_comment = async_handler(async (req, res) => {
    // TODO: edit a comment
    const { comment_id } = req.params
    const { content } = req.body

    if(content.trim() === ""){
        throw new api_error(400 , "content is required")
    }

    const updated_comment = await Comment.findByIdAndUpdate(comment_id , {
        content,
    })

    if(!updated_comment){
        throw new api_error(500 , "unable to update comment")
    }

    return res.status(200).json(new api_response(200 , updated_comment , "comment updated"))

})





const delete_comment = async_handler(async (req, res) => {
    // TODO: delete a comment
    const { comment_id } = req.params

    const deleted_comment = await Comment.findByIdAndDelete(comment_id)

    if(!deleted_comment){
        throw new api_error(500 , "unable to delete comment")
    }

    return res.status(200).json(new api_response(200 , deleted_comment , "comment deleted"))



})

//single func for edit is enough
// const edit_comment_tweet = async_handler(async (req, res) => {
//     // TODO: edit a comment
// })



//single func for del is enough
// const delete_comment_tweet = async_handler(async (req, res) => {
//     // TODO: delete a comment
// })


export {
    get_video_comments, 
    get_tweet_comments,
    add_comment_video, 
    add_comment_tweet, 
    edit_comment,
    delete_comment,
    }