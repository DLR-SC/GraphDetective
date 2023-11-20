import React, { useState, useEffect, useContext } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Stack from '@mui/material/Stack';
import { EXPORT_GRAPH } from '../../backend/services/collection.tsx';
import { MessageContext } from '../../contexts/MessageContext';

const allExportModes = [
    {
        modeKey: "csv", // Key is used in Backend!
        category: "common",
        displayName: "Csv",
    },
    {
        modeKey: "cqp_cwb", // Key is used in Backend!
        category: "restricted",
        displayName: "Corpus Workbench"
    }
]

export const ForceGraphExport = ({ graphData }) => {
    const { displayUserMessage } = useContext(MessageContext);
    if (graphData.nodes.length === 0) {
        return <div />
    }

    // All possible export formats
    const [exportModes, setExportModes] = useState([]);

    // Currently export format selected by the user
    const [exportMode, setExportMode] = useState(null);

    // Data to export, comes from backend after user hit "Download"
    const [exportData, setExportData] = useState(null);

    useEffect(() => {
        let modeNames = undefined;
        // If nodes contain a "filename" property
        if (graphData.nodes.some(obj => 'filename' in obj)) {
            modeNames = allExportModes.map(item => item.displayName)
        } else {
            const restrictedModes = allExportModes.filter(item => item.category !== "restricted");
            modeNames = restrictedModes.map(item => item.displayName)
        }
        setExportModes(modeNames);
    }, [graphData])

    useEffect(() => {
        if (exportData) {
            const blob = new Blob([exportData], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = '_export.csv';
            link.href = url;
            link.click();
            setExportData(null);
        }
    }, [exportData])

    const exportFlow = async (graphData, exportMode) => {
        if (exportMode) {
            const prepareDownload = async () => {
                try {
                    console.log("Export Mode: ", exportMode)
                    const export_data = await EXPORT_GRAPH(graphData, exportMode);
                    setExportData(export_data)
                } catch (error) {
                    console.log(error)
                }
            }
            var export_data = undefined;
            if (graphData.nodes && graphData.nodes.length > 0) {
                export_data = prepareDownload(graphData, exportMode)
            }
        } else {
            displayUserMessage("Please select an export format before downloading.", "error")
        }
    }

    const updateExportMode = (mode) => {
        const foundObject = allExportModes.find(item => item.displayName === mode);

        // Extract the modeKey if the object is found
        const correspondingModeKey = foundObject ? foundObject.modeKey : null;
        setExportMode(correspondingModeKey)
    }

    return (
        <div>
            {exportModes ? (
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={2}
                >
                    <Autocomplete
                        options={exportModes}
                        value={exportModes.find(item => item.modeKey === exportMode)}
                        onChange={(event, newValue) => {
                            updateExportMode(newValue)
                        }}
                        sx={{ width: 200 }}
                        renderInput={(params) => (
                            <TextField {...params} label={"Export-Format"} variant="standard" />
                        )}
                    />
                    <FileDownloadIcon onClick={() => {
                        exportFlow(graphData, exportMode);
                    }}
                    style={{cursor: "pointer"}}/>
                </Stack>
            ) : (
                <div>Nope</div>
            )
            }
        </div >
    );
}