import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import axios from 'axios';

const baseURL = 'http://localhost:5000';

const Card = ({ task, onDelete, onComplete }) => {
  const [, drag] = useDrag({
    item: { type: 'CARD', id: task.id },
  });

  return (
    <div ref={drag} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
      <p>{task.title}</p>
      <button onClick={() => onDelete(task.id)}>Delete</button>
      <button onClick={() => onComplete(task.id)}>Complete</button>
    </div>
  );
};

const List = ({ list, onMoveTask, onDeleteList, onCompleteTask, onTaskCreate }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => onMoveTask(item.id, list.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        border: '1px solid #ccc',
        padding: '16px',
        marginRight: '16px',
        maxWidth: '300px',
        backgroundColor: isOver && canDrop ? '#f0f0f0' : 'inherit',
      }}
    >
      <h3>{list.title}</h3>
      {list.Tasks.map((task) => (
        <Card key={task.id} task={task} onDelete={onDeleteList} onComplete={onCompleteTask} />
      ))}
      <div style={{ marginTop: '8px' }}>
        <input
          placeholder="New Task Title"
          value={list.newTaskTitle}
          onChange={(e) => onTaskCreate(list.id, e.target.value)}
        />
        <button onClick={() => onTaskCreate(list.id)}>Create Task</button>
      </div>
    </div>
  );
};

const App = () => {
  const [userId, setUserId] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (userId) {
      axios.post(`${baseURL}/getLists`, { userId }).then((response) => {
        setLists(response.data.lists);
      });
    }
  }, [userId]);

  const handleLogin = async () => {
    const response = await axios.post(`${baseURL}/login`, { username, password });
    if (response.data.success) {
      setUserId(response.data.userId);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleCreateList = async () => {
    const response = await axios.post(`${baseURL}/createList`, { userId, title: newListTitle });
    setLists([...lists, response.data.newList]);
    setNewListTitle('');
  };

  const handleMoveTask = async (taskId, newListId) => {
    await axios.post(`${baseURL}/updateTaskList`, { taskId, newListId });
    const updatedLists = lists.map((list) => ({
      ...list,
      Tasks: list.Tasks.filter((task) => task.id !== taskId),
    }));
    setLists(updatedLists);
  };

  const handleDeleteList = async (listId) => {
    const response = await axios.delete(`${baseURL}/deleteList/${listId}`);
    if (response.data.success) {
      const updatedLists = lists.filter((list) => list.id !== listId);
      setLists(updatedLists);
    } else {
      alert('Failed to delete the list.');
    }
  };

  const handleCompleteTask = async (taskId, listId) => {
    await axios.post(`${baseURL}/markCompleted`, { taskId });
    const updatedLists = lists.map((list) => ({
      ...list,
      Tasks: list.Tasks.filter((task) => task.id !== taskId),
    }));
    setLists(updatedLists);
  };

  const handleTaskCreate = async (listId, taskTitle) => {
    if (taskTitle) {
      const response = await axios.post(`${baseURL}/createTask`, { listId, title: taskTitle });
      const updatedLists = lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            Tasks: [...list.Tasks, response.data.newTask],
          };
        }
        return list;
      });
      setLists(updatedLists);
    }
  };

  return (
    <div>
      <h1>Task Board</h1>
      {userId ? (
        <div>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {lists.map((list) => (
              <List
                key={list.id}
                list={list}
                onMoveTask={handleMoveTask}
                onDeleteList={handleDeleteList}
                onCompleteTask={handleCompleteTask}
                onTaskCreate={handleTaskCreate}
              />
            ))}
          </div>
          <input
            type="text"
            placeholder="New List Title"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
          />
          <button onClick={handleCreateList}>Create List</button>
        </div>
      ) : (
        <div>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
