import React, { useState, createContext, useEffect, useContext } from 'react';
import { ScreenWidthContext } from './../App';
import { PathFlowModeller } from '../components/graph_components/PathFlowModeller';
import { GraphTabs } from '../components/graph_components/GraphTabs';
import { TabContentContainer } from '../components/user_components/TabContentContainer';
import { ForceGraph } from '../components/graph_components/ForceGraph';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { CollectionList } from '../components/graph_components/CollectionList';
import {
    GET_META_GRAPH,
    GET_LABEL_PROP,
    GET_OBJECT_GRAPH,
    KILL_ALL_QUERIES,
    EXPLAIN_FLOW,
    EXPAND_NODE
} from '../backend/services/collection.tsx';
import useStore from '../store/store.ts';
import { MessageContext } from '../contexts/MessageContext';
import { CollectionGrid } from '../components/collection_analyzer_components/CollectionGrid.tsx';
import { NodeEditor } from '../components/node_components/NodeEditor.js';
import { EdgeEditor } from '../components/edge_components/EdgeEditor';
import { ForceGraphLegend, NodeEntry } from '../components/user_components/ForceGraphLegend';
import { ForceGraphExport } from '../components/user_components/ForceGraphExport';
import Stack from '@mui/material/Stack';
import { NodeView } from '../components/user_components/NodeView';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import { formatNumberWithDot, getRandomFromList } from '../utils';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';

export const ClickedNodeContext = createContext();

