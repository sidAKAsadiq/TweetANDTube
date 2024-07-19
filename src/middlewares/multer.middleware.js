import multer from "multer";

//Storing file from client to local storage
const storage = multer.diskStorage({
    destination: function(req,file,cb){
            cb(null, "D:/backend/setting up proff backend" + "/public/temp")
        },
        filename:  function(req,file,cb){
            cb(null, file.originalname)
        }

})

// const upload = multer({storage})

// export {upload}

export const upload = multer({ storage, })