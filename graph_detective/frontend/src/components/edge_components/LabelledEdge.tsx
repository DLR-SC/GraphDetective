import React, { FC, useEffect, useState, useContext } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, MarkerType } from 'reactflow';
import Chip from '@mui/material/Chip';
import SettingsIcon from '@mui/icons-material/Settings';

// @ts-ignore
import { GET_EDGE_PROPS, CHECK_PATH_VALIDITY } from '../../backend/services/collection.tsx';

// @ts-ignore: An import path cannot end with a '.ts' extension.
import useStore from '../../store/store.ts';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Badge from '@mui/material/Badge';
import WarningIcon from '@mui/icons-material/Warning';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

// @ts-ignore 
import EdgeData from '../../interfaces/EdgeData.tsx';

import LoopIcon from '@mui/icons-material/Loop';
import { TransitionGroup } from 'react-transition-group';
import Grow from '@mui/material/Grow';
// @ts-ignore
import { ClickedNodeContext } from '../../pages/GraphViewerPage';


const LabelledEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edges = useStore((state: any) => state.edges);
  const nodes = useStore((state: any) => state.nodes);
  const updateEdgeData = useStore((state: any) => state.updateEdgeData);
  const updateEdgePath = useStore((state: any) => state.updateEdgePath);
  const { handleNodeEditClick } = useContext<any>(ClickedNodeContext);
  const [source, setSource] = useState<any>(null);
  const [target, setTarget] = useState<any>(null);
  const [edgeData, setEdgeData] = React.useState<EdgeData | null>(null);
  const [isPath, setIsPath] = React.useState<boolean>(false);
  const [isEdgeValid, setIsEdgeValid] = React.useState<boolean>(true);

  const toggleMakePath = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newValue = !isPath;
    setIsPath(newValue);
    updateEdgePath(newValue, id);
  }

  const checkEdgeValidity = async () => {
    if (source && target) {
      try {
        const result = await CHECK_PATH_VALIDITY(source.data.collectionLabel, target.data.collectionLabel);
        const isValid = result.isValid;
        console.log("IS Valid: ", isValid)
        setIsEdgeValid(isValid);
      } catch (error) {

      }
    }
  };

  useEffect(() => {
    checkEdgeValidity();
  }, [isPath, source, target])

  useEffect(() => {
    // Get Edge, Source node and Target node
    var edge = edges.find((e: any) => e.id == id);

    if (edge != null) {
      var source = nodes.find((node: any) => node.id === edge.source);
      var target = nodes.find((node: any) => node.id === edge.target);
      setSource(source);
      setTarget(target);
      setIsPath(edge.animated);
    }

    // Getting collections to display in the list
    const getEdgeData = async () => {
      if (edge !== undefined) {
        try {
          const fetchedEdgeData = await GET_EDGE_PROPS(edge.id, source.data.collectionLabel, target.data.collectionLabel);
          fetchedEdgeData.props.forEach((item: { datatype: string, userValue: string | null; userValueType: string }) => {
            item.userValue = ["text", "number"].includes(item.datatype) ? "" : null;
            item.userValueType = item.datatype;
          })
          setEdgeData(fetchedEdgeData);
        } catch (error) {
          console.error(error);
        }
      }
    };

    getEdgeData();
  }, []);

  useEffect(() => {
    if (edgeData !== null) {
      updateEdgeData(edgeData);
    }
  }, [edgeData])

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
          className="nodrag nopan nocursor"
        >

          {edgeData &&
            <TransitionGroup>
              {source && target &&
                !isPath ? (
                source.type !== "connector" && target.type !== "connector" ? (
                  <Grow>
                    <div>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Tooltip title={`Edge: An immediate connection from the source node to the target node`}>
                          <div />
                        </Tooltip>
                        {/* Uncomment below lines to enable switching between Edges and Paths */}
                        {/* <Tooltip title={`Edge: An immediate connection from the source node to the target node`}>
                          <Chip label="Edge" className="edgeChip" deleteIcon={<LoopIcon />} onDelete={toggleMakePath} />
                        </Tooltip>
                        */}
                        {!isEdgeValid &&
                          <div style={{ marginLeft: "1em", cursor: "help" }}>
                            <Tooltip title="This edge is invalid."><WarningIcon style={{ color: '#cd5c5c' }} /></Tooltip>
                          </div>
                        }
                      </div>

                      {isEdgeValid && (

                        <Tooltip title="Edge Settings">
                          {!edgeData.hasOwnProperty("userData") || edgeData.userData.length === 0 ? (
                            <IconButton
                              className="edgeIcon"
                              onClick={() => (handleNodeEditClick("edge", edgeData))}>
                              <FilterAltIcon />
                            </IconButton>
                          ) : (
                            <Badge
                              className="edgeIcon"
                              badgeContent={edgeData.userData.length}
                              color="primary"
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                              }}
                            >
                              <IconButton
                                className="edgeIcon"
                                onClick={() => (handleNodeEditClick("edge", edgeData))}>
                                <FilterAltIcon />
                              </IconButton>
                            </Badge>
                          )
                          }
                        </Tooltip>
                      )}
                    </div>
                  </Grow>
                ) : (

                  source.type !== "connector" && target.type === "connector" ? (
                    <Grow>
                      <Tooltip title={`Edge: An immediate connection from the source node to the target node`}>
                        <Chip label="Edge" className="edgeChip" deleteIcon={<LoopIcon />} onDelete={toggleMakePath} />
                      </Tooltip>
                    </Grow>
                  ) : (
                    <Grow>
                      <Tooltip title={`Edge: An immediate connection from the source node to the target node`}>
                        <Chip label="Edge" className="edgeChip" />
                      </Tooltip>
                    </Grow>
                  )
                )
              ) : (
                <Grow>
                  <div>
                    <Tooltip title={`Path: Any path leading from the source node to the target node`}>
                      <Chip label="Path" className="pathChip" deleteIcon={<LoopIcon />} onDelete={toggleMakePath} />
                    </Tooltip>
                  </div>
                </Grow>
              )
              }
            </TransitionGroup>
          }
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default LabelledEdge;
