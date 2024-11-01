// GroupPopup.js
import React, { useState } from 'react';
import './GroupPopup.css';


const GroupPopup = ({ onClose, onCreateGroup }) => {
  const [instanceName, setInstanceName] = useState('');

  const handleCreateClick = () => {
    onCreateGroup(instanceName);
    onClose();
  };

  return (
    <div className="popup">
      <h3>Create Group</h3>
      <input 
        type="text" 
        value={instanceName} 
        onChange={(e) => setInstanceName(e.target.value)} 
        placeholder="Enter instance name"
      />
      <div>
        <button onClick={handleCreateClick}>Create Instance</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default GroupPopup;
