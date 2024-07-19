import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {    
        const connection_instance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`/n DB connected, HOST : ${connection_instance.connection.host}`)

    } catch (error) {
        console.log("DB connection error" , error)
        process.exit(1)
        //throw error
        
    }
}

export default connectDB 