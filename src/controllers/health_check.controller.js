import { api_error } from "../utils/api_error.js"
import { api_response } from "../utils/api_response.js"
import { async_handler } from "../utils/async_handler.js"





//TODO: build a healthcheck response that simply returns the OK status as json with a message
const health_check = async_handler(async (req, res) => {
    return res.status(200).json(new api_response(200 , "" , "Server is up and running - OK!"))
})

export {
    health_check
    }
    