export const GraphViewerPage = () => {
    const { displayUserMessage } = useContext(MessageContext);
    const screenWidth = useContext(ScreenWidthContext) || 1240;
    const [dagMode, setDagMode] = React.useState("Default")
    const [nodeDistance, setNodeDistance] = React.useState(100);
    const [selectedTab, setSelectedtab] = React.useState('meta_graph')
    const [metaGraphData, setMetaGraphData] = React.useState({ nodes: [], links: [] })
    const [objectGraphData, setObjectGraphData] = React.useState({ nodes: [], links: [] })
    const [loadingExpandedNodes, setLoadingExpandedNodes] = React.useState(false);
    const [selectedCollection, setSelectedCollection] = React.useState(null);
    const [leftClickElement, setLeftClickElement] = React.useState(null);
    const [labelProp, setLabelProp] = React.useState('')
    const [insightsData, setInsightsData] = React.useState({});
    const [editNodeData, setEditNodeData] = React.useState();
    const [editNodeType, setEditNodeType] = React.useState();
    const [isFlowLoading, setIsFlowLoading] = useState();
    const [startNodes, setStartNodes] = useState(undefined);
    const [paths, setPaths] = useState(2000);
    const [queryStats, setQueryStats] = useState(undefined);
    const [pathNodes, setPathNodes] = useState([]);
    const [linkA, setLinkA] = useState(undefined);
    const [linkB, setLinkB] = useState(undefined);
    const linkWidth = 1;
    const canvasWidth = screenWidth * 0.92
    const canvasHeight = 700
    const backgroundColor = "#ececec" // #ececec, #ececec
    const nodeResolution = 20
    const linkResolution = 8
    const [hoveredNode, setHoveredNode] = React.useState(undefined);

    // For Alert
    const [open, setOpen] = React.useState(false);
    const [secondsCounter, setSecondsCounter] = useState(0);
    const [alertSeverity, setAlertSeverity] = useState("warning");
    const [alertMessage, setAlertMessage] = useState("")

    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);

    useEffect(() => {
        setLoadingExpandedNodes(false);
    }, [objectGraphData])

    // Handles clicks inside the ForceGraph
    const onNodeLeftClick = (node) => {
        setLeftClickElement(node)
        if (selectedTab == 'meta_graph') {
            setTimeout(function () {
                setSelectedCollection(node.name);
            }, 250)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const onNodeRightClick = (node) => {
        if (selectedTab == 'meta_graph') {

        } else {
            const expandNodeQuery = async () => {
                setLoadingExpandedNodes(true);
                try {
                    const nodeId = node.id
                    let newGraphData = await EXPAND_NODE(nodeId)

                    // Process new nodes to remove duplicates
                    if (newGraphData.nodes !== undefined) {
                        let uniqueNodes = getUniqueNodes(newGraphData)
                        setObjectGraphData(prevData => ({
                            nodes: [...objectGraphData.nodes, ...uniqueNodes],
                            links: [...objectGraphData.links, ...newGraphData.links],
                        }));
                    }
                } catch (error) {
                    console.log(error)
                }
            };

            expandNodeQuery();
        }
    };
    const onLinkLeftClick = (link) => {
        console.log("Link Left Click: ", link);
        setLeftClickElement(link)
        if (selectedTab == 'meta_graph') {

        } else {

        }
    };
    const onLinkRightClick = (link) => {
        console.log("Link Right Click: ", link);
        if (selectedTab == 'meta_graph') {

        } else {

        }
    };

    const onItemHover = (item) => {
        setHoveredNode(item);
    }


    // Handles the click inside the Collection List in order to add a new node to the Graph Modeller
    const handleCollectionClick = (selectedItem) => {
        if (selectedItem != null) {
            setSelectedCollection(selectedItem);
        }
    };

    // Merges the current graphData with any new graphData that was retrieved through the user by expanding a node
    const getUniqueNodes = (newGraphData) => {
        let graphData = objectGraphData

        // Create a set to track existing node IDs in original graphData
        const existingNodeIds = new Set(graphData.nodes.map(node => node.id));

        // Filter out duplicate nodes from new graphData
        const uniqueNewNodes = newGraphData.nodes.filter(newNode => !existingNodeIds.has(newNode.id));
        return uniqueNewNodes;
    }

    // Gets the label prop from the backend
    const getLabelProp = async () => {
        try {
            const labelProp = await GET_LABEL_PROP();
            setLabelProp(labelProp);
        } catch (error) {
            console.error(error);
        }
    };

    // Gets the data for the meta graph
    const getMetaGraph = async () => {
        try {
            const meta_graph_data = await GET_META_GRAPH();
            setMetaGraphData(meta_graph_data);
        } catch (error) {
            console.error(error);
        }
    };

    const getFormattedTime = (time) => {
        const minutes = Math.floor(time / 60000);
        const seconds = ((time % 60000) / 1000).toFixed(0);

        if (minutes > 0) {
            return `${minutes} min. ${seconds < 10 ? '0' : ''}${seconds} sec.`;
        } else {
            return `${seconds} sec.`;
        }
    };


    // Gets the data for the object graph
    const getObjectGraph = async () => {
        try {
            setIsFlowLoading(true)
            let startTime = new Date();
            const object_graph_data = await GET_OBJECT_GRAPH(nodes, edges, startNodes, paths);
            let endTime = new Date();

            // Set query statistics
            let nodeCount = object_graph_data.nodes.length;
            let edgeCount = object_graph_data.links.length;
            let executionTime = endTime ? endTime - startTime : null;
            let stats = {
                nodeCount,
                edgeCount,
                executionTime
            }
            setQueryStats(stats)

            setIsFlowLoading(false)
            setObjectGraphData(object_graph_data);
            const emptyResultUserNote = nodeCount === 0 ? (
                " (Note that only full paths are displayed. Subgraphs are not contained in the result.)"
            ) : (
                ""
            )
            displayUserMessage("Flow executed!" + emptyResultUserNote, "success")

            setSelectedtab("object_graph")

            // Scroll down to tab when the insights analyzer tab is selected through a node
            const anchor = document.querySelector('#graph_tabs')
            if (anchor !== null && anchor !== undefined) {
                anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        } catch (error) {
            setIsFlowLoading(false)
            if (error.response !== undefined) {
                if (error.response.status === 444) {
                    displayUserMessage("The defined graph contains unconnected subgraphs or nodes, which is currently not supported. Please make sure that the graph is connected so that a path exists between any pair of nodes.", "error")
                } else if (error.response.status === 445) {
                    displayUserMessage("The defined graph contains invalid edges. Invalid edges are marked with an exclamation mark. Please make sure that all edges comply to the graph ontology.", "error")
                } else if (error.response.status === 446) {
                    displayUserMessage("The defined graph is empty. Please define a graph.", "error")
                } else if (error.response.status === 410) {
                    displayUserMessage("Query cancelled.", "warning")
                }
            } else {
                console.error(error);
                displayUserMessage("An error occured while loading the graph data. Please try again.", "error")
            }
        }
    };

    let alertTimeout;
    let alertTimeoutChangeMessage;

    // A random pun is displayed after x seconds of waiting on the query result to be returned.
    const puns = [
        "Why did Adele cross the road? To say hello from the other side.",
        "Time flies like an arrow. Fruit flies like a banana.",
        "To the guy who invented zero, thanks for nothing.",
        "Why was Dumbo sad? He felt irrelephant.",
        "A man sued an airline company after it lost his luggage. Sadly, he lost his case.",
        "I was wondering why the ball was getting bigger. Then it hit me.",
        "England doesn't have a kidney bank, but it does have a Liverpool.",
        "German sausage jokes are just the wurst.",
        "What do you call an alligator in a vest? An investigator.",
        "What did the sushi say to the bee? Wasabee!"
    ];
    useEffect(() => {
        // Display Alert to warn user about loading times after 5 seconds
        if (isFlowLoading) {
            setAlertSeverity("warning");
            setAlertMessage("Please hold on - Query is still processing.");
            alertTimeout = setTimeout(() => {
                setOpen(true);
            }, 8000);
            // Display random pun
            alertTimeoutChangeMessage = setTimeout(() => {
                const randomPun = getRandomFromList(puns);
                setAlertMessage("Please hold on - Query is still processing. " + randomPun);
            }, 22000);
        } else {
            // Cancel the alert if isLoading becomes false before 5 seconds
            clearTimeout(alertTimeout);
            clearTimeout(alertTimeoutChangeMessage);
            setOpen(false);
        }

        // Cleanup function to cancel the alert if the component unmounts
        return () => { clearTimeout(alertTimeout); clearTimeout(alertTimeoutChangeMessage); }
    }, [isFlowLoading]);

    useEffect(() => {
        // Update the seconds counter every second when isLoading is true
        let interval;
        if (isFlowLoading) {
            interval = setInterval(() => {
                setSecondsCounter((prevCounter) => prevCounter + 1);
            }, 1000);
        }

        // Cleanup function to stop updating the counter when isLoading is false
        setTimeout(() => {
            setSecondsCounter(1);
        }, 1000)
        return () => clearInterval(interval);
    }, [isFlowLoading]);


    // Getting meta graph data on initial rendering (because meta graph is default)
    useEffect(() => {
        getMetaGraph();
        getLabelProp();
    }, []);

    const handleCollectionInsightsAnalyzerClick = (tab, collectionName) => {
        setSelectedtab("intermediate_result_viewer")

        const updatedInsightsData = { collectionName: collectionName };
        setInsightsData(updatedInsightsData)

        // Scroll down to tab when the insights analyzer tab is selected through a node
        const anchor = document.querySelector('#graph_tabs')
        if (anchor !== null && anchor !== undefined) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const handleNodeEditClick = (flowType, editNodeData) => {
        setEditNodeType(flowType)
        setEditNodeData(editNodeData);
        setSelectedtab("node_editor")

        // Scroll down to tab when the insights analyzer tab is selected through a node
        const anchor = document.querySelector('#graph_tabs')
        if (anchor !== null && anchor !== undefined) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const killAllQueries = async () => {
        try {
            console.log("Killing all queries ...")
            await KILL_ALL_QUERIES();
            console.log("Killed")
            setIsFlowLoading(false)
        } catch (error) {
            console.log("Error: ", error)
        }
    }

    const explainFlow = () => {
        const explainFlowQuery = async () => {
            try {
                const explainResult = await EXPLAIN_FLOW(nodes, edges, startNodes, paths)
                console.log("Explain Result: ", explainResult)
                setPathNodes(explainResult)
            } catch (error) {
                console.log(error)
            }
        };

        explainFlowQuery();
    }

    return (
        <ClickedNodeContext.Provider value={
            {
                handleCollectionInsightsAnalyzerClick: handleCollectionInsightsAnalyzerClick,
                handleNodeEditClick: handleNodeEditClick
            }
        }>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item md={9}>
                            <div className="flowgraph_container">
                                <PathFlowModeller
                                    selectedCollection={selectedCollection}
                                    setSelectedTab={setSelectedtab}
                                    getObjectGraph={getObjectGraph}
                                    killAllQueries={killAllQueries}
                                    isFlowLoading={isFlowLoading}
                                    startNodes={startNodes}
                                    setStartNodes={setStartNodes}
                                    paths={paths}
                                    setPaths={setPaths}
                                    explainFlow={explainFlow}
                                    pathNodes={pathNodes}
                                    setPathNodes={setPathNodes}
                                />
                            </div>
                        </Grid>
                        <Grid item md={3}>
                            <CollectionList
                                handleCollectionClick={handleCollectionClick}
                            />
                        </Grid>
                    </Grid>
                    <Collapse in={open}>
                        <Alert
                            severity={alertSeverity}
                        >
                            {alertMessage} {alertSeverity === "warning" &&
                                "(" + secondsCounter + " sec.)"
                            }
                        </Alert>
                    </Collapse>
                </Grid>
                <Grid item xs={12}>
                    <GraphTabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedtab}
                    />
                    <TabContentContainer>
                        <div id='graph_tabs'>
                            {selectedTab == 'meta_graph' &&
                                <ForceGraph
                                    id="graphOntology"
                                    graphData={metaGraphData}
                                    setGraphData={setMetaGraphData}
                                    width={canvasWidth}
                                    height={canvasHeight}
                                    backgroundColor={backgroundColor}
                                    nodeResolution={nodeResolution}
                                    onNodeLeftClick={onNodeLeftClick}
                                    onNodeRightClick={onNodeRightClick}
                                    onLinkLeftClick={onLinkLeftClick}
                                    onLinkRightClick={onLinkRightClick}
                                    onItemHover={() => {}}
                                    textMode={1}
                                    labelProp={labelProp}
                                    linkWidth={linkWidth}
                                    linkResolution={linkResolution}
                                    nodeDistance={150}
                                />
                            }
                            {selectedTab == 'object_graph' && objectGraphData &&


                                <Stack direction="column" alignItems="flex-start" spacing={2}>
                                    {
                                        queryStats ? (

                                            <Stack
                                                direction="column"
                                                justifyContent="center"
                                                alignItems="flex-start"
                                                spacing={2}
                                            >
                                                <Stack
                                                    direction="row"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    spacing={2}
                                                >
                                                    <div><b>Nodes:</b> {formatNumberWithDot(queryStats.nodeCount)}</div>
                                                    <div><b>Edges:</b> {formatNumberWithDot(queryStats.edgeCount)}</div>
                                                    <div><b>Execution Time:</b> {getFormattedTime(queryStats.executionTime)}</div>
                                                </Stack>

                                                <div>
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="flex-start"
                                                        alignItems="center"
                                                        spacing={2}
                                                    >
                                                        <Autocomplete
                                                            options={[
                                                                "Outwards-radially",
                                                                "Inwards-radially",
                                                                "Top-down",
                                                                "Bottom-up",
                                                                "Left-right",
                                                                "Right-left",
                                                                "Near-to-far",
                                                                "Far-to-near",
                                                                "Default"]}
                                                            value={dagMode}
                                                            onChange={(event, newValue) => {
                                                                setDagMode(newValue)
                                                            }}
                                                            sx={{ width: 200 }}
                                                            renderInput={(params) => (
                                                                <TextField {...params} label={"View Mode"} variant="standard" />
                                                            )}
                                                        />
                                                        <TextField
                                                            id="nodeDistance"
                                                            label="Node Distance"
                                                            type="number"
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            value={nodeDistance}
                                                            onChange={(event, newValue) => {
                                                                setNodeDistance(event.target.value)
                                                            }}
                                                            variant="standard"
                                                        />
                                                        <ForceGraphExport graphData={objectGraphData} />
                                                        {loadingExpandedNodes &&
                                                            <div id="object_graph_loading">
                                                                Expanding nodes ...
                                                                <LinearProgress />
                                                            </div>
                                                        }
                                                        {hoveredNode && (hoveredNode.id || hoveredNode._id) && // .id is for nodes, ._id is for edges
                                                            <div id="currentNode">
                                                                <NodeEntry text={hoveredNode.id ? hoveredNode.id : hoveredNode._id} color={hoveredNode.color} />
                                                            </div>
                                                        }
                                                    </Stack>
                                                </div>
                                            </Stack>
                                        ) : (
                                            <div></div>
                                        )
                                    }
                                    <div>
                                        <Stack direction="row" spacing={2}>
                                            <div>
                                                <ForceGraph
                                                    id="graphExplorer"
                                                    graphData={objectGraphData}
                                                    setGraphData={setObjectGraphData}
                                                    width={!leftClickElement ? canvasWidth : canvasWidth * 0.75}
                                                    height={canvasHeight}
                                                    backgroundColor={backgroundColor}
                                                    nodeResolution={nodeResolution}
                                                    onNodeLeftClick={onNodeLeftClick}
                                                    onNodeRightClick={onNodeRightClick}
                                                    onLinkLeftClick={onLinkLeftClick}
                                                    onLinkRightClick={onLinkRightClick}
                                                    onItemHover={onItemHover}
                                                    textMode={0}
                                                    labelProp={labelProp}
                                                    linkWidth={linkWidth}
                                                    linkResolution={linkResolution}
                                                    dagMode={dagMode}
                                                    nodeDistance={nodeDistance}
                                                />
                                                <ForceGraphLegend graphData={objectGraphData} />
                                            </div>
                                            <NodeView leftClickElement={leftClickElement} setLeftClickElement={setLeftClickElement} />
                                        </Stack>
                                    </div>
                                </Stack>
                            }
                            {selectedTab == 'intermediate_result_viewer' &&
                                <div>
                                    <CollectionGrid
                                        insightsData={insightsData}
                                    />
                                </div>
                            }
                            {selectedTab == 'node_editor' &&
                                <div>
                                    {!editNodeData ? (
                                        <div>Please select a Node or an Edge in order to edit filters.</div>
                                    ) : (
                                        editNodeType === "node" ? (
                                            <NodeEditor
                                                editNodeData={editNodeData}
                                            />
                                        ) : (
                                            <EdgeEditor
                                                editEdgeData={editNodeData}
                                            />
                                        )
                                    )
                                    }
                                </div>
                            }
                        </div>
                    </TabContentContainer>
                </Grid>
            </Grid>
        </ClickedNodeContext.Provider>
    )
}