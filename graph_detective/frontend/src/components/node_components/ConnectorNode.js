import * as React from 'react';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import Tooltip from '@mui/material/Tooltip';
import { Handle } from 'reactflow';

export const ConnectorNode = ({
    description
}) => {
    return (
        <div className="custom-drag-handle">
            <Handle type="target" position="left" className="nodeHandleSmall" />
            <Tooltip title={description}>
                <div
                    className="orConnectorNode"
                >
                    <MergeTypeIcon />
                </div>
            </Tooltip>
            <Handle type="source" position="right" className="nodeHandleSmall" />
        </div>

    );
}