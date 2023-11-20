import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { AttributeEditor } from './../node_components/AttributeEditor';
import { OperatorEditor } from './../node_components/OperatorEditor';
import { ValueEditor } from './../node_components/ValueEditor';
import Chip from '@mui/material/Chip';
import LinkIcon from '@mui/icons-material/Link';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { makeid } from '../../utils';
import { FlowButton } from '../user_components/FlowButton';
import BlockIcon from '@mui/icons-material/Block';

// @ts-ignore
import useStore from '../../store/store.ts';

// @ts-ignore
import { NodeEditorItem } from './../node_components/NodeEditorItem.tsx';

export const EdgeEditor = ({
    editEdgeData
}) => {
    // Obtain edge information and functions from the React Flow State
    const edges = useStore((state) => state.edges);
    const addEdgeFilter = useStore((state) => state.addEdgeFilter);
    const deleteEdgeFilter = useStore((state) => state.deleteEdgeFilter);

    // Define variables to handle the user inputs
    const [editEdge, setEditEdge] = useState();
    const [attributeOptions, setAttributeOptions] = useState([]);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [selectedAttributeType, setSelectedAttributeType] = useState(null);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [selectedValue, setSelectedValue] = useState('');

    function updateEditEdge() {
        // Find edge with correct id from the list of all nodes in the React Flow canvas
        const e = edges.find((edge) => edge.id === editEdgeData.edgeId)
        setEditEdge(e);

        // Extract the attribute options of that node
        setAttributeOptions(e.data.props);
    }

    // Extract some basic edge data for easier data access
    useEffect(() => {
        if (editEdgeData) {
            updateEditEdge();
        }
    }, [editEdgeData])

    // Set the datatype of the selected attribute, if any is selected by the user
    useEffect(() => {
        const att = attributeOptions.find((att) => att.key == selectedAttribute)
        if (att !== undefined) {
            const attType = att.datatype
            setSelectedAttributeType(attType)
        }

        // If attribute has changed, reset the operator and value fields
        setSelectedOperator(null);
        setSelectedValue('');
    }, [selectedAttribute])

    // Delete a filter condition from the list of user defined filter conditions
    const onDelete = (filterId) => {
        deleteEdgeFilter(editEdge.id, filterId)
    }

    // Add a filter condition with the values currently present in the "selectedXY" variables
    const onAdd = () => {
        const filterId = makeid(12);
        const filter = {
            attribute: selectedAttribute,
            attributeType: selectedAttributeType,
            operator: selectedOperator,
            value: selectedValue,
            filterId: filterId
        };
        addEdgeFilter(editEdgeData.edgeId, filter);
    }

    return (
        <>
            {!attributeOptions || attributeOptions.length === 0 ? (
                <div>
                    <BlockIcon />
                    <div>No Properties available. This could have two reasons:
                        <ol>
                            <li>There are no properties for this collection (unlikely).</li>
                            <li>The edge is invalid (likely). Check the Graph Ontology for the existence of this edge.</li>
                        </ol>
                    </div>
                </div>
            ) : (

                <div>
                    {editEdge && (
                        <div style={{ marginBottom: "2em", backgroundColor: "white", padding: "1em" }}>
                            {/* <div onClick={() => { console.log(edges) }}>Test</div> */}
                            {/* Header to display the Collection name / node name */}
                            <Divider>
                                <Chip
                                    style={{ backgroundColor: "#d8e071" }}
                                    icon={<LinkIcon />}
                                    label={editEdgeData.name}
                                />
                            </Divider>
                            <br />
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Grid container spacing={2} direction="column" justifyContent="center"
                                    alignItems="center">

                                    {/* The list of already defined edge filters */}
                                    {/* For each attribute that has custom user values attached, display it here */}
                                    <Grid item>
                                        <Typography variant="subtitle2" display="block" gutterBottom>
                                            <b>Defined Filters</b>
                                        </Typography>

                                        {editEdge.data.userData ? (
                                            editEdge.data.userData.map((opt, index) => {
                                                return (
                                                    <div key={index}>
                                                        <NodeEditorItem
                                                            property={opt.attribute}
                                                            operator={opt.operator.label}
                                                            value={opt.value}
                                                            filterId={opt.filterId}
                                                            onDelete={onDelete}
                                                        />
                                                    </div>

                                                )
                                            })
                                        ) : (
                                            <div>---</div>
                                        )
                                        }

                                        {/* The input elements to add a new filter to the list */}
                                        <Box sx={{ width: '100%', marginTop: "2em" }}>
                                            <Typography variant="subtitle2" display="block" gutterBottom>
                                                <b>Add Filter</b>
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                justifyContent="center"
                                                alignItems="center"
                                                spacing={2}
                                            >
                                                <div>
                                                    <AttributeEditor
                                                        attributeOptions={attributeOptions.map((item) => item.key)}
                                                        selectedAttribute={selectedAttribute}
                                                        setSelectedAttribute={setSelectedAttribute}
                                                    />
                                                </div>
                                                <div>
                                                    <OperatorEditor
                                                        selectedOperator={selectedOperator}
                                                        setSelectedOperator={setSelectedOperator}
                                                        selectedAttributeType={selectedAttributeType}
                                                    />
                                                </div>
                                                <div>
                                                    <ValueEditor
                                                        selectedValue={selectedValue}
                                                        setSelectedValue={setSelectedValue}
                                                        valueOptions={[]}
                                                        selectedAttributeType={selectedAttributeType}
                                                    />
                                                </div>
                                                <div>
                                                    <FlowButton
                                                        label={"Add"}
                                                        onClick={onAdd}
                                                        color="#b9cad2"
                                                        endIcon={<AddIcon />}
                                                        isDisabled={!(selectedAttribute && selectedOperator && selectedValue)}
                                                    />
                                                </div>
                                            </Stack>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </div>
                    )
                    }
                </div >
            )
            }
        </>
    )

}