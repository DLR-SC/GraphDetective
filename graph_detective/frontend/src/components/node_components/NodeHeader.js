import CircularProgress from '@mui/material/CircularProgress';
import { formatNumberWithDot } from '../../utils'
import React from "react";

export const NodeHeader = ({ label, nodeCount }) => {
    if (nodeCount === -2) {
        return <div>
            <span className="nodeHeaderContainer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <b>{label}</b>
                <CircularProgress size={15} color="primary" style={{ marginLeft: "4px" }} />

            </span>
        </div>
    }
    if (nodeCount === -1 || (nodeCount === undefined && nodeCount !== null)) {
        return <div className="nodeHeaderContainer">
            <b>{label}</b>
        </div>
    }
    const formatValue = (value) => formatNumberWithDot;
    return (
        <div className="nodeHeaderContainer">
            <b>{label}</b><small><i>{" (" + formatNumberWithDot(nodeCount) + ")"}</i></small>
        </div>
    );
}