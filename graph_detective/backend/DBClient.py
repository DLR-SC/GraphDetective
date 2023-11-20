import json
from arango import ArangoClient
from arango.http import DefaultHTTPClient
from itertools import product
from datetime import datetime
from aql_queries import (
    GET_DOCUMENTS_SORT_LIMIT,
    GET_DOCUMENTS_FILTER_LIMIT_USING_COLLECTION,
    GET_DOCUMENTS_FILTER_LIMIT_USING_VIEW,
    UNION_START_NODES,
    GET_DOCUMENTS_SORT_FILTER_LIMIT_USING_COLLECTION,
    GET_DOCUMENTS_SORT_FILTER_LIMIT_USING_VIEW,
    GET_DOCUMENT_COUNT_FILTERS_USING_COLLECTION,
    GET_DOCUMENTS_FILTERS_USING_COLLECTION,
    GET_DOCUMENT_COUNT_FILTERS_USING_VIEW,
    GET_DOCUMENTS_FILTERS_USING_VIEW,
    GET_GRAPH,
    EXPAND_NODE
)
import math
from GraphFlow import GraphFlow
import utils
from itertools import chain
from Node import Node

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


class LongHTTPClient(DefaultHTTPClient):
    REQUEST_TIMEOUT = 600


# CONSTANTS
DB_HOST = "DB_HOST"
DB_PORT = "DB_PORT"
DB_GRAPH = "DB_GRAPH"
DB_NAME = "DB_NAME"
DB_USER = "DB_USER"
DB_PASSWORD = "DB_PASSWORD"
DB_LABEL_ATTRIBUTE = "DB_LABEL_ATTRIBUTE"
SYSTEM_PROPS = ["_key", "_id", "_rev", "_from", "_to"]
FROM_VERTEX_COLLECTIONS = "from_vertex_collections"
TO_VERTEX_COLLECTIONS = "to_vertex_collections"
COLLECTION = "collection"
ATTRIBUTE = "attribute"
ATTRIBUTE_TYPE = "attributeType"
OPERATOR = "operator"
VALUE = "value"
LOOP_VAR = "doc"
P = "p"
START_NODES_VAR = "start_nodes"
VERTEX_COLLECTIONS = "vertex_collections"
EDGE_COLLECTIONS = "edge_collections"
MIN = "min"
MAX = "max"
BASE_DIRECTION = "base_direction"
INBOUND = "INBOUND"
OUTBOUND = "OUTBOUND"
ANY = "ANY"
NUMBER_OF_START_NODES = 1000


