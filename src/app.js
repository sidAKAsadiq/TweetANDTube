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
import playlist_router from './routes/playlist.routes.js'
import tweet_router from './routes/tweet.routes.js'
import comment_router from './routes/comment.routes.js'
import like_router from './routes/like.routes.js'
import health_check_router from './routes/health_check.routes.js'
import dashboard_router from './routes/dashboard.routes.js'


app.use('/api/v1/users' , user_router)
app.use('/api/v1/videos' , video_router)
app.use('/api/v1/subscriptions', subscription_router)
app.use('/api/v1/playlists', playlist_router)
app.use('/api/v1/tweets', tweet_router)
app.use('/api/v1/comments', comment_router)
app.use('/api/v1/likes', like_router)
app.use('/api/v1/health_check', health_check_router)
app.use('/api/v1/dashboard', dashboard_router)



export { app }