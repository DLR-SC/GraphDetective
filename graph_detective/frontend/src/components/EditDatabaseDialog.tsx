import React, { useCallback, useState, useEffect, useContext } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
//@ts-ignore
import { DropzoneComponent } from './user_components/DropzoneComponent.js';
// @ts-ignore
import { MODIFY_DATABASE_CONNECTION, GET_BACKEND_URL } from '../backend/services/collection.tsx';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
//@ts-ignore
import { MessageContext } from './../contexts/MessageContext.js';

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, open } = props;
  const { displayUserMessage } = useContext<any>(MessageContext);

  const [databaseConnectionFile, setDatabaseConnectionFile] = useState(undefined); // database connection file
  const [edgesFile, setEdgesFile] = useState(undefined); // edges file
  const [collectionMapFile, setCollectionMapFile] = useState(undefined); // collection map file
  const [collectionViewsFile, setCollectionViewsFile] = useState(undefined); // collection views

  const [changesLoading, setChangesLoading] = useState<boolean>(false);

  const allFilesUploaded = () => {
    if (databaseConnectionFile !== undefined &&
      edgesFile !== undefined &&
      collectionMapFile !== undefined &&
      collectionViewsFile !== undefined
    ) {
      return true;
    }
    return false;
  }

  const handleClose = () => {
    handleUpload_Database(undefined);
    handleUpload_Edges(undefined);
    handleUpload_CollectionMap(undefined);
    handleUpload_CollectionViews(undefined);
    onClose();
  }
  const saveChanges = () => {
    setChangesLoading(true)

    // Send the data to Backend
    const modify_database = async () => {
      try {
        const result = await MODIFY_DATABASE_CONNECTION(
          databaseConnectionFile,
          edgesFile,
          collectionMapFile,
          collectionViewsFile
        );
        if (result.result) {
          setChangesLoading(false)
          // Close the dialog
          handleClose();
          displayUserMessage("Changes applied successfully. Refreshing page ...", "success")
          const myTimeout = setTimeout(() => { window.location.reload() }, 2500);
        } else {
          throw Error("Saves could not be applied in Backend.");
        }
      } catch (error) {
        setChangesLoading(false)
        // Close the dialog
        handleClose();
        displayUserMessage("An error occured saving the database changes. Please check your configuration files for validity.", "error")
      }
    };
    if (allFilesUploaded()) {
      modify_database()
    }
  };

  // Handler for uploading the database connection file
  const handleUpload_Database = (filedata: any) => {
    setDatabaseConnectionFile(filedata)
  }
  // Handler for uploading the edges file
  const handleUpload_Edges = (filedata: any) => {
    setEdgesFile(filedata)
  }
  // Handler for uploading the collection map file
  const handleUpload_CollectionMap = (filedata: any) => {
    setCollectionMapFile(filedata)
  }
  // Handler for uploading the collection views file
  const handleUpload_CollectionViews = (filedata: any) => {
    setCollectionViewsFile(filedata)
  }

  return (
    <Dialog onClose={handleClose} open={open}>

      {/* Dialog Title */}
      <DialogTitle>
        <Typography variant="button" display="block" gutterBottom>
          <b>Edit Database Connection</b>
        </Typography>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          Note: while files you provide here are not stored on the server, they may be
          transmitted over the network in plaintext.
        </Typography>
        {/* Upload Content 1 */}
        <div className="uploadContainer">
          <Typography variant="subtitle1" display="block" gutterBottom>
            Database Config
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            <i>JSON file containing the following key/value pairs: <br />
            &#123; <br />
            <b>"DB_HOST"</b>: &lt;URL of the database, starting with http:// or https://&gt; <br />
            <b>"DB_PORT"</b>: &lt;port number&gt; <br />
            <b>"DB_NAME"</b>: &lt;name of the database&gt; <br />
            <b>"DB_USER"</b>: &lt;name of the user&gt; <br />
            <b>"DB_PASSWORD"</b>: &lt;password&gt; <br />
            <b>"DB_GRAPH"</b>: &lt;graph name in the database&gt; <br />
            <b>"DB_LABEL_ATTRIBUTE"</b>: &lt;property name that should be used to display the collection in the graph below (e.g. "name" or "_id")&gt; <br />
            &#125;
            </i>
          </Typography>
          <DropzoneComponent onUpload={handleUpload_Database} />
        </div>

        {/* Upload Content 2 */}
        <div className="uploadContainer">
          <Typography variant="subtitle1" display="block" gutterBottom>
            Graph Edges
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            <i>A JSON file containing all the edges to be displayed in the ontology graph below. Only edges
              contained in this file are displayed. The file should contain source collection names as keys
              and an array of target collection names as values.</i><br />
            <small>Example: &#123;"SourceNode": &#91;"SomeTargetCollection", "OtherTargetCollection"&#93;&#125;, ...</small>
          </Typography>
          <DropzoneComponent onUpload={handleUpload_Edges} />
        </div>

        {/* Upload Content 3 */}
        <div className="uploadContainer">
          <Typography variant="subtitle1" display="block" gutterBottom>
            Collection Names
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            <i>A JSON file that contains a 1:1 mapping of the collection names as they appear in the database
              and the names that should be displayed to the user in the ontology graph below. All collections must be specified here!</i><br />
            <small>Example: &#123;"CollectionNameInDatabase": "Human Readable Collection Name&#125;, ...</small>
          </Typography>
          <DropzoneComponent onUpload={handleUpload_CollectionMap} />
        </div>

        {/* Upload Content 4 */}
        <div className="uploadContainer">
          <Typography variant="subtitle1" display="block" gutterBottom>
            Collection Views
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            <i>JSON file containing all custom views for each collection to be utilized during querying. A collection
            can only be assigned to a single view. The file contains the collection's database name as key and the corresponding
            display name as value.</i><br />
            <small>Example: &#123;"CollectionNameInDatabase": "ViewName"&#125;, ...</small>
          </Typography>
          <DropzoneComponent onUpload={handleUpload_CollectionViews} />
        </div>

      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        {changesLoading ? (
          <Box sx={{ display: 'flex' }}>
            <CircularProgress />
          </Box>
        ) : (

          allFilesUploaded() ? (
            <Button autoFocus onClick={saveChanges}>
              Save changes
            </Button>
          ) : (
            <a style={{ display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
              <HourglassBottomIcon fontSize='small' />
              Upload all files before saving changes ...
            </a>
          )

        )}
      </DialogActions>
    </Dialog>
  );
}

export const EditDatabaseDialog = ({ title, icon }: { title: string, icon: any }) => {
  const [open, setOpen] = React.useState(false);
  const [currentBackendURL, setCurrentBackendURL] = useState<string>("");

  useEffect(() => {
    const get_host = async () => {
      try {
        const result = await GET_BACKEND_URL();
        setCurrentBackendURL(result.host)
      } catch (error) {
        console.error(error);
      }
    };
    get_host()
  }, [])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <small style={{ color: "darkgray" }}>Connected to <i><a href={currentBackendURL} target="_blank">{currentBackendURL}</a></i></small>
      <br />
      <Chip
        label={<b>{title}</b>}
        onClick={handleClickOpen}
        icon={icon}
      />
      <SimpleDialog
        open={open}
        onClose={handleClose}
      />
    </div>
  );
}