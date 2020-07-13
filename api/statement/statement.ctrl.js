const StatementModel = require("../../models/statement");
const mongoose = require("mongoose");

// Returns date object to formatted string
const getFormatDate = (date) => {
    var year = date.getFullYear();
    var month = (1 + date.getMonth());
    var day = date.getDate();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    return year + '-' + month + '-' + day;
};


// Checks if parameter id is valid or not
const checkId = (req, res, next) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Error 400: 아이디가 유효하지 않습니다.");
    }
    next();
};


// GET Request for listing process
const list = (req, res) => {
    const email = res.locals.user.email;

    StatementModel.find({email: email}, (err, result) => {
        if (err) return res.status(500).send("Error 500: DB Loading Failed.");
        var send = [];
        result.forEach(statement => {
            send.push({
                "_id": statement._id,
                "created": getFormatDate(statement.created),
                "description": statement.description,
                "amount": (statement.assortment ? 1 : -1) * statement.amount,
            });
        });
        res.json({"data": send});
    }).sort({created: -1});
};


// GET Request for simple stats calculating process
const total = (req, res) => {
    const email = res.locals.user.email;

    StatementModel.find({email: email}, (err, result) => {
        if (err) return res.status(500).send("Error 500: DB Loading Failed.");
        const send = {
            "today_in": 0,
            "today_out": 0,
            "cash_current": 0,
            "card_current": 0,
            "month": 0,
            "month_diff": 0,
        };
        send["month"] = new Date().getMonth() + 1;
        result.forEach(statement => {
            if (getFormatDate(statement.created) === getFormatDate(new Date())) {
                if (statement.assortment) {
                    send["today_in"] += statement.amount;
                } else send["today_out"] += statement.amount;
            }
            if (statement.created.getMonth() + 1 === send["month"]) {
                send["month_diff"] += (statement.assortment ? 1 : -1) * statement.amount;
            }
            if (statement.target === "현금") send["cash_current"] += (statement.assortment ? 1 : -1) * statement.amount;
            else send["card_current"] += (statement.assortment ? 1 : -1) * statement.amount;
        });
        res.json(send);
    });
};


// POST Request for making a new statement
const create = (req, res) => {
    const {assortment, amount, description, target, category} = req.body;
    const email = res.locals.user.email;
    if (!assortment || !amount || !description || !target || !category || !email) {
        return res.status(400).send("Error 400: 입력값이 올바르지 않습니다.");
    }

    StatementModel.create({assortment, amount, description, target, category, email}, (err, result) => {
        if (err) return res.status(500).send("Error 500: 생성 도중 오류가 발생했습니다.");
        res.status(201).send("OK 201");
    });
};


// GET Request for showing detail of a statement
const detail = (req, res) => {
    const id = req.params.id;

    StatementModel.findOne({_id: id}, (err, result) => {
        if (err) return res.status(500).send("Error 500: 로드 도중 오류가 발생했습니다.");
        if (!result) return res.status(404).send("Error 404: 파일을 찾을 수 없었습니다.");
        res.render("statement/detail", {result});
    });
};


// DELETE Request for a statement
const remove = (req, res) => {
    const id = req.params.id;

    StatementModel.findByIdAndDelete(id, (err, result) => {
        if (err) return res.status(500).send("Error 500: 삭제 도중 오류가 발생했습니다.");
        if (!result) return res.status(404).send("Error 404: 파일을 찾을 수 없었습니다.");
        res.json(result);
    });
};


// POST Request for updating a statement
const update = (req, res) => {
    const id = req.params.id;
    const {assortment, amount, description, target, category} = req.body;

    StatementModel.findByIdAndUpdate(id, {
        assortment,
        amount,
        description,
        target,
        category
    }, {new: true}, (err, result) => {
        if (err) return res.status(500).send("Error 500: 로드 도중 오류가 발생했습니다.");
        if (!result) return res.status(404).send("Error 404: 파일을 찾을 수 없었습니다.");
        res.json(result);
    });
};


// Rendering create page
const showCreatePage = (req, res) => {
    res.render("statement/create");
};


// Rendering list page
const showListPage = (req, res) => {
    var send = {"today_income": 0, "today_outcome": 0};
    const email = res.locals.user.email;

    StatementModel.find({email: email}, (err, result) => {
        if (err) return res.status(500).send("Error 500: 로드 도중 오류가 발생했습니다.");
        result.forEach(statement => {
            if (getFormatDate(statement.created) === getFormatDate(new Date())) {
                if (statement.assortment) {
                    send["today_income"] += statement.amount;
                } else send["today_outcome"] += statement.amount;
            }
        });
    });
    res.render("statement/list", send);
}


// Rendering update page
const showUpdatePage = (req, res) => {
    const id = req.params.id;

    StatementModel.findById(id, (err, result) => {
        if (err) return res.status(500).send("Error 500: 로드 도중 오류가 발생했습니다.");
        if (!result) return res.status(404).send("Error 404: 파일을 찾을 수 없었습니다.");
        res.render("statement/update", {result});
    });
};

module.exports = {list, create, checkId, total, detail, remove, update, showListPage, showCreatePage, showUpdatePage};