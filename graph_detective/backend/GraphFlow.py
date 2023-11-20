
from Node import Node
from Edge import Edge
from collections import deque
from itertools import chain

# Logging Setup
import sys
import logging
import colorlog
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
fmt = colorlog.ColoredFormatter(
    "%(log_color)s%(levelname)s | %(asctime)s | %(message)s")
stdout = colorlog.StreamHandler(stream=sys.stdout)
stdout.setFormatter(fmt)
logger.addHandler(stdout)


class GraphFlow:
    """
    A GraphFlow is a QGV that was created by the user in the front-end.
    It contains all nodes and edes of the QGV and provides functions to manipulate those.
    """

    def __init__(self, nodes: list, edges: list, name: str = "Flow"):
        self.name = name
        self.nodes = list()
        self.edges = list()
        # Will be filled later on once the root node has been identified
        self.depth_dict = dict()

        # Build internal representation of the QGV
        self._build_from_json(nodes, edges)

    def _are_nodes_connected(self, node1: Node, node2: Node):
        """
        Check whether the two nodes are connected in the QGV
        """
        
        return any(lambda edge: (
            (edge.source == node1 and edge.target == node2) or
            (edge.source == node2 and edge.target == node1)
        ))
    
    def get_vertex_collections(self):
        """
        Gets the collection names of the verticies present in the current flow.
        """
        vertex_names = list()
        for node in self.nodes:
            vertex_names.append(node.collection)
        return list(set(vertex_names))

    def get_edge_collections(self):
        edge_names = [edge.name for edge in self.edges]
        return list(set(edge_names))

    def update_traversal_directions(self, paths):
        """
        For each edge, this function adjusts the traversal direction
        to that of the query execution.
        If an edge appears as outgoing to the user, but will be traversed
        incoming through AQL, then the direction is switched.
        """

        for path in paths:
            """
            A path contains tuples of (edge, node). Edge defined sht edge that points
            towards node. Node is therefore a target node of the edge.
            If, however, the node is present at the source instead, the edge direction needs
            to be switched.
            """
            for edge, target_node in path:
                if not edge:
                    continue
                if edge.source == target_node:
                    tmp = edge.target
                    edge.source = edge.target
                    edge.target = tmp
        return paths


    def _dfs(self, node, visited):
        """
        Helper function for self.is_graph_connected()
        """
        
        # Mark the current node as visited
        visited[node] = True

        # Recur for all adjacent nodes (neighbors)
        for edge in self.edges:
            if edge.source == node or edge.target == node:
                neighbor = edge.target if edge.source == node else edge.source
                if not visited[neighbor]:
                    self._dfs(neighbor, visited)

    def is_graph_connected(self):
        """
        Checks whether the graph has any unconnected subgraphs.
        Performs a dfs on the graph starting with a random node.
        if not all nodes were visited during dfs, then the
        flow is considered to contain unconnected subgraphs.
        """

        # Dictionary to keep track of visited nodes
        visited = {node: False for node in self.nodes}

        # Perform DFS starting from any random node in the graph
        start_node = self.nodes[0]  # Get the first node in the list of nodes
        self._dfs(start_node, visited)

        # If all nodes have been visited, the graph is connected
        return all(visited.values())

    def _build_from_json(self, nodes: list, edges: list):
        """
        Builds the graph flow from nodes and edges given as json objects.
        """

        # Create the Node objects
        for node in nodes:
            node_obj = Node(id=node['id'],
                            collection=node['collection'],
                            conditions=node['userData'],
                            type=node['type'],
                            )
            self.nodes.append(node_obj)

        # Create the Edge objects
        for edge in edges:
            source_id = edge['source']
            target_id = edge['target']
            source_node = next(
                (node for node in self.nodes if node.id == source_id), None)
            target_node = next(
                (node for node in self.nodes if node.id == target_id), None)
            edge = Edge(id=edge['id'],
                        source=source_node,
                        target=target_node,
                        type=edge['type'],
                        name=edge['name'],
                        conditions=edge['userData'])
            self.edges.append(edge)
    
    def find_edges_by_node(self, node):
        """
        Based on the given list of nodes, this function finds its connected edges as well as the neighbours
        connected through that edge.        
        """

        node_edges = list()
        for edge in self.edges:
            if edge.source == node:
                node_edges.append(edge)
        return node_edges

    def print_flow(self):
        visited_edges = set()

        for node in self.nodes:
            neighbors = []
            for edge in self.edges:
                if edge.source == node and edge not in visited_edges:
                    neighbors.append((edge, edge.target))
                    visited_edges.add(edge)
            if neighbors:
                for neighbor_edge, neighbor_node in neighbors:
                    print(
                        f"{node.collection} (ID: {node.id}) - [{neighbor_edge.id}] - {neighbor_node.collection} (ID: {neighbor_node.id})")

    def find_source_nodes(self):
        """
        Finds and returns the source nodes in the flow.
        A source node is a node that has no incoming connections.
        """

        # Create a set of all target nodes in edges
        target_nodes = set(edge.target for edge in self.edges)

        # Filter nodes that are not in the set of target nodes
        nodes_without_incoming_edges = [node for node in self.nodes if node not in target_nodes]

        return nodes_without_incoming_edges
    
    def find_sink_nodes(self):
        """
        Finds and returns the sink nodes in the flow.
        A sink node is a node that has no outgoing connections.
        """

        # Create a set of all source nodes in edges
        source_nodes = set(edge.source for edge in self.edges)

        # Filter nodes that are not in the set of source nodes
        nodes_without_outgoing_edges = [node for node in self.nodes if node not in source_nodes]

        return nodes_without_outgoing_edges
    
    def find_source_to_sink_paths(self, source_nodes, sink_nodes, path=[], edge=None):
        """
        Finds and returns all source-to-sink paths in the QGV.
        """
        
        if not path:
            path = []

        paths = []
        for edge, node in source_nodes:
            new_path = path + [(edge, node)]
            if node in sink_nodes:
                paths.append(new_path)
            neighbors = [(edge, edge.target) for edge in self.edges if edge.source == node]
            paths.extend(self.find_source_to_sink_paths(neighbors, sink_nodes, new_path, edge))

        return paths

