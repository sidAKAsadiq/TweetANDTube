//Syntax 2 - Promises
//A higher order function - function that accepts another function as an argument
const async_handler = (request_handler) => {
    return (req,res,next) => {
        Promise.resolve(request_handler(req,res,next)).catch((error) => next(error))
    }
}


export {async_handler}



//SYNTAX 1 - Try and catch

// const async_handler = (request_handler) => async (req,res,next) => {
//     try {
//         await request_handler(req,res,next)
//     } catch (error) {
//         res.status(error.code).json({
//             success : false,
//             message : error.message
//         })
//     }
// }