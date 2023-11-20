export interface Filter {
    attribute: string,
    attributeType: string,
    operator: string,
    value: object
}

export interface GraphNODE {
    id: string,
    collection: string,
    userData: Filter[] | [],
    type: "node" | "connector"
}

export interface EdgeProp {
    key: string,
    keyType: string, // 'userValueType'
    value: string,
}

export interface GraphEDGE {
    id: string,
    source: string,
    target: string,
    type: "edge" | "path", // can be obtained by looking at the 'animated' value
    name: string,
    userData: Filter[] | [],
}

export interface GraphDAO {
    nodes: Array<GraphNODE>,
    edges: Array<GraphEDGE>,
}