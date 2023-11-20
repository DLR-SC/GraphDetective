import * as React from 'react';
import Popover from '@mui/material/Popover';
import Chip from '@mui/material/Chip';
import { VariableInputField } from '../user_components/VariableInputField';

export const EdgeInformation = ({
    popoverId,
    open,
    anchorEl,
    handleClose,
    edgeData,
    setEdgeData
}) => {
    const updateEdgeData = (newValue, newValueType, propertyName) => {
        const updatedProps = edgeData.props.map((prop) => {
            if (prop.key === propertyName) {
                prop.userValue = newValue;
                prop.userValueType = newValueType;
            }
            return prop;
        })
        var tmp = edgeData;
        tmp.props = updatedProps;
        setEdgeData(tmp);
    }

    return (
        <Popover
            id={popoverId}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <div className="edgePropsContainer">
                {edgeData != null && (
                    <div>
                        <Chip label={edgeData.name} />
                        {edgeData.props.map((prop, index) => (
                            <div key={index}>
                                <VariableInputField
                                    label={prop.key}
                                    value={prop.userValue}
                                    propertyName={prop.key}
                                    type={prop.datatype}
                                    sampleValue={prop.sampleValue}
                                    updateEdgeData={updateEdgeData}
                                />
                            </div>
                        ))}
                    </div>

                )}
            </div>
        </Popover >

    );
}