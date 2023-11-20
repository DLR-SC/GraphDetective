import * as React from 'react';
import Fab from '@mui/material/Fab';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import Tooltip from '@mui/material/Tooltip';

export const AddConnectorButton = ({
    label,
    connectorType,
    onAddConnectorButtonClick
}) => {
    return (
        <Tooltip title={label}>
            <Fab
                size="small"
                className="orConnectorButton"
                onClick={() => onAddConnectorButtonClick(connectorType)}
            >
                <MergeTypeIcon />
            </Fab>
        </Tooltip>
    );
}