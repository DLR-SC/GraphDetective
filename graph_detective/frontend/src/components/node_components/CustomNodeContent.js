import React, { useEffect, useState, useContext } from 'react';
import { NodeHeader } from './NodeHeader';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ClickedNodeContext } from '../../pages/GraphViewerPage';
import Badge from '@mui/material/Badge';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { GET_COLLECTION_COUNT } from '../../backend/services/collection.tsx';

export const CustomNodeContent = ({ data }) => {
    const { handleNodeEditClick } = useContext(ClickedNodeContext);
    const collectionLabel = data.collectionLabel
    const [nodeCount, setNodeCount] = useState(-1)

    useEffect(() => {
        if (data.hasOwnProperty("documentCount")) {
            const count = data.documentCount;
            setNodeCount(count);
        }
    }, [data.documentCount])

    useEffect(() => {
        // Get the total number of documents in the collection
        const getCollectionCount = async () => {
            try {
                const collectionCount = await GET_COLLECTION_COUNT(collectionLabel);
                console.log("CC: ", collectionCount.count)
                setNodeCount(collectionCount.count);
            } catch (error) {
                console.error(error);
            }
        };

        getCollectionCount();
    }, [])

    return (
        <Card variant="outlined" className="nodeCard">
            <CardContent className="reactFlowCardContent nodeCardContent">
                <NodeHeader label={collectionLabel} nodeCount={nodeCount} />
                {!data.hasOwnProperty("userData") || data.userData.length === 0 ? (
                    <FilterAltIcon
                        onClick={() => handleNodeEditClick("node", data)}
                        className="hover"
                    />
                ) : (
                    <Badge
                        badgeContent={data.userData.length}
                        color="primary"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <FilterAltIcon
                            onClick={() => handleNodeEditClick("node", data)}
                            className="hover"
                        />
                    </Badge>
                )
                }
            </CardContent>
        </Card >
    );
}