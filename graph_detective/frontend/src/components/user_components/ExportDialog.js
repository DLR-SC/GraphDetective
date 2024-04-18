import { useState, useEffect } from 'react';
import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { MultipleSelect } from './MultipleSelect';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { EXPORT_GRAPHDATA } from '../../backend/services/collection.tsx';

function getUniqueCollectionNames(graphData) {
    // Extract the 'nodes' array from the input object
    const { nodes } = graphData;

    // Use Set to store unique values of 'abc'
    const uniqueColls = new Set();

    // Iterate through each entry in 'nodes' and add 'abc' values to the Set
    nodes.forEach(node => {
        if (node && node.collection) {
            uniqueColls.add(node.collection);
        }
    });

    // Convert the Set to an array and return
    return Array.from(uniqueColls);
}

function getUniqueEdgeNames(graphData) {
    // Extract the 'nodes' array from the input object
    const { links } = graphData;

    // Use Set to store unique values of 'abc'
    const uniqueEdges = new Set();

    // Iterate through each entry in 'nodes' and add 'abc' values to the Set
    links.forEach(link => {
        if (link && link._id) {
            uniqueEdges.add(link._id.split("/")[0]);
        }
    });

    // Convert the Set to an array and return
    return Array.from(uniqueEdges);
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));


export const ExportDialog = ({ graphData }) => {
    const uniqueCollections = getUniqueCollectionNames(graphData)
    const uniqueEdges = getUniqueEdgeNames(graphData)
    const [selectedAttributes, setSelectedAttributes] = React.useState({})
    const [preparedDownloadData, setPreparedDownloadData] = React.useState()

    const updateSelectedAttributes = (collectionName, selectedAttributes) => {
        setSelectedAttributes(prevState => ({
            ...prevState,
            [collectionName]: selectedAttributes,
        }));
    }

    // Dialog states
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    // States for collection checkboxes
    const [activatedCollections, setActivatedCollections] = React.useState([]);
    // Function to handle checkbox changes
    const handleCollectionChange = (event, collection_name) => {
        // Update the state based on checkbox activation
        if (event.target.checked) {
            setActivatedCollections([...activatedCollections, collection_name]);
        } else {
            setActivatedCollections(activatedCollections.filter(item => item !== collection_name));
        }
    };

    // States for edge checkboxes
    const [activatedEdges, setActivatedEdges] = React.useState([]);
    // Function to handle checkbox changes
    const handleEdgeChange = (event, edgeName) => {
        // Update the state based on checkbox activation
        if (event.target.checked) {
            setActivatedEdges([...activatedEdges, edgeName]);
        } else {
            setActivatedEdges(activatedEdges.filter(item => item !== edgeName));
        }
    };

    const prepareDownload = async (graphData, exportData) => {
        try {
            console.log("Export data: ", exportData)
            const preparedDownloadData = await EXPORT_GRAPHDATA(graphData, exportData);
            setPreparedDownloadData(preparedDownloadData)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (preparedDownloadData) {
            const blob = new Blob([preparedDownloadData], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = '_export.csv';
            link.href = url;
            link.click();
            setPreparedDownloadData(null);
        }
    }, [preparedDownloadData])

    const exportGraphData = () => {
        const exportData = {};

        // Iterate through activatedCollections
        for (const collectionName of activatedCollections) {
            // Check if selectedAttributes has the key
            if (selectedAttributes.hasOwnProperty(collectionName)) {
                // Add the key-value pair to filteredAttributes
                exportData[collectionName] = selectedAttributes[collectionName];
            }
        }

        // Iterate through activatedEdges
        for (const edgeName of activatedEdges) {
            // Check if selectedAttributes has the key
            if (selectedAttributes.hasOwnProperty(edgeName)) {
                // Add the key-value pair to filteredAttributes
                exportData[edgeName] = selectedAttributes[edgeName];
            }
        }

        handleClose();
        prepareDownload(graphData, exportData);
    }


    return (
        <React.Fragment>
            <Button
                variant="outlined"
                onClick={handleClickOpen}
                className="dlrButton"
            >
                Export
            </Button>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                fullWidth={true}
                maxWidth={'md'}
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Export to CSV
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <Typography gutterBottom variant="subtitle2">
                        <b>Collections</b>
                    </Typography>
                    <Typography gutterBottom variant="subtitle1">
                        Select the nodes along with properties that you want to export.
                    </Typography>
                    {uniqueCollections.map((collection_name, index) => (
                        <div key={index} style={{ padding: "1em", display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
                                    <Grid item xs={4}>
                                        <div style={{ padding: "1em", display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={activatedCollections.includes(collection_name)}
                                                onChange={(event) => handleCollectionChange(event, collection_name)}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                            />
                                            <span style={{ marginLeft: '0.5em' }}><b>{collection_name}</b></span>
                                        </div>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <MultipleSelect collectionName={collection_name} updateSelectedAttributes={updateSelectedAttributes} />
                                    </Grid>
                                </Grid>
                            </Box>
                        </div>
                    ))}
                    <br />
                    {uniqueEdges.length !== 0 && (
                        <>
                            <Typography gutterBottom variant="subtitle2">
                                <b>Edges</b>
                            </Typography>
                            <Typography gutterBottom variant="subtitle1">
                                Select the edges along with properties that you want to export.
                            </Typography>
                            {uniqueEdges.map((edge_name, index) => (
                                <div key={index} style={{ padding: "1em", display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Grid container spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
                                            <Grid item xs={4}>
                                                <div style={{ padding: "1em", display: 'flex', alignItems: 'center' }}>
                                                    <Checkbox
                                                        checked={activatedEdges.includes(edge_name)}
                                                        onChange={(event) => handleEdgeChange(event, edge_name)}
                                                        inputProps={{ 'aria-label': 'controlled' }}
                                                    />
                                                    <span style={{ marginLeft: '0.5em' }}><b>{edge_name}</b></span>
                                                </div>
                                            </Grid>
                                            <Grid item xs={8}>
                                                <MultipleSelect collectionName={edge_name} updateSelectedAttributes={updateSelectedAttributes} />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </div>
                            ))}
                        </>
                    )
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        variant="outlined"
                        onClick={exportGraphData}
                        className="dlrButton"
                    >
                        Export
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}