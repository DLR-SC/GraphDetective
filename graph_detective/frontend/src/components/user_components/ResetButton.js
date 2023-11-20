import * as React from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export const ResetButton = ({ label, clearCanvas }) => {
    return (
        <Tooltip title={label}>
            <IconButton onClick={clearCanvas} className="flowIcon">
                <DeleteForeverIcon />
            </IconButton>
        </Tooltip>
    );
}