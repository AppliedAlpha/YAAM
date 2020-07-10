const mongoose = require("mongoose");

// 스키마 정의
// 컬렉션에 들어가는 Doucument의 구조를 정의
// 필드, 타입, 필수여부 등
const UserSchema = new mongoose.Schema({
    name: {
        type: String, // 자료형
        required: true, // 필수 여부
        trim: true, // 앞뒤 공백 제거 여부
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

// 스키마 -> 모델
// 컬렉션 -> users 컬렉션 생성
const User = mongoose.model("user", UserSchema);
module.exports = User;
