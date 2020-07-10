const StatementModel = require("../../models/statement");
const mongoose = require("mongoose");

const getFormatDate = (date) => {
    var year = date.getFullYear();
    var month = (1 + date.getMonth());
    var day = date.getDate();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    return year + '-' + month + '-' + day;
};

const checkId = (req, res, next) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Error 400: Unvalid ID.");
    }
    next();
};

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
                "category": statement.category,
                "amount": (statement.assortment ? 1 : -1) * statement.amount,
            });
        });
        res.json({"data": send});
    }).sort({created: -1}); // -1: DESC
};

const total = (req, res) => {
    const email = res.locals.user.email;

    StatementModel.find({email: email}, (err, result) => {
        if (err) return res.status(500).send("Error 500: DB Loading Failed.");
        var send = {
            "today_in": 0,
            "today_out": 0,
            "this_month_cash_current": 0,
            "this_month_card_current": 0,
            "month": 0,
            "month_diff": 0,
        };
        send["month"] = new Date().getMonth() + 1;
        result.forEach(statement => {
            if (getFormatDate(statement.created) === getFormatDate(new Date())) {
                if (statement.assortment) {
                    send["today_in"] += statement.amount;
                }
                else send["today_out"] += statement.amount;
            }
            if (statement.created.getMonth() + 1 === send["month"]) {
                send["month_diff"] += (statement.assortment ? 1 : -1) * statement.amount;
            }
        });
        res.json(send);
    })
};

const create = (req, res) => {
    const { assortment, amount, description, target, category } = req.body;
    const email = res.locals.user.email;
    if (!assortment || !amount || !description || !target || !category || !email) {
        return res.status(400).send("Error 400: Required Input is not given.");
    }

    StatementModel.create({ assortment, amount, description, target, category, email }, (err, result) => {
        if (err) return res.status(500).send("Error 500: Creating Error Occured.");
        res.status(201).send("Successfully Created Statement Data.");
    });
};

const detail = (req, res) => {
    const id = req.params.id;

    StatementModel.findOne({ _id: id }, (err, result) => {
        if (err) return res.status(500).send("Error 500: DB Finding Error Occured.");
        if (!result) return res.status(404).send("Error 404: Not Found.");
        res.render("statement/detail", {result});
    });
};

const remove = (req, res) => {
    const id = req.params.id;

    StatementModel.findByIdAndDelete(id, (err, result) => {
        if (err) return res.status(500).send("Error 500: Erasing Error Occured.");
        if (!result) return res.status(404).send("Error 404: Not Found");
        res.json(result);
    });
};

const update = (req, res) => {
    const id = req.params.id;
    const { assortment, amount, description, target, category } = req.body;

    StatementModel.findByIdAndUpdate(id, { assortment, amount, description, target, category }, { new: true }, (err, result) => {
        if (err) return res.status(500).send("Error 500: DB Finding Error Occured.");
        if (!result) return res.status(404).send("Error 404: Not Found.");
        res.json(result);
    });
};

const showCreatePage = (req, res) => {
    res.render("statement/create");
};

const showListPage = (req, res) => {
    res.render("statement/list");
}

const showUpdatePage = (req, res) => {
    const id = req.params.id;

    StatementModel.findById(id, (err, result) => {
        if (err) return res.status(500).send("Error 500: DB Finding Error Occured.");
        if (!result) return res.status(404).send("Error 404: Not Found.");
        res.render("statement/update", { result });
    });
};

module.exports = { list, create, checkId, total, detail, remove, update, showListPage, showCreatePage, showUpdatePage };