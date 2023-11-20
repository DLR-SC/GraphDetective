from flask import Flask, request, make_response
from flask_cors import CORS
from datetime import datetime
from DBClient import DBClient
import pandas as pd
import sys
import logging
import colorlog

# Setup Logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
fmt = colorlog.ColoredFormatter(
    "%(log_color)s%(levelname)s | %(asctime)s | %(message)s"
)
stdout = colorlog.StreamHandler(stream=sys.stdout)
stdout.setFormatter(fmt)
logger.addHandler(stdout)

# Flask App
app = Flask(__name__)

# main config
config_path = "config/config.json"
# node colors in graph
colours_path = "config/colours.txt"
# manual definition of edges
edges_path = "config/edges.json"
# mapping of collection names to human readable name
collection_map_path = "config/collection_map.json"
# view names of node and edge collections
collection_views = "config/collection_views.json"
# ArangoDB client to access database
db_client = DBClient(config_path=config_path,
                     colours_path=colours_path,
                     edges_path=edges_path,
                     collection_map_path=collection_map_path,
                     collection_views=collection_views
                     )

@app.route('/modify_database_connection', methods=['GET', 'POST'])
def modify_database_connection():
    """
    Modify the database connection.

    Returns:
        str: A message indicating the result of the modification.
    """
        
    config_file = request.json['database_file']
    edges_file = request.json['edges_file']
    collection_map_file = request.json['collection_map_file']
    collection_views_file = request.json['collection_views_file']

    try:
        # Create and apply new database client with updated configuration files
        tmp_client = DBClient(
            config_file=config_file,
            colours_path=colours_path,
            edges_file=edges_file,
            collection_map_file=collection_map_file,
            collection_views_file=collection_views_file
        )
        global db_client
        db_client = tmp_client
        logging.info("Successfully switched to new database connection")
        return {"result": True}
    except:
        logging.info("Database connection could not be switched")
        return {"result": False}


@app.route('/ping', methods=['GET', 'POST'])
def ping():
    return {"ping": True}

@app.route('/get_database_url', methods=['GET', 'POST'])
def get_database_url():
    """
    Get the database URL based on the existing database client.

    Returns:
        dict: A dictionary containing the database host and port information.
              If the database client is not available, returns {"host": "n/a"}.
    """

    if db_client:
        return {"host": f'{db_client.host}:{db_client.port}'}
    else:
        return {"host": "n/a"}

def key_to_header(collection_key):
    """
    Convert a collection key to a header name by replacing underscores with spaces
    and capitalizing every word.

    Args:
        collection_key (str): The input collection key.

    Returns:
        str: The converted header name.
    """
    # Replace underscores by spaces
    collection_key = collection_key.replace('_', ' ')

    # Capitalize every word
    words = collection_key.split()
    header_name = ' '.join(word.capitalize() for word in words)

    return header_name

# Limit length of each value in the dictionary to the given limit


def limit_value_length(data_list, max_length=120, postfix=''):
    """
    Limit the length of string values in a list of dictionaries.

    Args:
        data_list (List[Dict[str, Union[str, int]]]): The list of dictionaries containing string values.
        max_length (int, optional): The maximum length for string values. Defaults to 120.
        postfix (str, optional): The postfix to append to truncated string values. Defaults to an empty string.

    Returns:
        List[Dict[str, Union[str, int]]]: The modified list of dictionaries with truncated string values.
    """
    for data_dict in data_list:
        for key, value in data_dict.items():
            if isinstance(value, str) and len(value) > max_length:
                data_dict[key] = value[:max_length] + ' ' + postfix
    return data_list


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route('/get_collections')
def get_collections():
    """
    Get the human readable collection names from the database.
    """
    
    return [db_client.collection_map.get(collection) for collection in db_client.collections]


@app.route('/get_attributes', methods=['GET', 'POST'])
def get_attributes():
    """
    Get properties of the given collection as a list
    """
    
    collection_name = request.json["collection"]
    attributes = db_client.get_collection_props(collection_name)
    return attributes


