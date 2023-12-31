// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { TaskList, Task } = require('./models');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.post('/createTask', async (req, res) => {
  // Implement the logic to create a new task - Done
  const { listId, title } = req.body;

  try {
    // Check if the TaskList with listId exists - Done
    const taskList = await TaskList.findByPk(listId);
    if (!taskList) {
      return res.json({ success: false, message: 'TaskList not found.' });
    }

    // Create a new task and associate it with the TaskList - Done
    const newTask = await Task.create({ title });
    await newTask.setTaskList(taskList);

    res.json({ success: true, newTask });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Failed to create a new task.' });
  }
});


app.delete('/deleteTask/:taskId', async (req, res) => {
  // Implement the logic to delete a task - Done
  const taskId = req.params.taskId;

  try {
    // Check if the task with taskId exists - Done
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.json({ success: false, message: 'Task not found.' });
    }

    // Delete the task
    await Task.destroy({ where: { id: taskId } });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Failed to delete the task.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
