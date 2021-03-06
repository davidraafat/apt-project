const mongoose = require("mongoose");
const User = require("./User.js");
const Comment = require("./Comment.js");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A Post must have a title"],
    },
    body: {
      type: String,
      required: [true, "A Post must have a body"],
    },
    type: {
      type: String,
      required: [true, "A post must have a type"],
      default: "Announcement",
      enum: ["Announcement", "file", "video","Assignment"],
    },
    publisher: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
      },
    ],
    created_at: {
      type: Date,
    },
    MaterialPath: String,
    dueDate: Date,
  },
  { timestamps: { createdAt: "created_at" } }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
