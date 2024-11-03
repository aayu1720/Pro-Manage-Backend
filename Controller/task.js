const Task = require("../Schema/task.schema");
const Assignee = require("../Schema/assignee.schema");

const addTask = async (req, res, next) => {
  try {
    const { title, priority, assignedTo, queue, tasks, checkedTasks, checkedNumber, dueDate, user } = req.body;

    if (!title || !priority || !user) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const taskDetails = new Task({ title, priority, assignedTo, queue, tasks, checkedTasks, checkedNumber, dueDate, user });
    await taskDetails.save();

    res.json({ message: "Task created successfully", isTaskCreated: true });
  } catch (error) {
    next(error);
  }
};

const getTasksByTimeStamp = async (category, createdBy, timeStamp) => {
  const dateRanges = {
    Today: { $lt: new Date(), $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    "This Week": { $lt: new Date(), $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    "This Month": { $lt: new Date(), $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  };

  const dateCondition = dateRanges[timeStamp];
  const taskDetails = await Task.find({ queue: category, user: createdBy, createdAt: dateCondition });
  const taskDetailsWithAssignee = await Task.find({ queue: category, assignedTo: createdBy, createdAt: dateCondition });

  return { taskDetails, taskDetailsWithAssignee };
};

const getTask = async (req, res, next) => {
  try {
    const { category, timeStamp, user: createdBy } = req.query;

    if (!timeStamp) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const { taskDetails, taskDetailsWithAssignee } = await getTasksByTimeStamp(category, createdBy, timeStamp);

    const taskDetailsWithAssigneeArr = taskDetailsWithAssignee.filter(item => item?.user !== createdBy);

    return res.json({ data: [...taskDetails, ...taskDetailsWithAssigneeArr] });
  } catch (error) {
    next(error);
  }
};

const updateQueueOnTask = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";
    const updatedQueue = req.query.queue || "";

    if (!taskId) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const taskDetails = await Task.findById(taskId);
    if (!taskDetails) {
      return res.status(400).json({ message: "Bad request" });
    }

    await Task.updateOne({ _id: taskId }, { $set: { ...taskDetails.toObject(), queue: updatedQueue } });
    res.json({ message: "Task updated successfully", updated: true });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";
    const taskDetails = await Task.findById(taskId);

    if (!taskDetails) {
      return res.status(400).json({ message: "Bad request" });
    }

    res.json({ data: taskDetails });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";

    if (!taskId) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
      return res.status(400).json({ message: "Bad request" });
    }

    const { title, priority, assignedTo, queue, tasks, dueDate, checkedTasks, checkedNumber, user } = req.body;

    await Task.updateOne({ _id: taskId }, { $set: { title, priority, assignedTo, queue, tasks, dueDate, checkedTasks, checkedNumber, user } });
    res.json({ message: "Task updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteTaskById = async (req, res, next) => {
  try {
    const taskId = req.query.id || "";

    const taskDetails = await Task.deleteOne({ _id: taskId });

    if (!taskDetails.deletedCount ) {
      return res.status(400).json({ message: "Bad request" });
    }

    res.json({ message: "Task deleted successfully", isDeleted: true });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsDetails = async (req, res, next) => {
  try {
    const user = req.query.user || "";

    const todoTasks = await Task.find({ queue: "todo", user: user });
    const assignedToDoTasks = await Task.find({ queue: "todo", assignedTo: user });
    const assignedToDoTasksArr = assignedToDoTasks.filter(item => item?.user !== user);

    const backlogTasks = await Task.find({ queue: "backlog", user: user });
    const assignedBacklogTasks = await Task.find({ queue: "backlog", assignedTo: user });
    const assignedBacklogTasksArr = assignedBacklogTasks.filter(item => item?.user !== user);

    const progressTasks = await Task.find({ queue: "progress", user: user });
    const assignedProgressTasks = await Task.find({ queue: "progress", assignedTo: user });
    const assignedProgressTasksArr = assignedProgressTasks.filter(item => item?.user !== user);

    const completedTasks = await Task.find({ queue: "done", user: user });
    const assignedCompletedTasks = await Task.find({ queue: "done", assignedTo: user });
    const assignedCompletedTasksArr = assignedCompletedTasks.filter(item => item?.user !== user);

    const lowPriority = await Task.find({ priority: "low", user: user });
    const lowPriorityTasks = await Task.find({ priority: "low", assignedTo: user });
    const lowPriorityTasksArr = lowPriorityTasks.filter(item => item?.user !== user);

    const moderatePriority = await Task.find({ priority: "moderate", user: user });
    const moderatePriorityTasks = await Task.find({ priority: "moderate", assignedTo: user });
    const moderatePriorityTasksArr = moderatePriorityTasks.filter(item => item?.user !== user);

    const highPriority = await Task.find({ priority: "high", user: user });
    const highPriorityTasks = await Task.find({ priority: "high", assignedTo: user });
    const highPriorityTasksArr = highPriorityTasks.filter(item => item?.user !== user);

    const allCreatedTasks = await Task.find({ user: user });
    const allAssignedTasks = await Task.find({ assignedTo: user });
    const allAssignedTasksArr = allAssignedTasks.filter(item => item?.user !== user);

    const allCreatedNullDateTasks = await Task.find({ dueDate: null, user: user });
    const allAssignedNullDateTasks = await Task.find({ dueDate: null, assignedTo: user });
    const allAssignedNullDateTasksArr = allAssignedNullDateTasks.filter(item => item?.user !== user);

    const dueDateTasks = allCreatedTasks.length + allAssignedTasksArr.length - (allCreatedNullDateTasks.length + allAssignedNullDateTasksArr.length);

    return res.json({
      data: {
        todoTasks: todoTasks.length + assignedToDoTasksArr.length,
        backlogTasks: backlogTasks.length + assignedBacklogTasksArr.length,
        progressTasks: progressTasks.length + assignedProgressTasksArr.length,
        completedTasks: completedTasks.length + assignedCompletedTasksArr.length,
        lowPriority: lowPriority.length + lowPriorityTasksArr.length,
        moderatePriority: moderatePriority.length + moderatePriorityTasksArr.length,
        highPriority: highPriority.length + highPriorityTasksArr.length,
        dueDateTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

const addUser = async (req, res, next) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const isUserExists = await Assignee.findOne({ email: email });

    if (isUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const userDetails = new Assignee({ email });

    await userDetails.save();

    res.json({ message: "User created successfully", isUserCreated: true });
  } catch (error) {
    next(error);
  }
};

const getAllAssignee = async (req, res, next) => {
  try {
    const assigneeDetails = await Assignee.find({});

    return res.json({ data: assigneeDetails });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTask,
  getTask,
  updateQueueOnTask,
  getTaskById,
  updateTask,
  deleteTaskById,
  getAnalyticsDetails,
  addUser,
  getAllAssignee
};