@app.route('/get_meta_graph', methods=['GET', 'POST'])
def get_meta_graph():
    """
    Returns the graph data object for the graph ontology ("meta graph") that is displayed in the user interface.
    """
    
    meta_graph_data = db_client.get_meta_graph()
    return meta_graph_data


@app.route('/get_label_prop')
def get_label_prop():
    """
    Get the name of the database
    """
    
    return db_client.label_prop


@app.route('/get_edge_props', methods=['GET', 'POST'])
def get_edge_props():
    """
    Get the properties and name of the edge.
    Requires two collection names for the edge.
    """

    edgeId = request.json.get('edgeId')
    source_coll = request.json.get('sourceCollection')
    target_coll = request.json.get('targetCollection')

    # transform human readable collection name to that of the database (e.g. convert "Wiki Article" to "WikiArticle")
    source_coll = db_client.transform(source_coll)
    target_coll = db_client.transform(target_coll)

    # Get edge type based on the source and target collection
    edge = db_client.get_edge(source_coll, target_coll)
    edge_name = edge['edge_collection'] if edge else ''

    # Get available properties of the edge
    edge_props = db_client.get_collection_props(edge_name)

    # Compose return value
    props = dict()
    props['edgeId'] = edgeId
    props['name'] = db_client.transform(edge_name, to_db_name=False)
    props['props'] = edge_props
    return props


@app.route('/get_collection_count', methods=['GET', 'POST'])
def get_collection_count():
    """
    Get total number of documents in the given collection.
    """

    collection_label = request.json.get("collectionName")
    count = db_client.get_collection_count(collection_label)
    return {"count": count}


@app.route('/get_collection_column_def', methods=['GET', 'POST'])
def get_collection_column_def():
    """
    Creates and returns the Material UI Data Table column definition
    for the given collection.
    """

    collection_label = request.json.get("collectionName")
    columns = db_client.get_collection_column_def(collection_label)
    column_definition = list()
    for column in columns:
        field = column['key']
        header_name = key_to_header(column['key'])
        column_type = column['datatype']
        column_width = 3 * \
            db_client.estimate_column_width(
                collection_label, field, column_type)

        col_def = {
            'field': field,
            'headerName': header_name,
            'sortable': True,
            'width': column_width,
            'type': column_type
        }
        column_definition.append(col_def)
    return column_definition


@ app.route('/get_page_collections', methods=['GET', 'POST'])
def get_collections_by_page():
    """
    Returns the documents of the given collection for the
    given page, pageSize and varius filter and sorting 
    options. Typically used by the Material UI Data Grid table.
    """

    collection_name = request.json.get("collectionName")
    page = request.json.get("page")
    page_size = request.json.get("pageSize")
    sort_key = request.json.get("sortKey")
    sort_direction = request.json.get("sortDirection")
    filter_field = request.json.get("filterField")
    filter_operator = request.json.get("filterOperator")
    filter_value = request.json.get("filterValue")
    filter_column_type = request.json.get("filterColType")

    # will be displayed in the user interface
    page_collections = db_client.get_collections_by_page(
        collection_name,
        page,
        page_size,
        sort_key,
        sort_direction,
        filter_field,
        filter_operator,
        filter_value,
        filter_column_type
    )

    # Add unique 'id' property to each item
    page_collections = [{**dictionary, "id": i}
                        for i, dictionary in enumerate(page_collections)]
    return page_collections


@app.route('/get_node_count', methods=['GET', 'POST'])
def get_node_count():
    """
    Counts the number of documents that fulfill the given filter conditions
    """
    userData = request.json.get('userData')  # list of filter conditions
    collectionName = request.json.get('collectionName')

    node_count = db_client.get_node_count(userData, collectionName)
    return {'count': node_count}


@app.route('/check_edge_validity', methods=['GET', 'POST'])
def check_path_validity():
    """
    Checks whether an edge can exist between the two given collections as per database edge definition.
    """
    
    collection_a = request.json.get('collectionA')
    collection_b = request.json.get('collectionB')
    return {"isValid": db_client.has_edge(collection_a, collection_b)}


