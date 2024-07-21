import mongoose, {isValidObjectId} from "mongoose";
import { api_error } from "../utils/api_error.js";
import { api_response } from "../utils/api_response.js";
import { async_handler } from "../utils/async_handler.js";
import { Playlist } from "../models/playlist.models.js";


//TODO: create playlist
const create_playlist = async_handler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new api_error(400 , "Name and description is required")
    }

    const new_playlist = await Playlist.create({
        name,
        description,
        owner : req.user._id
    })

    if(!new_playlist){
        throw new api_error(500 , "Cannot create new playlist")
    }

    return res.status(200).json(new api_response(200 , new_playlist , "New playlist created!"))
    
})



//TODO: get user playlists
const get_user_playlists = async_handler(async (req, res) => {
    const {user_id} = req.params

    if(!isValidObjectId(user_id)){
        throw new api_error(400 , "The user id is invalid!")
    }

    const user_playlists = await Playlist.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(user_id)
            }
        },
        {
            $project : {
                _id : 1,
                name : 1,
                description: 1,
            }
        }
    ])

    if(!user_playlists){
        throw new api_error(500 , "Cannot fetch user playlists! ")
    }

    if(user_playlists.length === 0){
        return res.status(200).json(new api_response(200 , "" ,"User doesnt have any playlists yet"))
    }
    
    return res.status(200).json(new api_response(200 , user_playlists ,"User playlists fetched!"))



})




//TODO: get playlist by id
const get_playlist_by_id = async_handler(async (req, res) => {
    const {playlist_id} = req.params

    console.log(playlist_id)

    if(!isValidObjectId(playlist_id)){
        throw new api_error(400 , "Invalid playlist id")
    }

    //const playlist = await Playlist.findById(playlist_id)

    const playlist = await Playlist.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(playlist_id)
            }
        },
        {
            $lookup: {
                from : "videos",
                localField : "videos",
                foreignField: "_id",
                as : "videos",
            }
        }
    ])



    if(playlist.length === 0){
        throw new api_error(400 , "Cannot get playlist by id")
    }

    return res.status(200).json(new api_response(200 , playlist , "Playlist by id fetched!" ))

})

const add_video_to_playlist = async_handler(async (req, res) => {
    const {playlist_id, video_id} = req.params

    console.log(playlist_id);
    console.log(video_id);
    console.log(!isValidObjectId(playlist_id))
    console.log(!isValidObjectId(video_id))


    if(!isValidObjectId(playlist_id) || !isValidObjectId(video_id)){
        throw new api_error(400 , "Invalid playlist or video id")
    }



    const playlist = await Playlist.findById(playlist_id)

    console.log(playlist)

    if(playlist.videos.includes(video_id)){
        return res.status(200).json(new api_response(200 , playlist , "video is already in playlist" ))
    }
    
    playlist.videos.push(video_id)

    const fin_playlist = await playlist.save({validateBeforeSave : false})

    return res.status(200).json(new api_response(200 , fin_playlist , "video added to playlist" ))
    

})

// TODO: remove video from playlist
const remove_video_from_playlist = async_handler(async (req, res) => {
    const {playlist_id, video_id} = req.params

    if(!isValidObjectId(playlist_id)){
        throw new api_error(400 , "Invalid playlist id")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlist_id , 
        {
            $pull : {        //To delete video id from video array
                videos : video_id   
            }
        },
        {
            new : true
        }
    )

    if(!playlist){
        throw new api_error(400 , "Error occurred while deleting video from playlist")
    }

    return res.status(200).json(new api_response(200 , playlist , "Video removed from playlist"))



})

// TODO: delete playlist
const delete_playlist = async_handler(async (req, res) => {
    const {playlist_id} = req.params

    console.log(playlist_id)


    if(!isValidObjectId(playlist_id)){
        throw new api_error(400 , "Invalid playlist id")
    }

    const deleted_playlist = await Playlist.findByIdAndDelete(playlist_id)

    if(!deleted_playlist){  
        throw new api_error(500 , "Unable to delete playlist")
    }

    return res.status(200).json(new api_response(200 , deleted_playlist , "Playlist deleted successfully!"))


})

//TODO: update playlist
const update_playlist = async_handler(async (req, res) => {
    const {playlist_id} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlist_id)){
        throw new api_error(400 , "Invalid id format")
    }

    const updated_playlist = await Playlist.findByIdAndUpdate(playlist_id , 
        {
            $set : {
                name,
                description,
            }
        },
        {
            new : true
        }
    )

    if(!updated_playlist){
        throw new api_error(500 , "Unable to update playlist")
    }

    return res.status(200).json(new api_response(200 , updated_playlist , "Playlist updated!"))





})

export {
    create_playlist,
    get_user_playlists,
    get_playlist_by_id,
    add_video_to_playlist,
    remove_video_from_playlist,
    delete_playlist,
    update_playlist
}