const mongoose = require("mongoose");
const Course   = require('./Course.js');
const bcrypt   = require('bcryptjs');
var passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'An User must have a name'],
        },
    phone: {
        type: String,
        unique: true,
        required: [true, 'An User must have a Phone Number'],
        },
    email: {
        type: String,
        unique: true,
        required: [true, 'An User must have an Email'],
        },
    password: {
        type: String
        },
    type: {
        type: String,
        default : "Student",
        enum :["Instructor","Student","Admin"]
    },
    courses: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    }]
});

UserSchema.statics.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
  
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",UserSchema);

module.exports = User;