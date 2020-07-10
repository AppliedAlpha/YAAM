const StatementModel = require("../models/statement");
const mongoose = require("mongoose");

const list = (req, res) => {
    const d = 24 * 60 * 60 * 1000;
    const email = res.locals.user.email;
    const base = new Date(Date.now() - 7*d);
    const chart = [];

    for (let i=1; i<=7; i++) {
        let check = new Date(base.getTime() + i*d);
        chart.push({
            'month': check.getMonth() + 1,
            'date': check.getDate(),
            'income': 0,
            'outcome': 0
        });
    }

    StatementModel.find({email: email}, (err, result) => { // result: [{}, {}, ...]
        if (err) return res.status(500).send("Error 500: DB Loading Failed.");

        result.forEach(statement => {
            let created = statement.created;
            for (let i=0; i<=6; i++) {
                if (created.getMonth() + 1 === chart[i].month && created.getDate() === chart[i].date) {
                    if (statement.assortment) {
                        chart[i].income += statement.amount;
                    }
                    else chart[i].outcome += statement.amount;
                    break;
                }
            }
        });
        res.json(chart);
        //res.render("stats", {chart});
    });
};


const showListPage = (req, res) => {
    res.render("stats");
};

module.exports = { list, showListPage };