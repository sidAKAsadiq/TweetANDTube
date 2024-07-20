import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import { api_error } from "../utils/api_error.js"
import { api_response } from "../utils/api_response.js"
import { async_handler } from "../utils/async_handler.js"
import { upload_to_cloundiary } from "../utils/cloudinary.js"



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
})

    if(!video){
        throw new api_error(500,  "cannot add video to db")
    }

    return res.status(200).json(new api_response(400 , video , "Video published and added to db successfully!"))

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

export {
    get_all_videos,
    publish_video,
    get_video_by_id,
    update_video_info,
    delete_video,
    toggle_publish_status
}