// Card.js
import React from 'react';
import { useDrag } from 'react-dnd';
import axios from 'axios';

const Card = ({ task, onDelete, onComplete }) => {
  const [, drag] = useDrag({
    item: { type: 'CARD', id: task.id },
  });

  const handleDelete = async () => {
    await axios.delete(`http://localhost:5000/deleteTask/${task.id}`);
    onDelete(task.id);
  };

  const handleComplete = async () => {
    await axios.post('http://localhost:5000/markCompleted', { taskId: task.id });
    onComplete(task.id);
  };

  return (
    <div ref={drag} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
      <p>{task.title}</p>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleComplete}>Complete</button>
    </div>
  );
};

export default Card;
