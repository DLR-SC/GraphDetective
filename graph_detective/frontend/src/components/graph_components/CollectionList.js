import { useState, useEffect, useContext } from 'react';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';
import { GET_COLLECTIONS } from '../../backend/services/collection.tsx';

const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

export const CollectionList = ({ handleCollectionClick }) => {
    const [collections, setCollections] = useState([]);

    // Getting collections to display in the list
    useEffect(() => {
        const getCollections = async () => {
            try {
                const fetchedCollections = await GET_COLLECTIONS();
                setCollections(fetchedCollections);
            } catch (error) {
                console.error(error);
            }
        };

        getCollections();
    }, []);


    return (
        <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
            <Grid item xs={12} md={10}>
                <Typography variant="subtitle2" display="block" gutterBottom>
                    <b>Add Node</b>
                </Typography>
                <Demo>
                    <List className="collection_list" dense={true} sx={{
                        width: '100%',
                        maxWidth: 600,
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'auto',
                        maxHeight: 373,
                        '& ul': { padding: 0 },
                    }}>
                        <TransitionGroup>
                            {
                                collections.map((item, index) => (
                                    <Collapse key={item}>
                                        <ListItem
                                            className='nodeListItem'
                                            key={index}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    // className="addNodeIcon"
                                                    className="dlrButton"
                                                    style={{padding: "4px"}}
                                                    onClick={() => handleCollectionClick(item)}>
                                                    <AddIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={item}
                                            />
                                        </ListItem>
                                    </Collapse>
                                ))
                            }
                        </TransitionGroup>
                    </List>
                </Demo>
            </Grid>
        </Box>
    );
}