import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Stack from '@mui/material/Stack';

export const NodeEditorItem = ({
    property,
    operator,
    value,
    filterId,
    onDelete
}: { filterId: string, property: string | number, operator: string, value: string | number | Date, onDelete: (filterId: string) => {} }) => {

    return (
        <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
        >
            <FilterAltIcon fontSize="inherit" />
            <div><b>{property}</b>:</div>
            <div><i>{operator}</i></div>
            <div style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "50%",
            }}><i>{value.toString()}</i></div>
            <div>
                <IconButton aria-label="delete" size="small" onClick={() => onDelete(filterId)}>
                    <DeleteForeverIcon fontSize="inherit" />
                </IconButton>
            </div>
        </Stack >
    )
}