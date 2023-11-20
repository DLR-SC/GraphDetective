import { useContext } from 'react';
import { Handle } from 'reactflow';
import { CustomNodeContent } from './CustomNodeContent';
import DeleteIcon from '@mui/icons-material/Delete';
import useStore from '../../store/store.ts';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import Stack from '@mui/material/Stack';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Tooltip from '@mui/material/Tooltip';
// @ts-ignore
import { ClickedNodeContext } from '../../pages/GraphViewerPage';
import { TransitionGroup } from 'react-transition-group';
import Grow from '@mui/material/Grow';

export const NodeContainer = ({ data }) => {
    const {handleCollectionInsightsAnalyzerClick} = useContext(ClickedNodeContext);
    const deleteNode = useStore((state) => state.deleteNode);

    return (
        <TransitionGroup>
            <Grow >
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
            </Grow>
        </TransitionGroup>
    );
}