import axios, { AxiosError } from "axios";
import {
    GET_COLLECTIONS_ENDPOINT,
    GET_ATTRIBUTES_ENDPOINT,
    GET_META_GRAPH_ENDPOINT,
    GET_LABEL_PROP_ENDPOINT,
    GET_OBJECT_GRAPH_ENDPOINT,
    GET_VALUE_OPTIONS_ENDPOINT,
    GET_EDGE_PROPS_ENDPOINT,
    GET_COLLECTION_COUNT_ENDPOINT,
    GET_COLLECTION_COLUMN_DEF_ENDPOINT,
    GET_PAGE_COLLECTIONS_ENDPOINT,
    GET_NODE_COUNT_ENDPOINT,
    CHECK_PATH_VALIDITY_ENDPOINT,
    KILL_ALL_QUERIES_ENDPOINT,
    PRINT_VIEWS_ENDPOINT,
    EXPLAIN_FLOW_ENDPOINT,
    EXPORT_GRAPH_ENDPOINT,
    PING_ENDPOINT,
    MODIFY_DATABASE_CONNECTION_ENDPOINT,
    GET_BACKEND_URL_ENDPOINT,
    EXPAND_NODE_ENDPOINT,
    EXPORT_GRAPHDATA_ENDPOINT
    //@ts-ignore
} from '../endpoints.tsx';

import { GraphDAO, GraphNODE, GraphEDGE, EdgeProp } from '../../dao/GraphDAO';

export const GET_COLLECTIONS = async () => {
    const response = await axios.get(GET_COLLECTIONS_ENDPOINT);
    return response.data;
}

export const GET_ATTRIBUTES = async (collection: any) => {
    const response = await axios.post(GET_ATTRIBUTES_ENDPOINT,
        {
            collection: collection
        }
    );
    return response.data;
}

export const GET_META_GRAPH = async () => {
    const response = await axios.post(GET_META_GRAPH_ENDPOINT);
    return response.data;
}

export const GET_OBJECT_GRAPH = async (nodes: any, edges: any, start_nodes: number, paths: number) => {
    // Map nodes to right form
    let nodeDAO: GraphNODE = nodes.map((node: any) => {
        return (
            {
                id: node.id,
                collection: node.data.collectionLabel ? node.data.collectionLabel : null,
                userData: node.data.userData ? node.data.userData : [],
                type: node.type
            }
        )
    })

    let edgeDAO: GraphEDGE = edges.map((edge: any) => {
        const edgeProps: EdgeProp = edge.data.props.map((prop: any) => {
            return (
                {
                    key: prop.key,
                    keyType: prop.userValueType,
                    value: prop.userValue
                }
            )
        })

        return (
            {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: edge.animated ? "path" : "edge",
                name: edge.data.name,
                userData: edge.data.userData ? edge.data.userData : []
            }
        )
    })

    const response = await axios.post(GET_OBJECT_GRAPH_ENDPOINT,
        {
            nodes: nodeDAO,
            edges: edgeDAO,
            startNodes: start_nodes ? start_nodes : null,
            paths: paths ? paths : null
        }
    )
    return response.data;

}

export const GET_LABEL_PROP = async () => {
    const response = await axios.get(GET_LABEL_PROP_ENDPOINT);
    return response.data;
}

export const GET_VALUE_OPTIONS = async (collectionLabel: string, attribute: string) => {
    const response = await axios.post(GET_VALUE_OPTIONS_ENDPOINT,
        {
            collectionLabel: collectionLabel,
            attribute: attribute
        }
    );
    return response.data;
}

export const GET_EDGE_PROPS = async (edgeId: string, sourceCollection: string, targetCollection: string) => {
    const response = await axios.post(GET_EDGE_PROPS_ENDPOINT,
        {
            edgeId: edgeId,
            sourceCollection: sourceCollection,
            targetCollection: targetCollection
        }
    );
    return response.data;
}

export const GET_COLLECTION_COUNT = async (collectionName: string) => {
    const response = await axios.post(GET_COLLECTION_COUNT_ENDPOINT,
        {
            collectionName: collectionName
        }
    );
    return response.data;
}

