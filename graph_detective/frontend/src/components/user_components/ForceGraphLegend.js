import Stack from '@mui/material/Stack';

const NodeEntry = ({ collectionName, color }) => {
    return <div className="legendEntry">
        <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
        >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color }} />
            <div>{collectionName}</div>
        </Stack>
    </div>
}

export const ForceGraphLegend = ({ graphData }) => {

    const { nodes } = graphData
    if (nodes === undefined || nodes.length === 0) {
        return <div />
    }

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
                            collectionName={collection.name}
                            color={collection.color}
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