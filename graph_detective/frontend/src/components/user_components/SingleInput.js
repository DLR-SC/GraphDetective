import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export const SingleInput = ({ label, value, setValue }) => {
    return (
        <Box component="form"
            noValidate
            autoComplete="off"
        >
            <TextField
                id="outlined-controlled"
                label={label}
                value={value}
                onChange={(event) => { setValue(event.target.value); }}
            />
        </Box>
    );
}