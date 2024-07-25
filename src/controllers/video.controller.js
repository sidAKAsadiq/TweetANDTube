import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { api_error } from "../utils/api_error.js"
import { api_response } from "../utils/api_response.js"
import { async_handler } from "../utils/async_handler.js"
import { upload_to_cloundiary } from "../utils/cloudinary.js"
import * as geminiAi_model from "../utils/geminiAi_model.js"



//TODO: get all videos based on query, sort, pagination
const get_all_videos = async_handler(async (req, res) => {
    const { page = 1 , limit = 10, query, sort_by = "date", sort_type = "asc", user_id } = req.query

    //cuz req.query say string may ayega jo bhi ayega
    const page_int = parseInt(page , 10)
    const limit_int = parseInt(limit , 10)

    console.log("page : " , typeof(page) , page)
    console.log("limit : " , typeof(limit) , limit)
    console.log("query : " , typeof(query) , query)
    console.log("sort_by : " , typeof(sort_by) , sort_by)
    console.log("sort_type : " , typeof(sort_type) , sort_type)
    console.log("user_id : " , typeof(user_id) , user_id)
    console.log("page_int : " , typeof(page_int) , page_int)
    console.log("limit_int : " , typeof(limit_int) , limit_int)


    const skip_value = (page_int - 1) * limit_int


    let sort_type_num;
    if(sort_type === 'desc'){
        sort_type_num = -1
    }
    else{
        sort_type_num = 1
    }

    

    const search_results = await Video.aggregate([
    {
        $match : {
            $or : [{
                title : {$regex : query , $options : 'i'}
            } , {
                description : {$regex : query , $options : 'i'}
            }]
        }
    },
    {
        $sort : {
            [sort_by] : sort_type_num
        }
    },
    {
        $skip: skip_value
    },
    {
        $limit : limit_int
    }
])

    console.log(search_results)

    if(!search_results){
        throw new api_error(500 , "Cant fetch search results in get all videos")
    }

    return res.status(200).json(new api_response(200 , search_results , "Search results fetched sucessfully!" ))


})


// TODO: get video, upload to cloudinary, create video
const publish_video = async_handler(async (req, res) => {
    const { title, description} = req.body


    console.log("cureent user : ", req.user)
    

    if(title.trim() === "" || description.trim() === ""){
        throw new api_error(400 , "Title or description is required!")
    }

    const thumbnail_local_path = req.files?.thumbnail[0].path
    const video_file_local_path = req.files?.video_file[0].path


    if(!thumbnail_local_path){
        throw new api_error(400 , "Thumbnail local path doesnt exsist!")
    }
    if(!video_file_local_path){
        throw new api_error(400 , "video local path doesnt exsist!")
    }

    const title_suggestions_string = await geminiAi_model.thumbnail_to_title_suggestions(thumbnail_local_path)
    const title_suggestions = title_suggestions_string
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines

    const suggested_keywords_string = await geminiAi_model.title_to_keywords(title)
    const suggested_keywords  = suggested_keywords_string
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines
    

    const upload_thumbnail_to_cloud = await upload_to_cloundiary(thumbnail_local_path)
    const upload_video_to_cloud = await upload_to_cloundiary(video_file_local_path)


    if(!upload_thumbnail_to_cloud){
        throw new api_error(500 , "Sorry we cant upload thumbnail ")
    }
    if(!upload_video_to_cloud){
        throw new api_error(500 , "Sorry we cant upload video ")
    }

    const video = await Video.create({
        video_file : upload_video_to_cloud.url,
        thumbnail : upload_thumbnail_to_cloud.url,  
        title,
        description,
        duration : upload_video_to_cloud.duration,
        is_published : true,
        owner : req.user._id,        
        views : 0  
})

    if(!video){
        throw new api_error(500,  "cannot add video to db")
    }

    

    return res.status(200).json(new api_response(400 , {video,title_suggestions,suggested_keywords} , "Video published and added to db successfully!"))

})

//TODO: get video by id
const get_video_by_id = async_handler(async (req, res) => {
    const { video_id } = req.params

    console.log(video_id)

    if(!video_id){
        throw new api_error(400 , "Cant fetch video id from url")
    }

    const video  = await Video.findById(video_id)

    if(!video){
        throw new api_error(400 , "No such video exisit!")
    }

    return res.status(200).json(new api_response(200 , video , "Video got successfully!"))


})

