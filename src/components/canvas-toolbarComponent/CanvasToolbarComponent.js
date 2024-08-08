import React from 'react';
import './CanvasToolbarComponent.css';
import Icon from '@mui/material/Icon';

const CanvasToolbarComponent = ({ onDeleteClick , onCopyClick,onSaveClick, onLoadClick,onCropClick, onFitToScreenClick}) => {
  return (
    <div className="canvas-toolbar">
      <button className="mat-icon-button">
        <img src="assets/logo1.png" className="custom-icon" alt="logo" />
      </button>
      <button className="mat-icon-button" onClick={onLoadClick} >
        <Icon>file_upload</Icon>
      </button>
      <button className="mat-icon-button"  onClick={onSaveClick}>
        <Icon>file_download</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>folder_open</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>save</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>undo</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>redo</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>edit</Icon>
      </button>
      <button className="mat-icon-button" onClick={onCopyClick}>
        <Icon>content_copy</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>content_paste</Icon>
      </button>
      <button className="mat-icon-button" onClick={onFitToScreenClick}>
        <Icon>fit_screen</Icon>
      </button>
      
      <button className="mat-icon-button">
        <Icon>call_split</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>functions</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>format_list_bulleted</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>border_all</Icon>
      </button>
      <button className="mat-icon-button" onClick={onDeleteClick}>
        <Icon>delete</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>select_all</Icon>
      </button>
      <button className="mat-icon-button" onClick={onCropClick}>
        <Icon>crop</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>flip</Icon>
      </button>
      <button className="mat-icon-button">
        <Icon>rotate_right</Icon>
      </button>
    </div>
  );
};

export default CanvasToolbarComponent;
