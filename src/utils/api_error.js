class api_error extends Error{
    constructor(
        status_code,
        message = "Something went wrong",
        errors = [],
        stack = "",
    ){
        super(message)
        this.statusCode = status_code
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

export {api_error}