//TODO: update video details like title, description, thumbnail
const update_video_info = async_handler(async (req, res) => {
    const { video_id } = req.params
    const {title , description} = req.body
   
    if(!video_id){
        throw new api_error(400 , "Cant fetch video id from url")
    }
    if(title.trim() === "" || description.trim() === ""){
        throw new api_error(400 , "Title or description is required!")
    }

    // const video = await Video.findById(video_id)
    // video.title = title
    // video.description = description

    //better way
    const video = await Video.findByIdAndUpdate(video_id , {
        $set : {
            title : title,
            description : description,
        }
    } , {new : true})

    return res.status(200).json(new api_response(200 , video , "Video info updated successfully!"))

})

//TODO: delete video
const delete_video = async_handler(async (req, res) => {
    const { video_id } = req.params
   
    if(!video_id){
        throw new api_error(400 , "Cant fetch video id from url")
    }

    const deleted_video = await Video.findByIdAndDelete(video_id)

    return res.status(200).json(new api_response(200 , deleted_video , "Video deleted successfully!"))



})

const toggle_publish_status = async_handler(async (req, res) => {
    const { video_id } = req.params

    if(!video_id){
        throw new api_error(400 , "Cant fetch video id from url")
    }

    const video = await Video.findById(video_id)

    if(video.is_published === true){
        video.is_published = false
    }
    else{
        video.is_published = true
    }
    
    await video.save({validateBeforeSave : false})

    return res.status(200).json(new api_response(400 , video , "Video publish status toggled!"))
})

const get_ai_suggested_titles = async_handler(async (req,res) => {
    const { video_id } = req.params

    const video = await Video.findById(video_id)

    const current_title = video.title

    const suggested_titles_string = await geminiAi_model.ai_suggested_titles(current_title)
    console.log(suggested_titles_string)

    const suggested_titles = suggested_titles_string
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines

   return res.status(200).json(new api_response(200 , {current_title,suggested_titles} , "Ai titles suggested!"))


})

const get_ai_suggested_descriptions = async_handler(async (req,res) => {
    const { video_id } = req.params

    const video = await Video.findById(video_id)

    const current_description = video.description

    const suggested_descriptions_string = await geminiAi_model.ai_suggested_descriptions(current_description)
    console.log(suggested_descriptions_string)

    const suggested_descriptions = suggested_descriptions_string
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines

   return res.status(200).json(new api_response(200 , {current_description,suggested_descriptions} , "Ai descriptions suggested!"))


})


const get_videos_homepage = async_handler(async(req,res)=>{
    //finding top 5 most watched and recent videos

    const trending_videos = await Video.aggregate([
        {
            $sort : {
                "createdAt" : -1,
                "views" : -1
            }
        },
        {
            $limit : 5
        }
    ])

    const videos_for_homepage = [trending_videos]

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

        const channel_videos = await Video.aggregate([
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

        if(channel_videos.length !== 0)
        videos_for_homepage.push(channel_videos)
    }

    //We can further down add filteration and randomness for selecting videos based on use cases!

    res.status(200).json(new api_response(200 , {videos_for_homepage} , "Videos for homepage fetched!"))
})

//can be incorporated into get_video_by_id()
const view_and_add_to_watch_history = async_handler(async(req,res) => {
    const {video_id} = req.params
    const user_id = req.user._id
    console.log(video_id)
    console.log(user_id)

    const user = await User.findById(user_id)
    const video = await Video.findById(video_id)


    if(!user.watch_history.includes(video_id)){
        user.watch_history.push(video_id)
        video.views++
        video.save({validateBeforeSave : false})
    }   
    
    user.save({validateBeforeSave : false})


    const user_history = user.watch_history
    
    return res.status(200).json(new api_response(200 , {video,user_history} , "Video viewed and added to history"))



})


export {
    get_all_videos,
    publish_video,
    get_video_by_id,
    update_video_info,
    delete_video,
    toggle_publish_status,
    get_ai_suggested_titles,
    get_ai_suggested_descriptions,
    get_videos_homepage,
    view_and_add_to_watch_history,
}