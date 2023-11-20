import * as React from 'react';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import Button from '@mui/material/Button';

export const FlowButton = ({ label, onClick, endIcon = <PlayCircleFilledWhiteIcon />, isDisabled = false, color = "#73a136" }) => {
    return (
        <Button
            variant="contained"
            size="small"
            disabled={isDisabled}
            className="dlrButton"
            // endIcon={endIcon}
            onClick={onClick}
        >
            {label}
        </Button>
    );
}