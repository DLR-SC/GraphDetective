import React, { useEffect, useState, useContext } from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import { NodeContainer } from '../node_components/NodeContainer';
import { ConnectorNode } from '../node_components/ConnectorNode';
import LabelledEdge from '../edge_components/LabelledEdge.tsx';
import { GET_ATTRIBUTES } from '../../backend/services/collection.tsx';
import { MessageContext } from '../../contexts/MessageContext';
import { getNewNodePosition, getNewNodeId } from '../../utils';
import 'reactflow/dist/style.css';
import { shallow } from 'zustand/shallow';
import useStore from '../../store/store.ts';
import { FlowButton } from '../user_components/FlowButton';
import { ResetButton } from '../user_components/ResetButton';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { SlideInDialog } from '../user_components/SlideInDialog';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import TextField from '@mui/material/TextField';
import Badge from '@mui/material/Badge';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import PolylineIcon from '@mui/icons-material/Polyline';

const nodeTypes = { node: NodeContainer, connector: ConnectorNode };
const edgeTypes = { edge: LabelledEdge };
const defaultViewport = { x: 0, y: 0, zoom: 0.75 }

export const PathFlowModeller = (
  {
    selectedCollection,
    getObjectGraph,
    killAllQueries,
    isFlowLoading,
    startNodes,
    setStartNodes,
    paths,
    setPaths,
    explainFlow,
    pathNodes,
    setPathNodes
  }
) => {
  const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
  });
  const { displayUserMessage } = useContext(MessageContext);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(selector, shallow);
  const addNode = useStore((state) => state.addNode);
  const clearAll = useStore((state) => state.clearAll);
  const loadAll = useStore((state) => state.loadAll);

  // Variables and handlers for opening the "Load Flow" dialog
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // Add node to flow canvas when the user clicks on the list
  useEffect(() => {
    const addNodeToPath = async () => {
      try {
        // Attributes of the selected collection
        const atts = await GET_ATTRIBUTES(selectedCollection)
        const nodeId = getNewNodeId(nodes);
        const pos = getNewNodePosition(nodes);
        const newNode = {
          id: nodeId,
          position: pos,
          dragHandle: '.custom-drag-handle',
          data: {
            attributeOptions: atts,
            collectionLabel: selectedCollection,
            id: nodeId
          },
          sourcePosition: "right",
          targetPosition: "left",
          type: "node"
        };
        addNode(newNode);
      } catch (error) {
        console.log(error)
        displayUserMessage("An error occured while loading the node. Please try again.", "error")
      }
    };

    if (selectedCollection != null) {
      addNodeToPath();
    }
  }, [selectedCollection]);

  const [emptyFlowDownloadCounter, setEmptyFlowDownloadCounter] = useState(0);

  const saveFlow = () => {
    if (nodes.length === 0 && edges.length === 0) {
      const addon = emptyFlowDownloadCounter > 0 ? `You already tried ${emptyFlowDownloadCounter} times` : ""
      displayUserMessage(`Very funny. There is no Flow to download. ${addon}`, "warning")
      setEmptyFlowDownloadCounter(emptyFlowDownloadCounter + 1);
    } else {
      const fileData = JSON.stringify({ nodes: nodes, edges: edges });
      const blob = new Blob([fileData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'flow.json';
      link.href = url;
      link.click();
    }
  }

  const loadFlow = (parsedData) => {
    try {
      const jsonNodes = parsedData.nodes;
      const jsonEdges = parsedData.edges;
      loadAll(jsonNodes, jsonEdges);
      handleClose();
      displayUserMessage("Flow loaded successfully.", "success")
    } catch (error) {
      displayUserMessage("Could not load flow.", "error")
    }
  }

  // Popover Options
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const popoverOpen = Boolean(anchorEl);
  const id = popoverOpen ? 'simple-popover' : undefined;

  // Popover Explain Flow
  const [anchorEl_2, setAnchorEl_2] = React.useState(null);

  const handleClick_2 = (event) => {
    explainFlow();
    setAnchorEl_2(event.currentTarget);
  };

  const handleClose_2 = () => {
    setAnchorEl_2(null);
  };

  const open_2 = Boolean(anchorEl_2);
  const id_2 = open_2 ? 'simple-popover' : undefined;

  return (
    <>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          snapToGrid={true}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={defaultViewport}
          onlyRenderVisibleElements={false}
        >
          <Controls />
          <Background />
          <Panel position="top-right">
            <div id="editorAnchor">
              <Tooltip title="Explain Flow">
                <IconButton aria-label="delete" onClick={handleClick_2}>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Panel>
          {/* Popover to display Explain Flow */}
          {pathNodes &&
            <Popover
              id={id_2}
              open={open_2}
              anchorEl={anchorEl_2}
              onClose={handleClose_2}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
            >
              <div>
                {pathNodes.length > 0 ? (
                  <div>
                    <Typography sx={{ p: 2 }}>Your current flow will match the following paths:</Typography>
                    <List>
                      {pathNodes.map((path, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <PolylineIcon />
                          </ListItemIcon>
                          <ListItemText primary={<b>{path.join(' - ')}</b>} />
                        </ListItem>
                      ))}
                    </List>
                  </div>
                ) : (
                  <Typography sx={{ p: 2 }}>Empty or invalid Flow.</Typography>
                )}

              </div>
            </Popover>
          }
          <Panel position="bottom-right">
            <div>
              <Stack
                direction="row"
                divider={<Divider orientation="vertical" flexItem />}
                spacing={2}
              >
                <ResetButton label={"Clear All"} clearCanvas={clearAll} />

                <Tooltip title={"Save Flow"}>
                  <IconButton onClick={saveFlow} className="flowIcon">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={"Load Flow"}>
                  <IconButton onClick={handleClickOpen} className="flowIcon">
                    <FileUploadIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={"Query Options"}>
                  <IconButton onClick={handleClick} className="flowIcon">
                    {(startNodes && startNodes > 0) || (paths && paths > 0) ? (<Badge color="primary" variant="dot">
                      <SettingsIcon />
                    </Badge>) : (<SettingsIcon />)}
                  </IconButton>
                </Tooltip>

                <Popover
                  id={id}
                  open={popoverOpen}
                  anchorEl={anchorEl}
                  onClose={handleClosePopover}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <Typography sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <TextField
                        id="standard-number"
                        label="Total number of Paths"
                        type="number"
                        inputProps={{ min: 0 }}
                        onChange={(event) => {
                          setPaths(event.target.value);
                        }}
                        value={paths}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="standard"
                      />
                    </Stack>
                  </Typography>
                </Popover>

                {isFlowLoading ? (
                  <FlowButton label={<><CircularProgress color="inherit" size={14} thickness={7} style={{ marginRight: "0.5em" }} />Cancel</>} onClick={killAllQueries} />
                ) : (
                  <FlowButton label={"Execute"} onClick={getObjectGraph} />
                )
                }

              </Stack>
            </div>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
      <SlideInDialog open={open} handleClose={handleClose} loadFlow={loadFlow} />
    </>
  );
}