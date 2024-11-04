const express = require("express");
const router = express.Router();
const task = require("../Controller/task");

router.post("/add", task.addTask);
router.get("/getTask", task.getTask);
router.put("/updateQueue", task.updateQueueOnTask);
router.get("/getOne", task.getTaskById);
router.put("/update", task.updateTask);
router.delete("/delete", task.deleteTaskById);
router.get("/getAnalyticsDetails", task.getAnalyticsDetails);
router.post("/addUser", task.addUser);
router.get("/getAssignee", task.getAllAssignee);

module.exports = router;