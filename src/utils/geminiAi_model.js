import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs'


const genAI = new GoogleGenerativeAI("AIzaSyDFowJrACjcuzMyXf3mRt21WVCWeLSEGpA");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// async function ai_suggested_titles(title) {


    
// }
 
const ai_suggested_titles = async(title) => {
   var fin = title + " <- consider this as a tittle of a video that is going to be uploaded on youtube. Now suggest 5 great alteranatives of this title that user can choose from. I dont want a detailed answer, just 5 titles thats it. No explaintaion needed!. Give heading of Ai suggested tittles"
    

   const prompt = fin
 
   const result = await model.generateContent(prompt);
   const response = await result.response;
   const text = response.text();
   return text
}

const ai_suggested_descriptions = async(description) => {
    var fin = description + "\n Consider the above line of this prompt as a desciption of a video. This is only what we have and can't provide any futher info.Only Use this to Suggest 5 alternatives that I can use instead of this. I want you to write the description completly by yourself!. Give the heading to your anser `Ai suggested descriptions` "
     
    console.log(fin)
 
    const prompt = fin
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text
 }

 const grammatical_check = async(content) => {
    var fin = content + "\n Consider the above line of this prompt as a content of tweet. This is only what we have and can't provide any futher info . Check this content only for grammatical mistakes and if found any then provide a corrected version else just say that its grammatically perfect "
     
    console.log(fin)
 
    const prompt = fin
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text
 }
 

const thumbnail_to_title_suggestions = async(local_file_path)=>{
   const prompt = "Consider the given image as thumnail of a video, considering this suggest 5 appropriate titles for this video";
   const image = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(local_file_path)).toString("base64"),
        mimeType: "image/jpeg",
      },
    };
const result = await model.generateContent([prompt,image]);
const response = await result.response;
const text = response.text();
return text

}

const title_to_keywords = async(title) => {
   var fin = title + " <- consider this as a tittle of a video that is going to be uploaded on youtube. Now suggest some keywords that user can use in description to rank this video. I dont want a detailed answer, just few keywords thats it. No explaintaion needed!. Give heading of Ai suggested keywords"
    

   const prompt = fin
 
   const result = await model.generateContent(prompt);
   const response = await result.response;
   const text = response.text();
   return text
}

const interest_based_tweets_suggestions = async(interest) => {
   var fin ="This user has interest = " + interest + "\n Consider this as an interest of a user. Suggest 5 tweets to this user based on his interest. These tweets can be on recent events, news, or just in general regarding the given interest. You have to generate a full tweet that user can directly post. dont expect anything from him. Give atleast 1 tweet from recent events related to the interest"
   

   const prompt = fin
 
   const result = await model.generateContent(prompt);
   const response = await result.response;
   const text = response.text();
   return text   
}


export {
    ai_suggested_titles,
    ai_suggested_descriptions,
    grammatical_check,
    thumbnail_to_title_suggestions,
    title_to_keywords,
    interest_based_tweets_suggestions
   }