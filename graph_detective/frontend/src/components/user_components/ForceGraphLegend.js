import Stack from '@mui/material/Stack';

export const NodeEntry = ({ text, color, count }) => {
    return <div className="legendEntry">
        <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
        >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color }} />
            <div>{text} {count !== undefined && (<span style={{color: "#757575", fontFamily: "Consolas,monaco,monospace" }}>({count})</span>)}</div>
        </Stack>
    </div>
}

export const ForceGraphLegend = ({ graphData }) => {

    const { nodes } = graphData
    if (nodes === undefined || nodes.length === 0) {
        return <div />
    }

    // Counting unique collections
    var collectionCounts = {};

    // Iterate through the array
    nodes.forEach(function(node) {
        if (node.hasOwnProperty("collection")) {
            // Check if the name already exists in the dictionary
            if (collectionCounts[node.collection]) {
                // Increment the count if the name already exists
                collectionCounts[node.collection]++;
            } else {
                // Initialize the count to 1 if the name doesn't exist
                collectionCounts[node.collection] = 1;
            }
        }
    });

    // Extract unique collection names and colours
    let collections = [];
    nodes.forEach(node => {
        const collname = node.id.split('/')[0];
        const name = node.collection
        const color = node.color;

        if (!collections.some(item => item.name === name)) {
            const coll = {
                name: name,
                color: color,
                id: collname
            }
            collections.push(coll);
        }
    });

    return (
        <div id="object_graph_legend">
            {collections.map((collection, index) => {
                return (
                    <div key={index}>
                        <NodeEntry
                            text={collection.name}
                            color={collection.color}
                            count={collectionCounts[collection.name]}
                        />
                    </div>
                )
            }
            )}
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
            >
            </Stack>
        </div>
    );
}