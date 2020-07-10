const express = require("express");
const router = express.Router();
const ctrl = require("./statement.ctrl");

router.get("/", ctrl.showListPage);
router.get("/new", ctrl.showCreatePage);
router.get("/list", ctrl.list);
router.get("/list/total", ctrl.total);
router.get("/:id", ctrl.checkId, ctrl.detail);
router.get("/:id/edit", ctrl.checkId, ctrl.showUpdatePage);

router.post("/", ctrl.create);
router.put("/:id", ctrl.checkId, ctrl.update);

router.delete("/:id", ctrl.checkId, ctrl.remove);

module.exports = router;