class DBClient:

    def __init__(self,
                 config_path=None,
                 config_file=None,
                 colours_path=None,
                 edges_path=None,
                 edges_file=None,
                 collection_map_path=None,
                 collection_map_file=None,
                 collection_views=None,
                 collection_views_file=None
                 ):

        # Main database configuration
        if config_path:
            with open(config_path, "r") as f:
                self.conf_parms = json.load(f)
        elif config_file:
            self.conf_parms = config_file
        else:
            logging.error(
                "Database parameters could not be set. No edges path or edges file was provided")
            return None

        # Edges between collections. These have to be manually provided
        if edges_path:
            with open(edges_path, "r") as f:
                self.meta_edges = json.load(f)
        elif edges_file:
            self.meta_edges = edges_file
        else:
            logging.error(
                "Edge parameters could not be set. No edges path or edges file was provided")
            return None

        # List of colours to display in the graph
        with open(colours_path, "r") as f:
            self.colours = f.read().splitlines()

        # Mappings of database collection names to human readable collection names
        if collection_map_path:
            with open(collection_map_path, "r") as f:
                self.collection_map = json.load(f)
                self.collection_map_reversed = dict(
                    (v, k) for k, v in self.collection_map.items())
        elif collection_map_file:
            self.collection_map = collection_map_file
            self.collection_map_reversed = dict(
                (v, k) for k, v in self.collection_map.items())
        else:
            logging.error(
                "Collection map parameters could not be set. No collection map path or collection map file was provided")
            return None

        # Names of any views that a collection has and should be used during querying
        if collection_views:
            with open(collection_views, "r") as f:
                self.collection_views = json.load(f)
        elif collection_views_file:
            self.collection_views = collection_views_file
        else:
            logging.error(
                "Collection map parameters could not be set. No collection map path or collection map file was provided")
            return None

        # Database settings
        self.host = self.conf_parms[DB_HOST]
        self.port = self.conf_parms[DB_PORT]
        self.graph_name = self.conf_parms[DB_GRAPH]
        self.db_name = self.conf_parms[DB_NAME]
        self.db_user = self.conf_parms[DB_USER]
        self.db_password = self.conf_parms[DB_PASSWORD]
        self.label_prop = self.conf_parms[DB_LABEL_ATTRIBUTE]
        self.system_props = SYSTEM_PROPS

        # Database client and database objects
        self.client = ArangoClient(
            hosts=f'{self.host}:{self.port}', http_client=LongHTTPClient())
        self.db = self.client.db(
            self.db_name, username=self.db_user, password=self.db_password)
        self.graph = self.db.graph(self.graph_name)
        self.collections = self.graph.vertex_collections()
        self.edges = self.graph.edge_definitions()

        # print("COLLS: ", self.collections)
        # Colours of documents in graph
        self.vertex_colors = {coll: colo for coll, colo in zip(
            self.collections[:len(self.colours)], self.colours)}
        
        # print("COlours: ", self.vertex_colors)

        # User flows
        self.flow = None
        self.flows = list()


    def collection_exist(self, collection_name: str):
        """
        Checks whether the given collection name exists in the graph.
        """

        return self.db.has_collection(collection_name)


    def _get_view(self, collection_name: str):
        """
        Gets the name of the view of the given collection type.
        If existing, the view name must be passed through a configuration file upon instantiating this class.
        """
        
        collection_name = self.transform(collection_name)
        return self.collection_views.get(collection_name, None)


    def _has_view(self, collection_name: str):
        """
        Checks whether the given collection name has a view or not.
        """
        collection_name = self.transform(collection_name)
        return bool(self._get_view(collection_name))


    def has_edge(self, node_a: str | Node, node_b: str | Node, use_graph_definition: bool = False):
        """
        Checks whether an exists edge between the two given collections.
        If `use_graph_definition` is True, the validity is checked based of the
        actual graph definition rather than the manually provided and custom meta edges.
        """

        # If nodes are of type Node, then extract only their collection names
        if isinstance(node_a, Node):
            node_a = node_a.collection
        if isinstance(node_b, Node):
            node_b = node_b.collection

        # Ensure that node names are that of the database
        coll_a = self.transform(node_a)
        coll_b = self.transform(node_b)

        # Case: Using graph edge definitions
        if use_graph_definition:
            for edge_definition in self.edges:
                source_colls = edge_definition[FROM_VERTEX_COLLECTIONS]
                target_colls = edge_definition[TO_VERTEX_COLLECTIONS]
                if (coll_a in source_colls) and (coll_b in target_colls):
                    return True
                if (coll_a in target_colls) and (coll_b in source_colls):
                    return True

        # Case: Using manually provided, custom meta edges
        if (coll_a in self.meta_edges) and (coll_b in self.meta_edges[coll_a]):
            return True

        if (coll_b in self.meta_edges) and (coll_a in self.meta_edges[coll_b]):
            return True

        return False

    def get_edge(self, source_coll: str, target_coll: str, ignore_dir: bool = True):
        """
        Returns the edge between the two given collections.
        If `ignore_dir` is True, the direction of the edge
        is ignored.
        """

        if not self.has_edge(source_coll, target_coll):
            return None

        for edge in self.edges:
            if source_coll in edge['from_vertex_collections'] and target_coll in edge['to_vertex_collections']:
                return edge
            if ignore_dir:
                if source_coll in edge['to_vertex_collections'] and target_coll in edge['from_vertex_collections']:
                    return edge

        return None

    def is_flow_valid(self, flow):
        """
        Returns a boolean indicating whether any of the edges is invalid.
        Returns a tuple, where the first item indicates whether or not the flow is valid and the
        second item indicates the reason, in case that the flow is invalid.
        """

        if not flow.nodes:
            logger.error(
                "The defined flow is empty.")
            return False, -3

        # Check if graph is connected to avoid unexpected results or even errors
        if not flow.is_graph_connected():
            logger.error(
                "The defined flow contains unconnected subgraphs or nodes.")
            return False, -1

        if not all([self.has_edge(edge.source, edge.target) for edge in flow.edges]):
            logger.error(
                "The defined flow contains invalid edges.")
            return False, -2

        return True, None

    def edge_direction(self, collection_a: str, collection_b: str, use_graph_definition: bool = False):
        """
        Checks the direction of the edge between the two collections in the graph definition.
        If an edge exists between the two given collections, this function returns its
        direction. If `use_graph_definition` is True, the direction is checked based of the
        actual graph definition rather than the manually provided and custom meta edges.
        Returns:
            -1, if collection_a is the target node and collection_b is the source node (i.e. inbound edge)
            0, if the edge does not exists between the two given nodes (i.e. invalid edge)
            1, if collection_a is the source node and collection_b is the target node (i.e. outbound edge)
        """

        coll_a = self.transform(collection_a)
        coll_b = self.transform(collection_b)

        # Case: Using graph edge definitions
        if use_graph_definition:
            for edge_definition in self.edges:
                source_colls = edge_definition[FROM_VERTEX_COLLECTIONS]
                target_colls = edge_definition[TO_VERTEX_COLLECTIONS]

                # Outbound a -> b
                if (coll_a in source_colls and coll_b in target_colls):
                    return 1

                # Inbound a <- b
                if (coll_a in target_colls and coll_b in source_colls):
                    return -1

        # Case: Using manually provided, custom meta edges
        if coll_a in self.meta_edges:
            # Outbound a -> b
            if coll_b in self.meta_edges[coll_a]:
                return 1

        if coll_b in self.meta_edges:
            # Inbound a <- b
            if coll_a in self.meta_edges[coll_b]:
                return -1

        return 0

    def get_collection(self, collection_name: str):
        """
        Gets the collection objects from the graph based on the given collection name
        """

        collection_name = self.transform(collection_name)
        return self.db.collection(collection_name)

    def transform(self, collection_name: str, to_db_name: bool = True):
        """
        Transforms the given collection name into either the name that it is represented with in the database
        (if `to_db_name` is true) or into its human readably term (if `to_db_name` is set to false)
        """

        if to_db_name:
            return self.collection_map_reversed.get(collection_name, collection_name)
        return self.collection_map.get(collection_name, collection_name)

    def estimate_column_width(self,
                              collection_name: str,
                              property_name: str,
                              data_type: str,
                              sample_size: int = 5,
                              min_width: int = 50,
                              scale: int = 2,
                              max_width: int = 180
                              ):
        """
        Estimates how many characters values of the given collection have on average.
        This is used to set the column width for the column display in the Collection
        Analyzer in the Frontend. Material-UI does not support automatic column widths
        based on the content, so this function is a work around to estimate the column
        width for each column.

        It retrieves a set of samples from the given collection and averages the number
        of characters. Only works for text and number columns. If the collection is not
        of such type, thebase width is returned.
        """

        # Return fixed widths for dates and other objects
        if data_type in ["date", "datetime"]:
            return min_width * 2
        if data_type not in ["text", "number"]:
            return min_width

        collection_name = self.transform(collection_name)
        total_length = 0
        # Iterate over random documents to retrieve their lengths
        if self.collection_exist(collection_name):
            for _ in range(sample_size):
                collection = self.get_collection(collection_name)
                doc = collection.random()
                if property_name in doc.keys():
                    value = doc[property_name]
                    if data_type == "number":
                        value = str(value)
                    if value:
                        total_length += len(value)
        else:
            return min_width

        # Average value length of the given property
        average = int(total_length / sample_size)

        # Get dynamic column width (capped at `max_width`)
        width = int(min(scale*(average), max_width))

        # If calculated column width is smaller than `min_width`, use `min_width` instead
        width = max(width, min_width)
        return width

    def _map_operator(self, operator: str):
        mapping = {
            'equals': 'equals',
            'equals_not': 'equalsNot',
            'alphabetic_contains': 'contains',
            'alphabetic_contains_not': 'containsNot',
            'alphabetic_starts_with': 'startsWith',
            'alphabetic_ends_with': 'endsWith',
            'numeric_equals': '=',
            'numeric_smaller_than': '<',
            'numeric_smaller_or_equal': '<=',
            'numeric_larger_than': '>',
            'numeric_larger_or_equal': '>=',
            'date_smaller_than': 'before',
            'date_smaller_or_equal': 'onOrBefore',
            'date_larger_than': 'after',
            'date_larger_or_equal': 'onOrAfter',
        }
        return mapping[operator]

    def build_aql_condition(self,
                            field: str,
                            operator: str,
                            value: str,
                            datatype: str,
                            loop_var: str,
                            bind_vars: dict,
                            prepend_filter_clause=False,
                            uses_view=False
                            ):
        """
        Builds the conditional part of an AQL 'FILTER' statement
        """

        if not value or not datatype:
            filter_statement = "true"
        else:
            # Prepare a randomly named bind parameter. Random in order to avoid name collisions when this function is called multiple times for the same query
            bind_field = f"field_{utils.generate_random_string(10)}"
            bind_value = f"value_{utils.generate_random_string(10)}"

            # Case: Text
            if datatype == "text":
                if uses_view:
                    operator_map = {
                        'contains': f'PHRASE({loop_var}.@{bind_field}, @{bind_value}, "text_en") /* "{field}" contains "{value}" */',
                        'containsNot': f'{loop_var}.@{bind_field} NOT IN TOKENS(@{bind_value}) /* "{field}" does not "{value}" */',
                        'equals': f'{loop_var}.@{bind_field} == @{bind_value} /* "{field}" equals "{value}" */',
                        'equalsNot': f'{loop_var}.@{bind_field} != @{bind_value} /* "{field}" does not equal "{value}" */',
                        'startsWith': f'STARTS_WITH({loop_var}.@{bind_field}, @{bind_value}) /* "{field}" starts with "{value}" */',
                        # 'endsWith': f'STARTS_WITH(REVERSE({loop_var}.@{bind_field}), REVERSE(@{bind_value}))'
                    }
                else:
                    operator_map = {
                        'contains': f'CONTAINS(LOWER({loop_var}.@{bind_field}), LOWER(@{bind_value})) /* "{field}" contains "{value}" */',
                        'containsNot': f'NOT CONTAINS(LOWER({loop_var}.@{bind_field}), LOWER(@{bind_value})) /* "{field}" does not "{value}" */',
                        'equals': f'LOWER({loop_var}.@{bind_field}) == LOWER(@{bind_value}) /* "{field}" equals "{value}" */',
                        'equalsNot': f'LOWER({loop_var}.@{bind_field}) != LOWER(@{bind_value}) /* "{field}" does not equal "{value}" */',
                        'startsWith': f'STARTS_WITH({loop_var}.@{bind_field}, @{bind_value}) /* "{field}" starts with "{value}" */',
                        # 'endsWith': f'STARTS_WITH(REVERSE({loop_var}.@{bind_field}), REVERSE(@{bind_value}))'
                    }

            # Case: Number
            elif datatype == "number":
                if uses_view:
                    operator_map = {
                        '=': f'{loop_var}.@{bind_field} == @{bind_value} /* "{field}" equals "{value}" */',
                        '!=': f'{loop_var}.@{bind_field} != @{bind_value} /* "{field}" does not equal "{value}" */',
                        '<': f'{loop_var}.@{bind_field} < @{bind_value} /* "{field}" smaller than "{value}" */',
                        '>': f'{loop_var}.@{bind_field} > @{bind_value} /* "{field}" larger than "{value}" */',
                        '<=': f'{loop_var}.@{bind_field} <= @{bind_value} /* "{field}" smaller or equal "{value}" */',
                        '>=': f'{loop_var}.@{bind_field} >= @{bind_value} /* "{field}" larger or equal "{value}" */',
                    }
                else:
                    operator_map = {
                        '=': f'{loop_var}.@{bind_field} == @{bind_value} /* "{field}" equals "{value}" */',
                        '!=': f'{loop_var}.@{bind_field} != @{bind_value} /* "{field}" does not equal "{value}" */',
                        '<': f'{loop_var}.@{bind_field} < @{bind_value} /* "{field}" smaller than "{value}" */',
                        '>': f'{loop_var}.@{bind_field} > @{bind_value} /* "{field}" larger "{value}" */',
                        '<=': f'{loop_var}.@{bind_field} <= @{bind_value} /* "{field}" smaller or equal "{value}" */',
                        '>=': f'{loop_var}.@{bind_field} >= @{bind_value} /* "{field}" larger or equal "{value}" */',
                    }

            # Case: Date
            elif datatype in ["date", "datetime"]:
                operator_map = {
                    'equals': f'{loop_var}.@{bind_field} == DATE_ISO8601(@{bind_value}) /* "{field}" equals "{value}" */',
                    'is': f'{loop_var}.@{bind_field} == DATE_ISO8601(@{bind_value}) /* "{field}" equals "{value}" */',
                    'isNot': f'{loop_var}.@{bind_field} != DATE_ISO8601(@{bind_value}) /* "{field}" does not equal "{value}" */',
                    'after': f'{loop_var}.@{bind_field} > DATE_ISO8601(@{bind_value}) /* "{field}" after "{value}" */',
                    'before': f'{loop_var}.@{bind_field} < DATE_ISO8601(@{bind_value}) /* "{field}" before "{value}" */',
                    'onOrAfter': f'{loop_var}.@{bind_field} >= DATE_ISO8601(@{bind_value}) /* "{field}" on or after "{value}" */',
                    'onOrBefore': f'{loop_var}.@{bind_field} <= DATE_ISO8601(@{bind_value}) /* "{field}" on or before "{value}" */',
                }

            # Add bind variables for the query (the field names and their value)
            bind_vars[bind_field] = field
            bind_vars[bind_value] = value

            # Sometimes, due to the frontend, the same operator moght have different names. Normalize the names here.
            if operator not in operator_map:
                operator = self._map_operator(operator)
            filter_statement = operator_map[operator]

        # If necessary, prepend a "SEARCH" or "FILTER" clause to the statement
        if prepend_filter_clause:
            if uses_view:
                filter_statement = f'SEARCH {filter_statement}'
            else:
                filter_statement = f'FILTER {filter_statement}'
        return filter_statement, bind_vars

    def build_aql_path_filter(self, path, bind_vars):
        """
        `path` is a list of tuples, where the first item of each tuple is an Edge
        and the second item in each tuple is a Node.
        This function creates a FILTER statement for an AQL query,
        where each statement filters a complete path.
        """

        filters = list()
        filter_statement = ''
        # 1.: Iterate each element in the path
        for index, (edge, node) in enumerate(path):
            # 2.: Create all conditional clauses for the edge and store them in a list
            if edge:
                edge_filters, bind_vars = self._build_edge_filter(
                    depth=index,
                    edges=[edge],
                    bind_vars=bind_vars,
                    p=P
                )
                filters.extend(edge_filters)

            # 3.: Create all conditional clauses for the node and store them in the same list
            node_filters, bind_vars = self._build_node_filter(
                depth=index,
                nodes=[node],
                bind_vars=bind_vars,
                p=P
            )
            filters.extend(node_filters)

            # 4.: Combine all conditional statements and combine them in a string using AND
            joined_filters = ' AND '.join(filters)

            # 5.: Surround statement by round brackets
            filter_statement = f'({joined_filters})'
        return filter_statement, bind_vars

    def _is_system_prop(self, attribute: str):
        return attribute in self.system_props

    def get_collection_attributes(self, collection_name: str, include_system_props: bool = False):
        """
        For the given collection name, this functions gets the available properties as well as
        the sample document from which the property names were inferred.
        """

        collection_name = self.transform(collection_name)
        sample_doc = dict()
        attributes = list()
        if self.collection_exist(collection_name):

            # Collection object
            collection = self.get_collection(collection_name)

            # get random doc as a representative example
            sample_doc = collection.random()
            if sample_doc:
                # Retrieve the keys of that document (they are the attributes)
                attributes = list(sample_doc.keys())

                # Remove any system properties if desired
                if not include_system_props:
                    attributes = [
                        att for att in attributes if not self._is_system_prop(att)]
        return attributes, sample_doc

    def get_meta_graph(self):
        """
        Obtains the meta graph.
        """

        # Get Nodes
        nodes = list()
        for index, collection in enumerate(self.collections):
            node = {
                "id": collection,
                "name": self.collection_map.get(collection, collection),
                "color": self.colours[index % len(self.colours)]
            }
            nodes.append(node)

        # Get Edges
        edges = list()
        # print("META EDGES: ", self.meta_edges.items())
        for source, targets in self.meta_edges.items():
            for target in targets:
                edge = {
                    "source": source,
                    "target": target,
                }
                edges.append(edge)

        # Combine to graph data
        graph_data = {
            "nodes": nodes,
            "links": edges
        }

        return graph_data

    def infer_datatype(self, val: str | list | dict):
        """
        Infers the datatype of the given value.
        `value` will typically come straight out of the graph database and is
        likely of type "string". The underlying type of data must be inferred
        based of that string.
        For example, a string could contain "01.01.2000", which is actually a date,
        rather than a plain string.
        """

        if not val:
            return val, "text"
        # Check for dict
        if isinstance(val, dict):
            return val, "dict"
        # Check for list
        if isinstance(val, list):
            return val, "list"
        # Check for number (int or float)
        try:
            # Casting to float is valid for both, ints and floats
            float_val = float(val)
            return float_val, "number"
        except:
            pass

        # Check Boolean
        if isinstance(val, bool):
            return val, "boolean"
        if val.lower() == "true":
            return True, "boolean"
        if val.lower() == "false":
            return False, "boolean"

        # Check for date and datetime
        datetime_formats = [
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%d %H:%M:%S.%f",
            "%Y-%m-%d %H:%M:%S.%z",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M:%S%z"
        ]

        # Checking datetime
        for dt_format in datetime_formats:
            try:
                datetime_val = datetime.strptime(val, dt_format)
                return datetime_val, 'datetime'
            except ValueError:
                continue

        # Checking date
        try:
            date_val = datetime.strptime(val, "%Y-%m-%d")
            return date_val, 'date'
        except ValueError:
            return val, 'text'

    def get_collection_props(self, coll_name: str, include_system_props: bool = False):
        # Retrieve all attributes from the collection
        coll_props, collection = self.get_collection_attributes(
            coll_name, include_system_props)

        # For each property, store its name (key), a sample value and inferred datatype
        coll_props = list()
        if collection:
            for key, value in collection.items():
                _, datatype = self.infer_datatype(value)
                entry = {
                    "key": key,
                    "sampleValue": value,
                    "datatype": datatype
                }
                coll_props.append(entry)
        return coll_props

    def get_collection_count(self, collection_name: str):
        """
        Returns the total document count in the given collection.
        """

        # Return the number of documents in this collection
        collection_name = self.transform(collection_name)
        count = 0
        if self.collection_exist(collection_name):
            collection = self.get_collection(collection_name)
            count = collection.count()
        return count

    # TODO there are like 3 functions that get the properties of a collection.
    def get_collection_column_def(self, collection_name: str):
        """
        Retrieves only the property names of the given collection.
        """

        # Retrieve the properties of the given collection name
        coll_props = self.get_collection_props(
            collection_name, include_system_props=True)
        return coll_props

    def replace_none_in_dict(self, list_of_dicts, replacement=""):
        for d in list_of_dicts:
            for key, value in d.items():
                if value is None:
                    d[key] = replacement
        return list_of_dicts

    def get_collections_by_page(self,
                                collection_name: str,
                                page: int,
                                page_size: int,
                                sort_key: str = None,
                                sort_direction: str = None,
                                filter_field: str = None,
                                filter_operator: str = None,
                                filter_value: str = None,
                                filter_column_type: str = None):
        """
        Gets excerpt of documents from given collection (based on given range).
        This function returns the documents for a specific collection, index range, 
        sorting order and filter options.
        """

        if not collection_name:
            return []

        collection_name = self.transform(collection_name)
        has_view = self._has_view(collection_name)
        view_name = self._get_view(collection_name)
        page_collections = list()

        offset = page * page_size

        # Case 1: Sorting and filtering is irrelevant, use python arango driver
        if not sort_key and not filter_value:
            if self.collection_exist(collection_name):
                collection = self.get_collection(collection_name)
                page_collections = collection.all(
                    skip=offset,
                    limit=page_size
                )
                page_collections = list(page_collections)
                page_collections = self.replace_none_in_dict(page_collections)
                return page_collections

        # Case 2: Sort: Yes, Filter: No
        elif sort_key and not filter_value:
            bind_vars = {
                '@collection': collection_name,
                'attribute': sort_key,
                'direction': sort_direction,
                'offset': offset,
                'limit': page_size
            }
            aql_query = GET_DOCUMENTS_SORT_LIMIT

        # Case 3: Sort: No, Filter: Yes
        elif not sort_key and filter_value:
            loop_var = 'doc'
            bind_vars = {
                'offset': offset,
                'limit': page_size
            }
            filter_statement, bind_vars = self.build_aql_condition(
                field=filter_field,
                operator=filter_operator,
                value=filter_value,
                datatype=filter_column_type,
                loop_var=loop_var,
                bind_vars=bind_vars,
                uses_view=has_view,
            )
            if has_view:
                bind_vars['@view'] = view_name
                aql_query = GET_DOCUMENTS_FILTER_LIMIT_USING_VIEW.format(
                    loop_var=loop_var, filter=filter_statement)
            else:
                bind_vars['@collection'] = collection_name
                aql_query = GET_DOCUMENTS_FILTER_LIMIT_USING_COLLECTION.format(
                    loop_var=loop_var, filter=filter_statement)

        # Case 4: Sort: Yes, Filter: Yes
        else:
            loop_var = 'doc'
            bind_vars = {
                'attribute': sort_key,
                'direction': sort_direction,
                'offset': offset,
                'limit': page_size
            }
            filter_statement, bind_vars = self.build_aql_condition(
                field=filter_field,
                operator=filter_operator,
                value=filter_value,
                datatype=filter_column_type,
                loop_var=loop_var,
                bind_vars=bind_vars
            )
            if has_view:
                bind_vars['@view'] = view_name
                aql_query = GET_DOCUMENTS_SORT_FILTER_LIMIT_USING_COLLECTION.format(
                    loop_var=loop_var, filter=filter_statement)
            else:
                bind_vars['@collection'] = collection_name
                aql_query = GET_DOCUMENTS_SORT_FILTER_LIMIT_USING_VIEW.format(
                    loop_var=loop_var, filter=filter_statement)

        # Execute query with the prepared bind_vars and aql_query
        cursor = self.db.aql.execute(
            aql_query,
            bind_vars=bind_vars,
            cache=True,
        )
        page_collections = list(cursor)
        page_collections = self.replace_none_in_dict(page_collections)

        return page_collections

    def get_node_count(self, userData: list, collection_name: str):
        """
        Given the passed arguments, this function gets the number of documents that meet the filter conditions.
        """

        # Case: there are no filter conditions. Get collection count
        if not userData:
            return self.get_collection_count(collection_name)

        loop_var = LOOP_VAR
        collection_name = self.transform(collection_name)
        aql_filter_statements = list()
        has_view = self._has_view(collection_name)
        view_name = self._get_view(collection_name)
        bind_vars = dict()
        for filter in userData:
            attribute = filter[ATTRIBUTE]
            attributeType = filter[ATTRIBUTE_TYPE]
            operator = filter[OPERATOR][VALUE]
            value = filter[VALUE]

            filter_statement, bind_vars = self.build_aql_condition(
                field=attribute,
                operator=operator,
                value=value,
                datatype=attributeType,
                loop_var=loop_var,
                bind_vars=bind_vars,
                prepend_filter_clause=(not has_view),
                uses_view=has_view
            )
            aql_filter_statements.append(filter_statement)

        # If collection has a view, then the query will use ArangoSearch
        if has_view:
            filters = ' AND '.join(aql_filter_statements)
            aql_query = GET_DOCUMENT_COUNT_FILTERS_USING_VIEW.format(
                loop_var=loop_var, filter_statements=filters)
            bind_vars['@view'] = view_name
        else:
            filters = ' '.join(aql_filter_statements)
            aql_query = GET_DOCUMENT_COUNT_FILTERS_USING_COLLECTION.format(
                loop_var=loop_var, filters=filters)
            bind_vars['@collection'] = collection_name
        cursor = self.db.aql.execute(
            aql_query,
            bind_vars=bind_vars,
            cache=True
        )
        count = cursor.next()
        cursor.close()
        return count

    def _get_node_with_lowest_count(self, nodes: list):
        """
            Counts the number of relevant documents for each node in the `nodes` list.
            'Relevant document' refers to the documents of a collection that statisfy the
            given condition of the node (e.g. the user specified that a TextNode must contain
            the word "airplane" in its 'text' property).
            Returns the one that has the least amount of relevant documents.

            If a node is filtered on system properties, the total document count of this
            collection is used instead.

            Arguments:
            - nodes: list, The list of nodes passed from the frontend
        """

        min_doc_count = float('inf')
        min_doc = None
        for node in nodes:
            collection = node[COLLECTION]
            if node['type'] == "connector":
                continue

            document_count = self.get_node_count(node['userData'], collection)

            if document_count < min_doc_count:
                min_doc_count = document_count
                min_doc = node

        return min_doc

    def _build_node_filter(self, depth: str, nodes: list, bind_vars: dict, p):
        """
        For the given depth, nodes and filters, this function creates a AQL FILTER statement.

        Arguments:
        - nodes: list This is a list of Node objects
        """

        logger.info("Creating conditional node filters")

        # Create the conditions for each node
        node_filters = list()
        loop_var = "{p}.vertices[{index}]".format(p=p, index=depth)
        for node in nodes:
            # 1. Create condition for collection (e.g. IS_SAME_COLLECTION(p.vertices[1], "TextNode"))
            bind_var_name = utils.generate_random_string(10)
            bind_vars[bind_var_name] = self.transform(node.collection)
            cond_collection = f'(IS_SAME_COLLECTION({loop_var}, @{bind_var_name})) /* Vertex at depth {depth} is of "{bind_vars[bind_var_name]}" collection */ '
            node_filters.append(cond_collection)

            for condition in node.conditions:
                attribute = condition[ATTRIBUTE]
                attributeType = condition[ATTRIBUTE_TYPE]
                operator = condition[OPERATOR][VALUE]
                value = condition[VALUE]

                # 2. Create condition for (sole) property (e.g. p.vertices[index].name == "Peter")
                cond_property, bind_vars = self.build_aql_condition(
                    field=attribute,
                    operator=operator,
                    value=value,
                    datatype=attributeType,
                    loop_var=loop_var,
                    bind_vars=bind_vars
                )
                cond_property = f"({cond_property})"
                node_filters.append(cond_property)
        return node_filters, bind_vars

    def _build_edge_filter(self, depth: str, edges: list, bind_vars: dict, p):
        """
        For the given depth, edges and filters, this function creates a AQL FILTER statement.

        Arguments:
        - edges: list This is a list of Edge objects
        """

        logger.info("Creating conditional edge filters")

        # Create conditions for each edge
        edge_filters = list()
        loop_var = "{p}.edges[{index}]".format(p=p, index=depth-1)
        for edge in edges:
            if not edge.conditions:
                continue

            for condition in edge.conditions:
                value = condition[VALUE]
                if not value:
                    continue

                # Create EdgeProperty instance for easier data handling
                attribute = condition[ATTRIBUTE]
                attribute_type = condition[ATTRIBUTE_TYPE]
                operator = condition[OPERATOR][VALUE]

                # Create condition for property (e.g. p.edges[0]._key == 50)
                cond_property, bind_vars = self.build_aql_condition(field=attribute,
                                                                    operator=operator,
                                                                    value=value,
                                                                    datatype=attribute_type,
                                                                    loop_var=loop_var,
                                                                    bind_vars=bind_vars)
                edge_filter = f"({cond_property})"
                edge_filters.append(edge_filter)
        return edge_filters, bind_vars

    def compose_mixed_edge_directions_statement(self, edges: list):
        """
        Composed the part of a AQL Graph Traversal statement that specifies the
        direction for individual edges.
        #traversing-in-mixed-directions
        See: https://www.arangodb.com/docs/stable/aql/graphs-traversals.html
        """

        label_dict = {}

        # Group edges by their name
        for edge in edges:
            name = edge.name
            direction = edge.direction

            if name not in label_dict:
                label_dict[name] = [direction]
            else:
                directions = label_dict[name]
                directions.append(direction)
                label_dict[name] = directions

        # Identify which name has multiple directions
        edge_directions = {}
        for edge_name, directions in label_dict.items():
            unique_directions = list(set(directions))
            if not unique_directions:
                continue
            elif len(unique_directions) > 1:
                edge_directions[edge_name] = ANY
            elif unique_directions[0] == -1:
                edge_directions[edge_name] = INBOUND
            else:
                edge_directions[edge_name] = OUTBOUND

        parts = list()
        for edge_name, direction in edge_directions.items():
            part = f'{direction} {edge_name}'
            parts.append(part)
        stmt = ', '.join(parts)
        return stmt

    def _merge_edges(self, edge0, edge1, merge_colls):
        """Merges two edges if the both have the same end point in one of the merge collections

        Args:
            edge0 (dict): First edge dict
            edge1 (dict): Second edge dict
            merge_colls (List(str)): List of names of merge collections

        Returns:
            dict, int: resulting edge dict, and number of edges to be skipped in path for next merge
        """
        s0 = edge0["_from"]
        s0c, s0k = s0.split("/")
        t0 = edge0["_to"]
        t0c, t0k = t0.split("/")
        if (s0c not in merge_colls) and (t0c not in merge_colls):
            return edge0, 0
        s1 = edge1["_from"]
        s1c, s1k = s1.split("/")
        t1 = edge1["_to"]
        t1c, t1k = t1.split("/")
        if t0c in merge_colls:
            if t0c == s1c:
                return {
                    "_id": s0k + "-" + t1k,
                    "_from": s0,
                    "_to": t1
                }, 1
            if t0c == t1c:
                return {
                    "_id": s0k + "-" + s1k,
                    "_from": s0,
                    "_to": s1
                }, 1
        if s0c in merge_colls:
            if s0c == s1c:
                return {
                    "_id": t1k + "-" + t0k,
                    "_from": t1,
                    "_to": t0
                }, 1
            if s0c == t1c:
                return {
                    "_id": s1k + "-" + t0k,
                    "_from": s1,
                    "_to": t0
                }, 1
        return None, 99999

    def _extract_edges_path(self, in_edges, merge_colls=[]):
        """Form a contracted path by merging edges ending in specified merge collections

        Args:
            in_edges (List[dict]): List of edge dicts forming a path
            merge_colls (List[str], optional): List of names of merge collections. Defaults to [].

        Returns:
            List[dict]: List of edge dicts forming a contracted path
        """
        if len(merge_colls) == 0:
            return in_edges
        out_edges = []
        pos0 = 0
        while pos0 < len(in_edges):
            edge0 = in_edges[pos0]
            pos1 = 1
            while pos0 + pos1 < len(in_edges):
                edge1 = in_edges[pos0 + pos1]
                edge_res, shift = self._merge_edges(edge0, edge1, merge_colls)
                if shift == 0:
                    out_edges.append(edge_res)
                    pos0 += pos1
                    pos1 = 99999
                else:
                    edge0 = edge_res
                    pos1 += shift
            if pos0 + pos1 == len(in_edges):
                s0 = edge0["_from"]
                s0c = s0.split("/")[0]
                t0 = edge0["_to"]
                t0c = t0.split("/")[0]
                if (s0c not in merge_colls) and (t0c not in merge_colls):
                    out_edges.append(edge0)
                pos0 += pos1
        return out_edges

    def _prepare_vertex(self, vertex, size=8, color=None, index=None):
        """
        Takes a dictionary `v` that represents a vertext from the database
        1. Replace the "_id" key with an "id" key
        2. Assigns a size at which the node is displayed when rendered
        3. Assigns a color to the node

        vertex : dict
            The vertex coming straight from the database result set

        size : int
            Size of the node. Defaults to 5.

        color : str
            Colour of the node. Defaults to None at which a random color is assigned.
        """

        # Effectively rename "_id" key with "id"
        vertex["id"] = vertex.pop("_id")

        # Size of the node when displayed in graph
        vertex["val"] = size

        # Assign color to node
        mapped_id = self.transform(
            vertex["id"].split("/")[0])
        vertex["color"] = color if color else self.vertex_colors.get(
            mapped_id, "lightgray")
        vertex["collection"] = self.transform(mapped_id, to_db_name=False)

        return vertex

    def _generate_objects_graph(self, db_path_data, has_paths=False, increase_root_nodes=False):
        """
        Converts a path that is queried and returned by an AQL query in ArangoDB into a format
        that can be parsed by ReactForceGraph3D. The function builds a dictionary consisting
        of the two lists `nodes` and `links`.

        db_path_data : Cursor
            The original data returned from ArangoDB. This is the path returned from the query.
            It should be the result of a `FOR v, e, p [...] RETURN p` query in AQL.
        """

        # if has_paths:
        # db_path_data = list(chain(*db_path_data))

        graph_data = {
            "nodes": [],
            "links": []
        }
        vdict = {}
        vdone = []
        edone = []
        merge_colls = []
        for p in db_path_data:
            # Case: The flow does not have any paths (i.e. only a single collection has been specified).
            # In this case, the structure looks like this:
            # p: [{'vertices':{'vertices':[]}}, ...]
            if not has_paths:
                for index, vertices in enumerate(p['vertices']):
                    v = self._prepare_vertex(vertices, index)

                    # Add node to list of nodes rendered in the graph
                    graph_data["nodes"].append(v)

            # Case: `p` is a dict containing both vertecies and edges. Occurs when user queries a path of length > 1
            else:
                # Extract index of vertecies returned from the graph
                for index, v in enumerate(p["vertices"]):
                    v = self._prepare_vertex(v)

                    if increase_root_nodes:
                        if index == 0:
                            v["val"] = 100
                        else:
                            v["val"] = 5

                    # Add vertex to list of vertecies
                    vdict[v["id"]] = v

                # Extract edges and their source/target nodes and build an index from them
                for e in self._extract_edges_path(p["edges"], merge_colls):
                    if e["_id"] in edone:
                        continue
                    else:
                        edone.append(e["_id"])

                    # Get and handle source node of this edge
                    e["source"] = e.pop("_from")
                    if e["source"] not in vdone:
                        graph_data["nodes"].append(vdict[e["source"]])
                        vdone.append(e["source"])

                    # Get and handle target node of this edge
                    e["target"] = e.pop("_to")
                    if e["target"] not in vdone:
                        graph_data["nodes"].append(vdict[e["target"]])
                        vdone.append(e["target"])

                    # Assign color to edge
                    e["color"] = self.vertex_colors.get(
                        e["_id"].split("/")[0], "dimgray")

                    # Add edge to index that is displayed using ForceGraph3D
                    graph_data["links"].append(e)
        # self.graph_data = graph_data
        return graph_data

    def execute_flow_71(self, flow_data: list):
        """
        Obdated for issue #71
        Obtains the object graph based on the provided graph data.
        The graph data contains the complete graph flow that the user
        modelled in the user interface.
        """

        # Preprocessing
        logger.info("Parsing React Flow")
        nodes = flow_data['nodes']
        edges = flow_data['edges']
        start_nodes = flow_data['startNodes']
        start_nodes = int(start_nodes) if start_nodes else start_nodes
        paths = flow_data['paths']
        paths = int(paths) if paths else paths

        # Create GraphFlow object. Will handle operations and calculations on the flow
        self.flow = GraphFlow(nodes, edges)

        # If Flow is invalid, return
        valid, reason = self.is_flow_valid(self.flow)
        if not valid:
            return reason

        # Step 1.1: Obtain all source nodes (can be from multiple collections)
        source_nodes = self.flow.find_source_nodes()
        sink_nodes = self.flow.find_sink_nodes()

        number_of_source_collections = len(source_nodes)
        number_of_start_nodes = NUMBER_OF_START_NODES
        number_of_docs_per_collection = math.floor(
            number_of_start_nodes/number_of_source_collections)

        # Step 1.2: Create start node query to query all starts nodes
        start_node_query = ''
        bind_vars = dict()
        # Holds the variable names in the AQL statements, that need to be merged later on
        start_node_vars = list()
        for i, source_node in enumerate(source_nodes):
            filters = list()
            query_var = f'{LOOP_VAR}_{i}'
            collection = source_node.collection
            has_view = self._has_view(collection)
            view_name = self._get_view(collection)

            # Iterate all node conditions in order to create the according node filters (FILTER statements9)
            for condition in source_node.conditions:
                filter_aql, bind_vars = self.build_aql_condition(
                    field=condition[ATTRIBUTE],
                    operator=condition[OPERATOR][VALUE],
                    value=condition[VALUE],
                    datatype=condition[ATTRIBUTE_TYPE],
                    loop_var=LOOP_VAR,
                    bind_vars=bind_vars,
                    prepend_filter_clause=(not has_view),
                    uses_view=has_view
                )
                filters.append(filter_aql)

            # If a view exists for the collection type, then use views to query the nodes
            if has_view:
                filters = 'SEARCH ' + \
                    '\nAND\n '.join(filters) if filters else ''
                aql_start_nodes = GET_DOCUMENTS_FILTERS_USING_VIEW.format(
                    query_var=query_var,
                    loop_var=LOOP_VAR,
                    view=view_name,
                    filters=filters,
                    limit=f'LIMIT {start_nodes}' if start_nodes and start_nodes > 0 else f'LIMIT {number_of_docs_per_collection}'
                )

            # If no view exists for the collection type, then iterate the collection normally without using views
            else:
                # bind_vars[f'@collection_{i}'] = self.transform(collection)
                filters = ' '.join(filters)
                aql_start_nodes = GET_DOCUMENTS_FILTERS_USING_COLLECTION.format(
                    query_var=query_var,
                    loop_var=LOOP_VAR,
                    collection=self.transform(collection),
                    filters=filters,
                    limit=f'LIMIT {start_nodes}' if start_nodes and start_nodes > 0 else f'LIMIT {number_of_docs_per_collection}'
                )

            # Append current query to the query that gets all start nodes
            start_node_query = start_node_query + ' \n' + aql_start_nodes

            # Save the loop var for later
            start_node_vars.append(query_var)

        # Create merge query
        aql_union_start_nodes = UNION_START_NODES.format(
            var=START_NODES_VAR,
            lists=', '.join(start_node_vars)
        )

        start_node_query = start_node_query + ' \n' + aql_union_start_nodes
        # print("Start Node Query: ", start_node_query)

        # Step 2.1: Find all paths from start nodes to sink nodes. Treat edges as directed, only follow from source to target
        source_nodes_edges = [(None, node) for node in source_nodes]
        s2s_paths = self.flow.find_source_to_sink_paths(
            source_nodes_edges, sink_nodes)

        # Step 2.2: Create graph traversal query (AQL)
        # For each path, create a seperate filter statement
        filter_statements = list()
        for path in s2s_paths:
            filter_statement, bind_vars = self.build_aql_path_filter(
                path,
                bind_vars
            )
            filter_statements.append(filter_statement)

        # Step 3: Combine queries
        statements = '\nOR\n'.join(filter_statements)
        aql_filter_statement = f"FILTER ({statements})"

        # Step 4: Add the edge direction part of the graph traversal query
        s2s_paths = self.flow.update_traversal_directions(s2s_paths)
        for edge in self.flow.edges:
            dir = self.edge_direction(
                collection_a=edge.source.collection,
                collection_b=edge.target.collection)
            edge.direction = dir  # -1: inbound, 1: outbound, =: undirected
        dir_stmt = self.compose_mixed_edge_directions_statement(
            self.flow.edges)

        # STEP 5: Compose final query
        min_depth = 0
        max_depth = len(max(s2s_paths, key=len))-1
        vertex_collections = self.flow.get_vertex_collections()
        vertex_collections = [self.transform(
            vertex_name) for vertex_name in vertex_collections]
        edge_collections = self.flow.get_edge_collections()
        # allowed vertex collections to traverse
        bind_vars[VERTEX_COLLECTIONS] = vertex_collections
        # allowed edge collections to traverse
        bind_vars[EDGE_COLLECTIONS] = edge_collections
        bind_vars[MIN] = min_depth  # minimum traversal depth
        bind_vars[MAX] = max_depth  # maximum traversal depth (= longest path)
        # bind_vars['graph_name'] = self.graph_name
        aql_query = GET_GRAPH.format(
            start_nodes_aql_query=start_node_query,
            start_nodes_var=START_NODES_VAR,
            base_direction=ANY,
            edge_directions=dir_stmt,
            path_filters=aql_filter_statement,
            graph_stmt=f"GRAPH '{self.graph_name}'" if not dir_stmt else "",
            limit=f'LIMIT {paths}' if paths and paths > 0 else ''
        )
        print("Flow Query: ", aql_query)
        # print("Bind Vars: ", bind_vars)
        for key, value in bind_vars.items():
            print(key, ":", value)

        cursor = list()
        try:
            cursor = self.db.aql.execute(
                aql_query,
                bind_vars=bind_vars,
                cache=False
            )
            print("Query executed successfully")
        except Exception as e:
            print("ERROR: ", e)
            if "[ERR 1500]" in str(e):
                return "[ERR 1500]"

        # return cursor
        return cursor

    def get_object_graph_71(self, flow_data: list):
        """
        Obtains the object graph based on the provided graph data.
        The graph data contains the complete graph flow that the user
        modelled in the user interface.
        """

        db_path_data = self.execute_flow_71(flow_data)
        if db_path_data == "[ERR 1500]":
            return -410
        if db_path_data in [-1, -2, -3]:
            return db_path_data
        result = self._generate_objects_graph(
            db_path_data=db_path_data,
            has_paths=True if self.flow.edges else False,
            increase_root_nodes=False
        )
        return result
    
    def expand_node(self, node_id:str, max_nodes:int=1000):
        """
        Executes a graph traversal query, which finds the paths leading to all neighboring nodes
        of the starting node, which is passed to this function.
        Expands a total number of `max_nodes` nodes.

        node_id:str 
            The database id of the node for which the neighbors are to be found
        max_nodes:int
            The maximum number of nodes to expand

        Returns the updated graph_data object that contains the old nodes + the new oens.
        """

        # Step 1: Execute query to get neighboring paths

        try:
            bind_vars = {
                'start_node': node_id,
                'graph_name': self.graph_name
            }
            db_path_data = self.db.aql.execute(
                EXPAND_NODE,
                bind_vars=bind_vars,
                cache=False
            )
            print("Query executed successfully")
        except Exception as e:
            print("ERROR: ", e)
            if "[ERR 1500]" in str(e):
                return "[ERR 1500]"

        # Step 2: Process the result to fit the frontend format
        result = self._generate_objects_graph(
            db_path_data=db_path_data,
            has_paths=True,
            increase_root_nodes=False
        )
        return result


    def print_paths(self, paths):
        print(f"{len(paths)} paths")
        for i, path in enumerate(paths):
            for edge, node in path:
                edge = edge.name if edge else ''
                node = node.collection
                print(f" - [{edge}] - {node}", end=" ")
            print()

    def kill_all_queries(self):
        queries = self.db.aql.queries()
        print("Running queries: ", queries)
        for query in queries:
            query_id = query['id']
            print(f"Killed Query {query_id}")
            self.db.aql.kill(query_id)

    def explain_flow(self, flow_data: list):
        if not flow_data:
            return []

        # Preprocessing
        logger.info("Explaining React Flow")
        nodes = flow_data['nodes']
        edges = flow_data['edges']
        start_nodes = flow_data['startNodes']
        start_nodes = int(start_nodes) if start_nodes else start_nodes
        paths = flow_data['paths']
        paths = int(paths) if paths else paths

        # Create GraphFlow object. Will handle operations and calculations on the flow
        flow = GraphFlow(nodes, edges)

        # If Flow is invalid, return
        valid, reason = self.is_flow_valid(flow)
        if not valid:
            return []

        # Source nodes, sink nodes, source to sink paths
        source_nodes = flow.find_source_nodes()
        sink_nodes = flow.find_sink_nodes()
        source_nodes = [(None, node) for node in source_nodes]
        s2s_paths = flow.find_source_to_sink_paths(
            source_nodes, sink_nodes)

        path_nodes = list()
        for path in s2s_paths:
            p = [node.collection for edge, node in path]
            path_nodes.append(p)
        return path_nodes
