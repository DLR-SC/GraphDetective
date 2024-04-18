import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

export const DropzoneComponent = ({
    onUpload,
    placeholder,
    filetype,
    showIcon,
    padding="1em"
 }) => {
    const [isUploaded, setIsUploaded] = useState(false);
    const [uploadedFilename, setUploadedFileName] = useState("");

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        const filename = file.path;

        // Create a new FileReader instance
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                let parsedData;
                if (filetype === "json") {
                    // Parse the content of the file into a JSON object
                    parsedData = JSON.parse(e.target.result);
                } else if (filetype === "txt") {
                    parsedData = e.target.result // This is the content of the txt file as a string
                    console.log(parsedData)
                }
                
                // Call the onUpload function with the parsed JSON object
                onUpload(parsedData);
                setIsUploaded(true);
                setUploadedFileName(filename)
            } catch (error) {
                setIsUploaded(false);
                setUploadedFileName("File type not supported. Expected file of type " + filetype)
            }
        };

        // Read the content of the file as text
        reader.readAsText(file);
    }, []);

    const {
        getRootProps,
        getInputProps
    } = useDropzone({
        onDrop
    });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div style={
                {
                    "border": "1px dashed black",
                    "borderRadius": "4px",
                    "padding": padding,
                    "cursor": "pointer",
                }}>{placeholder}
                {isUploaded ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    {showIcon && <DoneIcon fontSize='small' style={{color: "green"}} /> }
                    <i>{uploadedFilename} </i>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    {showIcon && <CloseIcon fontSize='small' style={{color: "red"}} /> }
                    <i>{uploadedFilename} </i>
                    </div>
                )}
                    </div>
        </div>
            )
}
export default DropzoneComponent;