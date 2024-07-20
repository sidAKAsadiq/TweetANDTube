import mongoose, {isValidObjectId} from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { api_error } from "../utils/api_error.js"
import { api_response } from "../utils/api_response.js"
import { async_handler } from "../utils/async_handler.js"


// TODO: toggle subscription
const toggle_subscription = async_handler(async (req, res) => {
    const { channel_id } = req.params
    const subscriber_id = req.user._id
    
    const check_subscriber = await Subscription.aggregate([{
        $match : {
            $and :[{
                subscriber : new mongoose.Types.ObjectId(subscriber_id)
            } , {
                channel : new mongoose.Types.ObjectId(channel_id)
            }]
        }
    }])

    console.log("Check subs  :" , check_subscriber)

    if(check_subscriber.length === 0){
        //not a subscribed user - create a new document
        const new_doc =  await Subscription.create({
            subscriber : subscriber_id,
            channel : channel_id,
        }
        )

        if(!new_doc){
            throw new api_error(400 , "Cannot create subsciption doc")
        }

        return res.status(200).json(new api_response(200 , new_doc , "New doc subs created successfully!"))

    }
    else{
        //subscriber user - delete the document from db
        const deleted_doc = await Subscription.findByIdAndDelete(check_subscriber[0]._id)
        if(!deleted_doc){
            throw new api_error(400 , "Cannot delete subscription doc")
        }
        return res.status(200).json(new api_response(200 , deleted_doc , "Doc deleted successfully"))
    }
})

// controller to return subscriber list of a channel
const get_user_channel_subscribers = async_handler(async (req, res) => {
    const {channel_id} = req.params

    const subscriber_list = await Subscription.aggregate([
    {
        $match : {
            channel : new mongoose.Types.ObjectId(channel_id)
        }
    },
    {
        $lookup : {
            from : "users",
            localField : "subscriber",
            foreignField : "_id",
            as : "user_subscriber_objs",
            pipeline : [
            {
                $project : {
                    _id : 1,
                    username : 1,
                }
            },
             ]
        }                   //JUST EXPLORING WAYS OF SENDIG DATA TO FE, ALL METHODS ARE CORRECT
    },
    {
        $project : {
            user_subscriber_objs : 1
        }
    }
    // {
    //     $addFields : {
    //         user_subscriber_obj : {
    //             $first : "$user_subscriber_objs"
    //         }
    //     }
    // },
    // {
    //     $project : {
    //         "user_subscriber_obj._id": 1,
    //         "user_subscriber_obj.username": 1
    //     }
    // }





])

    if(subscriber_list.length === 0){
        return res.status(200).json(new api_response(200 , "" , "No subscribers of this channel"))
    }

    return res.status(200).json(new api_response(200 , subscriber_list , "Subscribers fetched successfull! " ))


})

// controller to return channel list to which user has subscribed
const get_subscribed_channels = async_handler(async (req, res) => {
    const { subscriber_id } = req.params

    const channel_list = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(subscriber_id)
            }
        },
        {
            $lookup: {
                from : "users" , 
                localField : "channel",
                foreignField : "_id",
                as : "channel_list",
                pipeline : [{
                    $project : {
                        _id : 1,
                        username: 1,
                    }
                }]
            }
        },
    {
        $addFields : {
            channel_list : {
                $first : "$channel_list"
            }
        }
    },
    {
        $project: {
            channel_list : 1
        }
    }
    ])

        if(!channel_list){
            return res.status(200).json(new api_response(200,"" , "No subscribed channels yet"))
        }

            return res.status(200).json(new api_response(200, channel_list , "subscribed channels fetched!"))

})

export {
    toggle_subscription,
    get_user_channel_subscribers,
    get_subscribed_channels
}