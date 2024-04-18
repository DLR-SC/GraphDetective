// https://reactflow.dev/docs/guides/state-management/

import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

// @ts-ignore
import EdgeData from '../interfaces/EdgeData.tsx';

export type UserData = {
  attribute: string,
  attributeType: string,
  operator: string,
  value: string,
  filterId: string
}

export type NodeData = {
  userData: UserData[],
  documentCount: number
};

export type RFState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  clearAll: () => void,
  loadAll: (nodes: Node<NodeData>[], edges: Edge<EdgeData>[]) => void,
  addNode: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
  addNodeCount: (nodeId: string, count: number) => void;
  addNodeFilter: (nodeId: string, filter: UserData) => void;
  deleteNodeFilter: (nodeId: string, filterId: string) => void;
  addEdgeFilter: (edgeId: string, filter: UserData) => void;
  deleteEdgeFilter: (edgeId: string, filterId: string) => void;
  updateEdgeData: (edgeData: EdgeData) => void;
  updateEdgePath: (isPath: boolean, edgeId: string) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  isNodeSource: (nodeId: string) => {
    /*
    A node x is a source node if all of the following conditions are met:
      1.: the list of edges is non-empty,
      1.: there exists an edge that has x set as its "source" property
      2.: there is no edge that has x set as its "target" property
    */

    // 1.:
    if (get().edges.length === 0) {
      return false;
    }
    // 2.:
    if(!get().edges.some(edge => edge.source === nodeId)) {
      return false;
    }
    // 3.:
    if (get().edges.some(edge => edge.target === nodeId)) {
      return false;
    }
    return true;
  },
  isNodeTarget: (nodeId: string) => {
    /*
    A node x is a target node if all of the following conditions are met:
      1.: the list of edges is non-empty,
      1.: there exists an edge that has x set as its "target" property
      2.: there is no edge that has x set as its "source" property
    */

    // 1.:
    if (get().edges.length === 0) {
      return false;
    }
    // 2.:
    if(!get().edges.some(edge => edge.target === nodeId)) {
      return false;
    }
    // 3.:
    if (get().edges.some(edge => edge.source === nodeId)) {
      return false;
    }
    return true;
  },
  onConnect: (connection: Connection) => {
    // Create updated Edge object
    const conn = {
      ...connection,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 40,
        height: 40,
        // color: '#FF0072',
      },
      type: "edge",
      animated: false
    };

    set({
      edges: addEdge(conn, get().edges),
    });
  },
  clearAll: () => {
    set(
      {
        nodes: []
      }
    )
    set(
      {
        edges: []
      }
    )
  },
  loadAll: (nodes: Node<NodeData>[], edges: Edge<EdgeData>[]) => {
    set(
      {
        nodes: nodes
      }
    )
    set(
      {
        edges: edges
      }
    )
  },
  addNode: (node: Node) => {
    set(
      {
        nodes: [...get().nodes, node]
      }
    )
  },
  deleteNode: (nodeId: string) => {
    // Get all nodes except the one that is deleted
    var updatedNodes = get().nodes.filter(node => {
      return node.id != nodeId;
    })
    set(
      {
        nodes: updatedNodes
      }
    )

    // Now delete all edges where the deleted node was connected to
    set({
      edges: get().edges.filter(edge =>
        (edge.source !== nodeId && edge.target !== nodeId))
    })
  },
  addNodeCount: (nodeId: string, count: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data.documentCount = count;
        }

        return node;
      }),
    });
  },
  addNodeFilter: (nodeId: string, filter: UserData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // Check if "userData" key exists and initialize it as an empty array if not
          if (!node.data.hasOwnProperty("userData")) {
            node.data.userData = [];
          }
          node.data.userData.push(filter);
        }

        return node;
      }),
    });
  },
  deleteNodeFilter: (nodeId: string, filterId: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // Check if "userData" key exists
          if (node.data.userData) {
            // Use the `filter` method to create a new array without the object that matches the ID
            node.data.userData = node.data.userData.filter((data) => data.filterId !== filterId);
          }
        }

        return node;
      }),
    });
  },
  addEdgeFilter: (edgeId: string, filter: UserData) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          // Check if "userData" key exists and initialize it as an empty array if not
          if (!edge.data.hasOwnProperty("userData")) {
            edge.data.userData = [];
          }
          edge.data.userData.push(filter);
        }

        return edge;
      }),
    });

  },
  deleteEdgeFilter: (edgeId: string, filterId: string) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          // Check if "userData" key exists
          if (edge.data.userData) {
            // Use the `filter` method to create a new array without the object that matches the ID
            edge.data.userData = edge.data.userData.filter((data:any) => data.filterId !== filterId);
          }
        }

        return edge;
      }),
    });
  },
  updateEdgeData: (edgeData: EdgeData) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeData.edgeId) {
          edge.data = edgeData;
        }
        return edge;
      })
    })
  },
  updateEdgePath: (isPath: boolean, edgeId: string) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          edge.animated = isPath;
        }
        return edge;
      })
    })
  }

}));

export default useStore;
