import { useContext } from 'react';
import { Handle } from 'reactflow';
import { CustomNodeContent } from './CustomNodeContent';
import DeleteIcon from '@mui/icons-material/Delete';
import useStore from '../../store/store.ts';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import Stack from '@mui/material/Stack';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Tooltip from '@mui/material/Tooltip';
// @ts-ignore
import { ClickedNodeContext } from '../../pages/GraphViewerPage';
import { TransitionGroup } from 'react-transition-group';
import Grow from '@mui/material/Grow';

export const NodeContainer = ({ data }) => {
    const { handleCollectionInsightsAnalyzerClick } = useContext(ClickedNodeContext);
    const deleteNode = useStore((state) => state.deleteNode);
    const isNodeSource = useStore((state) => state.isNodeSource);
    const isNodeTarget = useStore((state) => state.isNodeTarget);

    return (
        <TransitionGroup>
            <Grow >
                <div>
                    <div className="nodeContainer">
                        <Handle type="target" position="left" className="nodeHandle" />

                        {/* The three buttons "Drag", "Delete" and "Analyze" */}
                        <div className="iconWrapper">
                            <Stack direction="row" spacing={2}>
                                <Tooltip title="Drag">
                                    <OpenWithIcon
                                        className="floatingNodeIcon dragHover custom-drag-handle"
                                    />
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <DeleteIcon
                                        className="floatingNodeIcon deleteHover"
                                        onClick={(item) => deleteNode(data.id)}
                                    />
                                </Tooltip>
                                <Tooltip title="Analyze">
                                    <QueryStatsIcon
                                        className="floatingNodeIcon analyzeHover"
                                        onClick={(item) => handleCollectionInsightsAnalyzerClick("intermediate_result_viewer", data.collectionLabel)}
                                    />
                                </Tooltip>
                            </Stack>
                        </div>
                        {/* <NodeContent data={data} /> */}
                        <CustomNodeContent data={data} />
                        <Handle type="source" position="right" className="nodeHandle" />
                    </div>
                    {isNodeSource(data.id) ? (
                        <div className="nodeHint"><PlayArrowIcon/>Path Start</div>
                    ) : (
                        <div className="nodeHint"></div>
                    )}
                    {isNodeTarget(data.id) ? (
                        <div className="nodeHint"><StopIcon/>Path End</div>
                    ) : (
                        <div className="nodeHint"></div>
                    )}
                </div>
            </Grow>
        </TransitionGroup>
    );
}