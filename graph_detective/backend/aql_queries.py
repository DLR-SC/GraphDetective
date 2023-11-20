### NODE ANAlYZER QUERIES ###
# (Node Analyzer) - Get documents sorted and with limit
GET_DOCUMENTS_SORT_LIMIT = (
    'FOR doc IN @@collection ' +
    'SORT doc.@attribute @direction ' +
    'LIMIT @offset, @limit ' +
    'RETURN doc'
)

# (Node Analyzer) - Get documents by filter and with limit
GET_DOCUMENTS_FILTER_LIMIT_USING_COLLECTION = (
    'FOR {loop_var} IN @@collection ' +
    'FILTER {filter} ' +
    'LIMIT @offset, @limit ' +
    'RETURN doc'
)

# (Node Analyzer) - Get documents by filter and with limit
GET_DOCUMENTS_FILTER_LIMIT_USING_VIEW = (
    'FOR {loop_var} IN @@view ' +
    'SEARCH {filter} ' +
    'LIMIT @offset, @limit ' +
    'RETURN doc'
)

# (Node Analyzer) - Get documents sorted, by filter and with limit
GET_DOCUMENTS_SORT_FILTER_LIMIT_USING_COLLECTION = (
    'FOR {loop_var} IN @@collection ' +
    'FILTER {filter} ' +
    'SORT doc.@attribute @direction ' +
    'LIMIT @offset, @limit ' +
    'RETURN doc'
)

# (Node Analyzer) - Get documents sorted, by filter and with limit
GET_DOCUMENTS_SORT_FILTER_LIMIT_USING_VIEW = (
    'FOR {loop_var} IN @@view ' +
    'FILTER {filter} ' +
    'SORT doc.@attribute @direction ' +
    'LIMIT @offset, @limit ' +
    'RETURN doc'
)

### NODE COUNT QUERIES ###
# (Node Count) - Get count of documents after applying filter
GET_DOCUMENT_COUNT_FILTERS_USING_COLLECTION = (
    'RETURN COUNT( ' +
    '\n\tFOR {loop_var} IN @@collection ' +
    '\n\t\t{filters} ' +
    #'LIMIT 1001 ' +
    '\n\t\tRETURN {loop_var} ' +
    '\n)'
)

# (Node Count) - Get count of documents after applying filter
GET_DOCUMENT_COUNT_FILTERS_USING_VIEW = (
    'RETURN COUNT( ' +
    '\n\tFOR {loop_var} IN @@view ' +
    '\n\t\tSEARCH {filter_statements} ' +
    #'LIMIT 1001 ' +
    '\n\t\tRETURN {loop_var} ' +
    '\n)'
)

### FLOW QUERIES ###
# (Start Nodes, gitlab issue)
GET_DOCUMENTS_FILTERS_USING_COLLECTION = (
    '\n' +
    'LET {query_var} = FLATTEN( ' +
    '\n\tFOR {loop_var} IN {collection} ' +
    '\t{filters} ' +
    '\n\t{limit} ' +
    '\n\tRETURN doc ' +
    '\n)'
)

GET_DOCUMENTS_FILTERS_USING_VIEW = (
    '\n' +
    'LET {query_var} = FLATTEN( ' +
    '\n\tFOR {loop_var} IN {view} ' +
    '\t{filters} ' +
    '\n\t{limit} ' +
    '\n\tRETURN doc ' +
    '\n)'
)

UNION_START_NODES = (
    '\n' +
    'LET {var} = UNION({lists}, []) '
)

GET_GRAPH = (
    '{start_nodes_aql_query} ' +
    '\n\n/* For each start node, start finding a path */ ' +
    '\nFOR start_node IN {start_nodes_var} ' +
    '\n\t/* Each Edge has the corresponding direction specified to make querying faster */ ' +
    '\n\tFOR v, e, p IN @min..@max {base_direction} start_node {edge_directions} {graph_stmt} ' +
    '\n\tOPTIONS {{ vertexCollections: @vertex_collections, edgeCollections: @edge_collections }} ' +
    '\n\t\t{path_filters} ' +
    '\n\t{limit} ' +
    '\n\tRETURN p'
)

EXPAND_NODE = (
    'FOR v, e, p IN 1..1 ANY @start_node GRAPH @graph_name ' +
    '\n\tLIMIT 1000 ' +
    '\n\tRETURN p'
)