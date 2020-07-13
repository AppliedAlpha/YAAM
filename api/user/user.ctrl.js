const UserModel = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Signing up
const signup = (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password) return res.status(400).send("Error 400: 입력값이 올바르지 않습니다.");

    UserModel.findOne({email}, (err, result) => {
        if (err) return res.status(500).send("Error 500: 조회 도중 오류가 발생했습니다.");
        if (result) return res.status(409).send("Error 409: 이미 존재하는 E-mail은 사용할 수 없습니다.");

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) return res.status(500).send("Error 500: 생성 도중 오류가 발생했습니다.");

            const user = new UserModel({name, email, password: hash});
            user.save((err, result) => {
                if (err) return res.status(500).send("Error 500: 등록 도중 오류가 발생했습니다.");
                res.status(201).json(result);
            });
        });
    });
};


// Login process
const login = (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) return res.status(400).send("Error 400: 입력값이 올바르지 않습니다.");
    UserModel.findOne({email}, (err, user) => {
        if (err) return res.status(500).send("Error 500: 로그인 도중 오류가 발생했습니다.");
        if (!user) return res.status(404).send("Error 404: 해당 E-mail의 사용자 정보가 존재하지 않습니다.");

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).send("Error 500: 로그인 도중 오류가 발생했습니다.");
            if (!isMatch) return res.status(500).send("Error 500: E-mail이나 비밀번호가 올바르지 않습니다.");

            const token = jwt.sign(user._id.toHexString(), "secret");

            UserModel.findById(user._id, (err, result) => {
                if (err) return res.status(500).send("Error 500: 로그인 도중 오류가 발생했습니다.");
                res.cookie("token", token, {
                    httpOnly: true, maxAge: 6 * 60 * 60 * 1000
                });
                res.json(result);
            });
        });
    });
};


// Logout process
const logout = (req, res) => {
    const token = req.cookies.token;

    jwt.verify(token, "secret", (err, _id) => {
        if (err) return res.status(500).send("Error 500: 로그아웃 도중 오류가 발생했습니다.");

        UserModel.findById(_id, (err, result) => {
            if (err) return res.status(500).send("Error 500: 로그아웃 도중 오류가 발생했습니다.");
            if (!result) return res.status(404).end("Error 404: 아이디를 찾을 수 없었습니다.");
            res.clearCookie("token");
            res.redirect("/");
        });
    });
};


// User verification
const checkAuth = (req, res, next) => {
    res.locals.user = null;
    const token = req.cookies.token;

    if (!token) {
        if (req.url === "/" || req.url === "/api/user/signup" || req.url === "/api/user/login") {
            return next();
        } else return res.render("user/login");
    }

    jwt.verify(token, "secret", (err, _id) => {
        if (err) {
            res.clearCookie("token");
            return res.render("user/login");
        }

        UserModel.findById(_id, (err, user) => {
            if (err) return res.status(500).send("Error 500: 로드 도중 오류가 발생했습니다.");
            if (!user) return res.render("user/login");
            res.locals.user = {name: user.name, role: user.role, email: user.email};
            next();
        });
    });
};


// Rendering signup page
const showSignupPage = (req, res) => {
    res.render("user/signup");
}


// Rendering login page
const showLoginPage = (req, res) => {
    res.render("user/login");
}

module.exports = {showSignupPage, showLoginPage, signup, login, checkAuth, logout};