import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { AttributeEditor } from './AttributeEditor';
import { OperatorEditor } from './OperatorEditor';
import { ValueEditor } from './ValueEditor';
import Chip from '@mui/material/Chip';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { makeid } from '../../utils';
import { FlowButton } from '../user_components/FlowButton';
import List from '@mui/material/List';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import { GET_NODE_COUNT } from '../../backend/services/collection.tsx';

// @ts-ignore
import useStore from '../../store/store.ts';

// @ts-ignore
import { NodeEditorItem } from './NodeEditorItem.tsx';

export const NodeEditor = ({
    editNodeData,
}) => {
    // Obtain node information and functions from the React Flow State
    const nodes = useStore((state) => state.nodes);
    const addNodeFilter = useStore((state) => state.addNodeFilter);
    const deleteNodeFilter = useStore((state) => state.deleteNodeFilter);
    const addNodeCount = useStore((state) => state.addNodeCount);

    // Define variables to handle the user inputs
    const [editNode, setEditNode] = useState();
    const [attributeOptions, setAttributeOptions] = useState([]);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [selectedAttributeType, setSelectedAttributeType] = useState(null);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [selectedValue, setSelectedValue] = useState('');

    useEffect(() => {
        setSelectedAttribute(null);
        setAttributeOptions([]);
        setSelectedAttributeType(null);
        setSelectedOperator(null);
        setSelectedValue('');
    }, [editNodeData])

    function updateEditNode() {
        // Find node with correct id from the list of all nodes in the React Flow canvas
        const n = nodes.find((node) => node.id === editNodeData.id)
        setEditNode(n);

        // Extract the attribute options of that node
        setAttributeOptions(n.data.attributeOptions);
    }

    // Extract some basic node data for easier data access
    useEffect(() => {
        if (editNodeData) {
            updateEditNode();
        }
    }, [editNodeData])

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
        deleteNodeFilter(editNode.id, filterId);
        getNodeCount();
    }

    // Get number of documents in the collection with the current filters applied
    const getNodeCount = async () => {
        if (true) {
        try {
            addNodeCount(editNode.id, -2);
            const count = await GET_NODE_COUNT(editNode.data.userData, editNodeData.collectionLabel);
            if (count.count !== undefined) {
                let c = count.count
                // if (c >= 1000 && editNode.data.userData.length > 0) {
                //     c = "1000+";
                // }
                addNodeCount(editNode.id, c);
            } else {
                addNodeCount(editNode.id, -1)
            }
        } catch (error) {
            console.error(error);
            addNodeCount(editNode.id, -1)
        }
    }
    };

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
        addNodeFilter(editNodeData.id, filter);
        getNodeCount();
    }

    return (

        <div>
            <Divider>
                <Chip
                    icon={<DocumentScannerIcon />}
                    label={editNodeData.collectionLabel}
                    className="documentLabel"
                />
            </Divider>
            {editNode && (
                <div style={{ marginBottom: "2em", backgroundColor: "white", padding: "1em" }}>
                    {/* <Grid item xs={6}> */}
                    {/* <div onClick={() => { console.log(nodes) }}>Test</div> */}
                    {/* Header to display the Collection name / node name */}

                    <br />
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={2} direction="column" justifyContent="center"
                            alignItems="center">

                            {/* The list of already defined node filters */}
                            {/* For each node that has custom user values attached, display it here */}
                            <Grid item>
                                <Typography variant="subtitle2" display="block" gutterBottom>
                                    <b>Defined Filters</b>
                                </Typography>


                                {editNode.data.userData ? (
                                    <List>
                                        <TransitionGroup>
                                            {editNode.data.userData.map((opt, index) => {
                                                return (
                                                    <Collapse key={index}>
                                                        <NodeEditorItem
                                                            property={opt.attribute}
                                                            operator={opt.operator.label}
                                                            value={opt.value}
                                                            filterId={opt.filterId}
                                                            onDelete={onDelete}
                                                        />
                                                    </Collapse >
                                                )
                                            })
                                            }
                                        </TransitionGroup>
                                    </List>
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