export const GET_COLLECTION_COLUMN_DEF = async (collectionName: string) => {
    const response = await axios.post(GET_COLLECTION_COLUMN_DEF_ENDPOINT,
        {
            collectionName: collectionName
        }
    );
    return response.data;
}

export const GET_PAGE_COLLECTIONS = async (
    collectionName: string,
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: string,
    filterField: string,
    filterOperator: string,
    filterValue: string | number | Date | object,
    filterColType: string
) => {
    const response = await axios.post(GET_PAGE_COLLECTIONS_ENDPOINT,
        {
            collectionName: collectionName,
            page: page,
            pageSize: pageSize,
            sortKey: sortKey,
            sortDirection: sortDirection,
            filterField: filterField,
            filterOperator: filterOperator,
            filterValue: filterValue,
            filterColType: filterColType
        }
    );
    return response.data;
}

export const GET_NODE_COUNT = async (userData: any, collectionName: string) => {
    const response = await axios.post(GET_NODE_COUNT_ENDPOINT,
        {
            collectionName,
            userData
        }
    );
    return response.data;
}

export const CHECK_PATH_VALIDITY = async (collectionA: string, collectionB: string) => {
    const response = await axios.post(CHECK_PATH_VALIDITY_ENDPOINT,
        {
            collectionA: collectionA,
            collectionB: collectionB
        }
    );
    return response.data;
}

export const KILL_ALL_QUERIES = async () => {
    const response = await axios.post(KILL_ALL_QUERIES_ENDPOINT);
    return response.data;
}

export const PRINT_VIEWS = async () => {
    const response = await axios.post(PRINT_VIEWS_ENDPOINT);
    return response.data;
}

export const EXPLAIN_FLOW = async (nodes: any, edges: any, start_nodes: number, paths: number) => {
    // Map nodes to right form
    let nodeDAO: GraphNODE = nodes.map((node: any) => {
        return (
            {
                id: node.id,
                collection: node.data.collectionLabel ? node.data.collectionLabel : null,
                userData: node.data.userData ? node.data.userData : [],
                type: node.type
            }
        )
    })

    let edgeDAO: GraphEDGE = edges.map((edge: any) => {
        const edgeProps: EdgeProp = edge.data.props.map((prop: any) => {
            return (
                {
                    key: prop.key,
                    keyType: prop.userValueType,
                    value: prop.userValue
                }
            )
        })

        return (
            {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: edge.animated ? "path" : "edge",
                name: edge.data.name,
                userData: edge.data.userData ? edge.data.userData : []
            }
        )
    })
    const response = await axios.post(EXPLAIN_FLOW_ENDPOINT,
        {
            nodes: nodeDAO,
            edges: edgeDAO,
            startNodes: start_nodes ? start_nodes : null,
            paths: paths ? paths : null
        }
    );
    return response.data;
}

export const EXPORT_GRAPH = async (graphData: object, exportMode: string) => {
    const response = await axios.post(EXPORT_GRAPH_ENDPOINT,
        {
            graph_data: graphData,
            export_mode: exportMode
        }
    );
    return response.data;
}

export const PING = async () => {
    const response = await axios.get(PING_ENDPOINT);
    return response.data;
}

export const MODIFY_DATABASE_CONNECTION = async (
    sc_file: object | undefined) => {
    const response = await axios.post(MODIFY_DATABASE_CONNECTION_ENDPOINT,
        {
            sc_file: sc_file
        }
    );
    return response.data;
}

export const GET_BACKEND_URL = async () => {
    const response = await axios.get(GET_BACKEND_URL_ENDPOINT);
    return response.data;
}

export const EXPAND_NODE = async (
    nodeId: string) => {
    const response = await axios.post(EXPAND_NODE_ENDPOINT,
        {
            nodeId: nodeId
        }
    );
    return response.data;
}

export const EXPORT_GRAPHDATA = async (graphData: object, exportData: object) => {
    const response = await axios.post(EXPORT_GRAPHDATA_ENDPOINT,
        {
            graph_data: graphData ? graphData : [],
            export_data: exportData ? exportData : []
        }
    );
    return response.data;
}