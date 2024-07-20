import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app =  express()
//const limit = "14kb"


app.use(cors({
    origin: process.env.CORS_ORIGIN, //for now, allowing from all sources
    credentials: true,
}))

app.use(express.json({limit : "16kb"})) //accept json data (forms)  
app.use(express.urlencoded({extended: true , limit: "16kb"})) //accept from URLs
app.use(express.static("public")) //To store images, pdf etc
app.use(cookieParser()) //to be able to access and set user's browser cookies





//Working with routes - Import & declare
import user_router from './routes/user.routes.js'
import video_router from './routes/video.routes.js'
import subscription_router from './routes/subscription.routes.js'

app.use('/api/v1/users' , user_router)
app.use('/api/v1/videos' , video_router)
app.use('/api/v1/subscriptions', subscription_router)



export { app }