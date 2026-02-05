class ApiResponse{
    constructor(statusCode, message="Success", success=false, data){
        this.statusCode=statusCode,
        this.message=message,
        this.data=data,
        this.success=statusCode<400;
    }
}