
// export const asyncHandler = (fun)=>async (req, res, next)=>{
//     try {
//         await fun(req, res, next);
//     } catch (error) {
//         res.status(error.code || 400).json({
//             success:false,
//             msg:error.message || "Internal Server Error"
//         })
//     }
// }

const asyncHandler=(fun)=>{
    return (req, res, next)=>{
        Promise.resolve(fun(req, res, next)).catch((error)=>next(error))
    }
}
export {asyncHandler};