@app.route('/get_object_graph', methods=['GET', 'POST'])
def get_object_graph():
    """
    Queries the QGV (Query Graph Visualization) from the user after converting it to an ArangoDB AQL query.
    The request must pass the QGV as a JSON, generated by ReactFlow.
    Returns the graph data object that can be visualized by ReactForceGraph3D.
    """
    
    flow_data = request.json  # dict containing 'nodes' and 'edges' array

    # Do the magic - generate query and execute it
    result = db_client.get_object_graph_71(flow_data)

    # based on the return type, differentiate erros vs. success.
    graph_data = dict()

    # QGV is not properly connected
    if result == -1:
        resp = make_response(
            "The defined flow contains unconnected subgraphs nodes.", 444)
        return resp
    
    # QGV contains edges that are not defined in the database definition
    elif result == -2:
        resp = make_response(
            "The defined flow contains invalid edges.", 445)
        return resp
    
    # no nodes are defined in the QGV
    elif result == -3:
        resp = make_response(
            "The defined flow is empty.", 446)
        return resp
    
    # Manually killed the ArangoDB query execution during runtime
    elif result == -410:
        resp = make_response(
            "Query killed.", 410)
        return resp
    
    # Successfull querying of the QGV - returning graph result
    else:
        graph_data = result
    return graph_data

@app.route('/expand_node', methods=['GET', 'POST'])
def expand_node():
    """
    Obtains all neighbor nodes for the current document id ("nodeId"), regardless of their collection type.
    """
    node_id = request.json['nodeId'] # document id
    result = db_client.expand_node(node_id) # all neighbors
    return result


@app.route('/explain_flow', methods=['GET', 'POST'])
def explain_flow():
    """
    Generates a written explanation of the paths that would be queried if the QGV was executed as is.
    For each source-to-sink path, this function concatenates the contained collections and edges as a string.
    For example:
    [Person] - [Organization] - [Country]
    """
    flow_data = request.json  # dict containing 'nodes' and 'edges' array
    result = db_client.explain_flow(flow_data)
    return result


@ app.route('/kill_all_queries', methods=['GET', 'POST'])
def kill_all_queries():
    """
    Manually kills all running database queries
    """
    db_client.kill_all_queries()
    return {}


@app.route('/export_graph', methods=['GET', 'POST'])
def export_graph():
    """
    Exports the given graph data to a CSV file (currently only nodes).
    
    grap_data: the graph_data provided by the frontend.
    export_mode: either "cqp_web" or "csv". the first one is a special case and only available. It only exports the "filename"
        attribute of any "Climate Analytics Article" or "Greenpeace Article" to a text file for research purposes.
    
    """
    
    # graph data of query to be exported (in Force Graph Format)
    graph_data = request.json['graph_data']

    # mode of export (e.g. "csv" or "CQP CWB")
    export_mode = request.json['export_mode']

    # Research functionality
    if export_mode == "cqp_cwb":

        # extract all nodes from 'graph_data' that match "CAA" or "GP"
        collection_names = list(
            set(
                [
                    node["collection"] for node in graph_data["nodes"]
                    if node["collection"] in ["Climate Analytics Article", "Greenpeace Article"]
                ]
            ))
        
        # now only keep the "filename" property and write them to file
        wanted_keys = ['filename']
        vl = [
            {k: v for k, v in vx.items() if k in wanted_keys}
            for vx in graph_data.get("nodes", []) if vx["collection"] in collection_names
        ]
        df = pd.json_normalize(vl)
        csv = df.to_csv(index=False, header=False)
    else:
        collection_names = list(
            set([node["collection"] for node in graph_data["nodes"]]))
        unwanted_keys = [
            "_rev",
            "index",
            "x", "y", "z",
            "vx", "vy", "vz",
            "__threeObj",
            "__lineObj",
            "__arrowObj",
            "__curve",
            "val",
            "color"
        ]
        vl = [
            {k: v for k, v in vx.items() if k not in unwanted_keys}
            for vx in graph_data.get("nodes", []) if vx["collection"] in collection_names
        ]
        df = pd.json_normalize(vl)
        csv = df.to_csv(index=False, header=True)
    return csv


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host="0.0.0.0", port=16001)
