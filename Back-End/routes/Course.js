const { isInstructor, isEnrolled, isLoggedIn,isAdmin } = require("../middleware");

var express = require("express"),
  router = express.Router({ mergeParams: true }),
  Course = require("../models/Course"),
  User = require("../models/User"),
  Post = require("../models/Post"),
  Comment = require("../models/Comment"),
  passport = require("passport");

// Add Course
router.post("/create",isLoggedIn, isInstructor, (req, res) => {
  Course.findOne({key:req.body.key},(err,checkKey)=>{
    if(err){
      console.log(err);
      res.status(400).json({ status: "failed", message:"Something went wrong in db" });
    }else{
      if(checkKey){
        res.status(400).json({ status: "failed",message:"Key must be unique" });
      }else{
        Course.create({ name: req.body.name, key: req.body.key }, (err, course) => {
          if (err) {
            console.log(err);
            res.status(400).json({ status: "failed to Add Course" });
          } else {
            course.instructors.push(req.user);
            course.save();
            User.findById(req.user._id, (err, instructor) => {
              if (err) {
                console.log(err);
                res.status(400).json({ status: "failed to get Instructor" });
              } else {
                instructor.courses.push(course);
                instructor.save();
                res.status(200).json({ status: "success", data: { Course: course } });
              }
            });
          }
        });
      }
    }
  })
  
});

// Get all Courses
router.get("/",isAdmin, (req, res) => {
  Course.find({}, (err, courses) => {
    if (err) {
      console.log(err);
      res.status(400).json({ status: "failed to get Courses" });
    } else {
      res.status(200).json({ status: "success", data: { Courses: courses } });
    }
  });
});

// Get current user's Courses
router.get("/me", isLoggedIn,(req, res) => {
  User.findById(req.user._id)
    .populate("courses")
    .exec((err, user) => {
      if (err) {
        console.log(err);
        res.status(400).json({ status: "failed to get user" });
      } else {
        res.status(200).json({
          status: "success",
          data: {
            Courses: user.courses.map(function (value) {
              return {
                _id: value._id,
                name: value.name,
              };
            }),
          },
        });
      }
    });
});
//Get Course by ID

router.get("/:id", isLoggedIn, isEnrolled, (req, res) => {
  Course.findById({ _id: req.params.id })
    .populate("students")
    .populate("posts")
    .populate("instructors")
    .populate({
      path: "posts",
      populate: {
        path: "publisher",
      },
    })
    .populate({
      path:"posts",
      populate: {
        path: "comments"
      },
    }).populate({
      path:"posts",
      populate: {
        path: "comments",
        populate: {
          path: "publisher"
        }
      }
    })
    .exec((err, course) => {
      if (err) {
        console.log(err);
        res.status(400).json({ status: "failed to get course" });
      } else {
        //console.log(course.posts[0]._id.getTimestamp());
        res.status(200).json({
          status: "success",
          isEnrolled: true,
          data: {
            course: {
              instructors: course.instructors.map(function (value) {
                return {
                  _id: value._id,
                  name: value.username,
                };
              }),
              students: course.students.map(function (value) {
                return {
                  _id: value._id,
                  name: value.username,
                };
              }),
              posts: course.posts.map(function (value) {
                return {
                  _id: value._id,
                  type: value.type,
                  body: value.body,
                  title: value.title,
                  comments: value.comments,
                  publisher: {
                    _id: value.publisher._id,
                    name: value.publisher.username,
                  },
                  date: value.created_at,
                  dueDate:value.dueDate,
                };
              }),
              _id: course._id,
              key: course.key,
              name: course.name,
            },
          },
        });
      }
    });
});

//delete Course by ID

router.delete("/:id", isLoggedIn, isInstructor, (req, res) => {
  // Find Course
  Course.findById({ _id: req.params.id }, (err, course) => {
    if (err) {
      console.log(err);
      res.status(400).json({ status: "failed to get Course" });
    } else {
      // get instructors
      // loop and remove course from them
      course.instructors.forEach((instructor) => {
        User.findById(instructor, (err, inst) => {
          if (err) {
            console.log(err);
            res.status(400).json({ status: "failed to find instructor" });
          } else {
            inst.courses = inst.courses.filter(function (value, index, arr) {
              return value != req.params.id;
            });
            inst.save();
          }
        });
      });
      // do the same for students
      course.students.forEach((student) => {
        User.findById(student, (err, std) => {
          if (err) {
            console.log(err);
            res.status(400).json({ status: "failed to find student" });
          } else {
            std.courses = std.courses.filter(function (value, index, arr) {
              return value != req.params.id;
            });
            std.save();
          }
        });
      });
      // delete all posts
      course.posts.forEach((post) => {
        Post.findById(post, (err, pos) => {
          if (err) {
            res.status(400).json({ status: "failed to get post" });
          } else {
            // get comments
            // loop and remove them
            pos.comments.forEach((comment) => {
              Comment.findByIdAndRemove(comment, (err, com) => {
                if (err) {
                  console.log(err);
                  res.status(400).json({ status: "failed to delete comment" });
                } else {
                }
              });
            });
            //Remove post
            Post.findByIdAndRemove(post, (err, pos) => {
              if (err) {
                console.log(err);
                res.status(400).json({ status: "failed to delete post" });
              } else {
                res.status(200).json({ status: "success" });
              }
            });
          }
        });
      });
      //Delete course
      Course.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
          res.status(400).json({ status: "failed to delete course" });
        } else {
          res.status(200).json({ status: "success" });
        }
      });
    }
  });
});

//Enroll in a course
router.post("/enroll", isLoggedIn, (req, res) => {
  Course.findOne({ key: req.body.key }, (err, course) => {
    if (err) {
      console.log(err);
      res.status(400).json({ status: "failed to get Course" });
    } else if(course) {
      if (course.key == req.body.key  ) {
        course.students.push(req.user);
        course.save();
        User.findById(req.user._id, (err, student) => {
          if (err) {
            console.log(err);
            res.status(400).json({ status: "failed to get Student" });
          } else {
            student.courses.push(course);
            student.save();
            res
              .status(200)
              .json({ status: "success", data: { course: course } });
          }
        });
      } else {
        res.status(400).json({ status: "failed",message:"You entered wrong Key !" });
      }
    }else{
      res.status(400).json({ status: "failed",message:"You entered wrong Key !" });
    }
  });
});

//Unenroll/delete from a course
router.post("/:id/unenroll/:userID", isLoggedIn, isEnrolled, (req, res) => {
  Course.findById(req.params.id, (err, course) => {
    if (err) {
      console.log(err);
      res.status(400).json({ status: "failed to get Course" });
    } else {
      if (req.user.type == "Instructor" || req.params.userID == req.user._id) {
        course.students = course.students.filter(function (value, index, arr) {
          return value != req.params.userID;
        });
        course.save();
        User.findById(req.params.userID, (err, student) => {
          if (err) {
            console.log(err);
            res.status(400).json({ status: "failed to get Student" });
          } else {
            student.courses = student.courses.filter(function (
              value,
              index,
              arr
            ) {
              return value != course.id;
            });
            student.save();
            res.status(200).json({ status: "success" });
          }
        });
      } else {
        res.status(400).json({ status: "You don't have permission !" });
      }
    }
  });
});

module.exports = router;
