import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const DesignPopup = ({ isOpen, onClose, onConfirm }) => {
    const [designName, setDesignName] = useState('');

    const handleConfirm = () => {
        onConfirm(designName);
        setDesignName('');
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={{ ...modalStyle }}>
                <TextField
                    label="Design Name"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    fullWidth
                />
                <Button onClick={handleConfirm}>OK</Button>
                <Button onClick={onClose}>Cancel</Button>
            </Box>
        </Modal>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default DesignPopup;
