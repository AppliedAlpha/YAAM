const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: Number,
        default: 0, // 0: user, 1: admin
    },
    token: {
        type: String,
    },
});


const User = mongoose.model("user", UserSchema);
module.exports = User;
