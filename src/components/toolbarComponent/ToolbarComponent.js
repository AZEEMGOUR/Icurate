import React, { useState, useEffect } from 'react';
import './ToolbarComponent.css';
import {
  FaSquare, FaCircle, FaCrop, FaAngleDoubleUp, FaLayerGroup, FaTextWidth, FaTrash, FaExpandArrowsAlt,
  FaObjectGroup, FaRulerCombined, FaCube, FaTag
} from 'react-icons/fa';

const ToolbarComponent = ({ canvasRef, onSquareClick, onDeleteClick, activateResize, onGroupClick, onInstanceClick, onLabelClick }) => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [rulerActive, setRulerActive] = useState(false); 

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedIcon(null); // Deselect the icon when Escape is pressed
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleIconClick = (iconName, callback) => {
    setSelectedIcon(iconName);
    if (callback) {
      callback();
    }
  };

  const handleRulerClick = () => {
    setSelectedIcon('ruler');
    if (canvasRef.current) {
      console.log('Ruler Mode Activated');
      canvasRef.current.activateRulerTool();
    }
  };

  const handleDeactivateRuler = () => {
    if (canvasRef.current) {
      canvasRef.current.deactivateRulerTool();
      setSelectedIcon(null); // Deselect the icon when ruler is deactivated
    }
  };
  const handleBoundingBoxClick = () => {
    if (canvasRef.current) {
      canvasRef.current.activateBoundingBoxTool(); // This calls the method defined in useImperativeHandle
    }
  };



  const handleGroupClick = () => {
    if (canvasRef.current) {
      canvasRef.current.openGroupPopup(); // This method will open the group popup
    }
  };
  

  const getButtonClass = (iconName) => {
    return `mat-icon-button ${selectedIcon === iconName ? 'selected' : ''}`;
  };

  return (
    <div className="toolbar">
      <button className={getButtonClass('square')} onClick={() => handleIconClick('square', onSquareClick)}><FaSquare /></button>
      <button className="mat-icon-button" onClick={onLabelClick}><FaTag /></button>
      <button className={getButtonClass('ruler')} onClick={handleRulerClick} title="Ruler Mode">
        <FaRulerCombined />
      </button>
      <button className="mat-icon-button" onClick={handleGroupClick}><FaCube /></button>

      <button className={getButtonClass('circle')} onClick={() => handleIconClick('circle')}><FaCircle /></button>
      <button className={getButtonClass('crop')} onClick={() => handleIconClick('crop')}><FaCrop /></button>
      <button className={getButtonClass('angle')} onClick={() => handleIconClick('angle')}><FaAngleDoubleUp /></button>
      <button className={getButtonClass('layer')} onClick={() => handleIconClick('layer')}><FaLayerGroup /></button>
      <button className={getButtonClass('text')} onClick={() => handleIconClick('text')}><FaTextWidth /></button>
      <button className={getButtonClass('resize')} onClick={() => handleIconClick('resize', activateResize)}><FaExpandArrowsAlt /></button>
      <button className={getButtonClass('delete')} onClick={() => handleIconClick('delete', onDeleteClick)}><FaTrash /></button>
      <button className={getButtonClass('group')} onClick={() => handleIconClick('group', onGroupClick)}><FaObjectGroup /></button>
      
      
    </div>
  );
};

export default ToolbarComponent;
