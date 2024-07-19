import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
   path: './.env' 
})

connectDB()
.then(() => {
    //Checking if any error before staritng app
    app.on("error", (error)=>{
        console.log(`Error starting the app`);
    })
    //staritng app
    app.listen((process.env.PORT || 8000), () => {
        console.log(`App running on Port ${process.env.PORT}`);
    })

})
.catch((error) => {
    //Error handling
    console.log("Error connecting Database " , error);
})



/*
import express from  'express';
const app = express()
;(async () => {
    try {

        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error" , (error) => {
            console.log("Error while connecting app to database")
            throw error
        })
        
        app.listen(process.env.PORT , ()=> {
            console.log(`Listening on port ${process.env.PORT}`)
        } )

    } catch (error) {
        console.log(error)
        throw error
    }
})()
*/ 