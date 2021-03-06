let Course = require('../models/Course'),
    User   = require('../models/User'),
    Comment   = require('../models/Comment'),
    Post   = require('../models/Post');

let middlewareObj ={}
// Check if the user is logged in
middlewareObj.isLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.status(401).json({
        status: 'failed',
        message: 'User not logged in'
    });
};
// Check if the user is Student 
middlewareObj.isStudent = (req,res,next) => {
    if(req.user.type === "Student"){
        return next();
    }
    res.status(401).json({
        status: 'failed',
        message: 'You are not a student'
    });
};

// Check if the user is Instructor 
middlewareObj.isInstructor = (req,res,next) => {
    if(req.user.type === "Instructor" || req.user.type === "Admin"){
        return next();
    }
    res.status(401).json({
        status: 'failed',
        message: 'You are not a Instructor'
    });
};
middlewareObj.isAdmin = (req,res,next) => {
    if(req.user.type === "Admin"){
        return next();
    }
    res.status(401).json({
        status: 'failed',
        message: 'You are not a admin'
    });
};
// Check if the user is enrolled in the course
middlewareObj.isEnrolled = (req,res,next) => {
    found= false;
    if(req.user.type === "Admin"){
        next();
    }else {
        User.findById(req.user.id,(err,user)=>{
            if(err){
                return res.status(401).json({
                    status: 'failed',
                    message: 'user not found'
                });
            }
            user.courses.forEach(course => {
                
                if(course == req.params.id)
                {
                    console.log("Hi");
                    found = true;
                    return next();
                }
            });
            if(!found)
            {
                res.status(400).json({
                status: 'failed',
                isEnrolled: false,
                message: 'You are not enrolled in this course'
            });
            }
        
        });
    }
};

//Check if current user is the publisher of a post
middlewareObj.isOwnedPost = (req,res,next) => {
    found= false;
    Post.findById(req.params.postID,(err,post)=>{
        if(err){
            return res.status(401).json({
                status: 'failed',
                message: 'post not found'
            });
        }
        else
        {
            if(post.publisher == req.user.id)
            {
                found = true;
                return next();
            }
        }
        if(!found)
        {
            res.status(400).json({
            status: 'failed',
            isEnrolled: false,
            message: 'You are not the publisher of this post'
           });
        }
    });
};

//Check if current user is the publisher of a comment
middlewareObj.isOwnedComment = (req,res,next) => {
    found= false;
    console.log(req.params.commentID);
    Comment.findById(req.params.commentID,(err,comment)=>{
        if(err){
            return res.status(401).json({
                status: 'failed',
                message: 'comment not found'
            });
        }
        else
        {
            console.log(comment);
            console.log(req.user.id);
            if(comment.publisher == req.user.id)
            {
                found = true;
                return next();
            }
        }
        if(!found)
        {
            res.status(400).json({
            status: 'failed',
            isEnrolled: false,
            message: 'You are not the publisher of this comment'
           });
        }
    });
};
module.exports = middlewareObj;