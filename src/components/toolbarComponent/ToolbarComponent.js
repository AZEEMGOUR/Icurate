import React from 'react';
import './ToolbarComponent.css';
import {
  FaSquare, FaCircle, FaCrop, FaAngleDoubleUp, FaLayerGroup, FaTextWidth, FaTrash,FaExpandArrowsAlt,
  FaObjectGroup
} from 'react-icons/fa';

const ToolbarComponent = ({ onSquareClick,onDeleteClick,activateResize,onGroupClick }) => {
  return (
    <div className="toolbar">
      <button className="mat-icon-button" onClick={onSquareClick}><FaSquare /></button>
      <button className="mat-icon-button"><FaCircle /></button>
      <button className="mat-icon-button"><FaCrop /></button>
      <button className="mat-icon-button"><FaAngleDoubleUp /></button>
      <button className="mat-icon-button"><FaLayerGroup /></button>
      <button className="mat-icon-button"><FaTextWidth /></button>
      <button className="mat-icon-button" onClick={activateResize}><FaExpandArrowsAlt /></button>
      {/* Add more buttons/icons as needed */}
      <button className="mat-icon-button" onClick={onDeleteClick}><FaTrash /></button>
      <button className="mat-icon-button" onClick={onGroupClick}><FaObjectGroup /></button>
    </div>
  );
};

export default ToolbarComponent;
