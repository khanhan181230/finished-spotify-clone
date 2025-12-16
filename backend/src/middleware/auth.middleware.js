import {clerkClient} from '@clerk/express';

//Use to check if user is authenticated or not to perfom certain actions on other routes, then call the next functions.
export const protectRoute = async (req, res, next) => {
    if (!req.auth.userId){
        //user is not authenticated
        return res.status(401).json({success:false, message: "Unauthorized - you must be logged in to access this resource"});
    }
    next(); //whatever is after this middleware will be executed
};


//Use to check if user is admin or not to perform certain admin-only actions on other routes, then call the next functions.
export const requireAdmin = async (req, res, next) => {
    try {
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress.emailAddress;
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Forbidden - you do not have permission to access this resource" });
        }
        next(); //user is admin, proceed to the next middleware/controller
    } catch (error) {
        next(error);
    }
};