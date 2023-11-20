import React from 'react';
import { SingleInput } from '../components/user_components/SingleInput';
import Box from '@mui/material/Box';

export const DocumentSearchPage = () => {
    const [input, setInput] = React.useState('');
    return (
        <Box className="test">
            <SingleInput label="Search Terms" value={input} setValue={setInput}/>
        </Box>
    )
}