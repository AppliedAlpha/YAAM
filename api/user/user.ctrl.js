const UserModel = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const showSignupPage = (req, res) => {
    res.render("user/signup");
}

const showLoginPage = (req, res) => {
    res.render("user/login");
}

// 에러: 입력값 누락 400, 이메일 중복 409
const signup = (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).send("필수값 없음");

    UserModel.findOne({ email }, (err, result) => {
        if (err) return res.status(500).send("사용자 조회 오류");
        if (result) return res.status(409).send("이미 있는 이메일");

        // 단방향 암호화 : 해시
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) return res.status(500).send("해시 생성 오류");

            const user = new UserModel({ name, email, password: hash });
            user.save((err, result) => {
                if (err) return res.status(500).send("사용자 등록 오류");
                res.status(201).json(result);
            });
        });
    });
};

// Email, Password 일치 시 200
// 미입력 400, 없는 이메일 404, 패스워드 미일치 500
const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("비어있음");
    UserModel.findOne({ email }, (err, user) => {
        if (err) return res.status(500).send("로그인 시 오류");
        if (!user) return res.status(404).send("가입 안 된 계정");

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).send("로그인 시 오류.");
            if (!isMatch) return res.status(500).send("비밀번호 틀림");

            // 다 맞으면 토큰 발급 (jsonwebtoken)
            const token = jwt.sign(user._id.toHexString(), "secret");

            UserModel.findById(user._id, (err, result) => {
                if (err) return res.status(500).send("로그인 시 오류..");
                res.cookie("token", token, { httpOnly: true, maxAge: 6 * 60 * 60 * 1000
                });
                res.json(result);
            });

            /*
            UserModel.findByIdAndUpdate(user._id, { token }, (err, result) => {
                if (err) return res.status(500).send("로그인 시 오류..");
                // 토큰 저장
                res.cookie("token", token, { httpOnly: true, maxAge: 30 * 1000 });
                res.json(result);
            });
             */
        });
    });
};

// verification
const checkAuth = (req, res, next) => {
    // 모든 화면 공통 사용 data
    res.locals.user = null;

    // 쿠키에서 토큰 가져옴
    const token = req.cookies.token;

    if (!token) {
        // 정상적: 로그인 안 한 경우
        if (req.url === "/" ||
            req.url === "/api/user/signup" ||
            req.url === "/api/user/login")
            return next();

        // 비정상적
        else return res.render("user/login");
    }
    // token verify
    jwt.verify(token, "secret", (err, _id) => {
        if (err) {
            res.clearCookie("token");
            return res.render("user/login");
        }

        UserModel.findById(_id, (err, user) => {
            if (err) return res.status(500).send("인증 오류");
            if (!user) return res.render("user/login");
            res.locals.user = { name: user.name, role: user.role, email: user.email };
            next();
        });
    });
};


const logout = (req, res) => {
    const token = req.cookies.token;

    jwt.verify(token, "secret", (err, _id) => {
        if (err) return res.status(500).send("로그아웃 시 토큰 오류");

        UserModel.findById(_id, (err, result) => {
            if (err) return res.status(500).send("로그아웃 시 DB 오류");
            if (!result) return res.status(404).end("존재하지 않는 ID");
            res.clearCookie("token");
            res.redirect("/");
        });

    });
};

module.exports = { showSignupPage, showLoginPage, signup, login, checkAuth, logout };