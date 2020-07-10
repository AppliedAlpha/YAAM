const express = require("express");
const router = express.Router();
const ctrl = require("./stats.ctrl");

router.use("/statement", require("./statement"));
router.use("/user", require("./user"));

router.get("/stats", ctrl.showListPage);
router.get("/stats/get", ctrl.list);

module.exports = router;
