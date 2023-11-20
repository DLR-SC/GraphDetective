class TraversalOptions:
    def __init__(self, start_vertex: str | dict):
        self._start_vertex = start_vertex
        self._direction: str = "outbound"
        self._item_order: str = "forward"
        self._strategy: str | None = None
        self._order: str | None = None
        self._edge_uniqueness: str | None = None
        self._vertex_uniqueness: str | None = None
        self._max_iter: str | None = None
        self._min_depth: str | None = None
        self._init_func: str | None = None
        self._sort_func: str | None = None
        self._filter_func: str | None = None
        self._visitor_func: str | None = None
        self._expander_func: str | None = None

    def direction(self, direction):
        """
        Set the traversal direction.

        Parameters:
        - direction (str): Traversal direction. Allowed values are “outbound” (default), “inbound” and “any”.
        """
        self._direction = direction
        return self

    def item_order(self, item_order):
        """
        Set the item iteration order.

        Parameters:
        - item_order (str): Item iteration order. Allowed values are “forward” (default) and “backward”.
        """
        self._item_order = item_order
        return self

    def strategy(self, strategy):
        """
        Set the traversal strategy.

        Parameters:
        - strategy (str | None): Traversal strategy. Allowed values are “depthfirst” and “breadthfirst”.
        """
        self._strategy = strategy
        return self

    def order(self, order):
        """
        Set the traversal order.

        Parameters:
        - order (str | None): Traversal order. Allowed values are “preorder”, “postorder”, and “preorder-expander”.
        """
        self._order = order
        return self

    def edge_uniqueness(self, edge_uniqueness):
        """
        Set the uniqueness for visited edges.

        Parameters:
        - edge_uniqueness (str | None): Uniqueness for visited edges. Allowed values are “global”, “path” or “none”.
        """
        self._edge_uniqueness = edge_uniqueness
        return self

    def vertex_uniqueness(self, vertex_uniqueness):
        """
        Set the uniqueness for visited vertices.

        Parameters:
        - vertex_uniqueness (str | None): Uniqueness for visited vertices. Allowed values are “global”, “path” or “none”.
        """
        self._vertex_uniqueness = vertex_uniqueness
        return self

    def max_iter(self, max_iter):
        """
        Set the maximum number of iterations.

        Parameters:
        - max_iter (int | None): If set, halt the traversal after the given number of iterations.
          This parameter can be used to prevent endless loops in cyclic graphs.
        """
        self._max_iter = max_iter
        return self

    def min_depth(self, min_depth):
        """
        Set the minimum depth of the nodes to visit.

        Parameters:
        - min_depth (int | None): Minimum depth of the nodes to visit.
        """
        self._min_depth = min_depth
        return self

    def init_func(self, init_func):
        """
        Set the initialization function.

        Parameters:
        - init_func (str | None): Initialization function in Javascript with signature (config, result) -> void.
          This function is used to initialize values in the result.
        """
        self._init_func = init_func
        return self

    def sort_func(self, sort_func):
        """
        Set the sorting function.

        Parameters:
        - sort_func (str | None): Sorting function in Javascript with signature (left, right) -> integer,
          which returns -1 if left < right, +1 if left > right, and 0 if left == right.
        """
        self._sort_func = sort_func
        return self

    def filter_func(self, filter_func):
        """
        Set the filter function.

        Parameters:
        - filter_func (str | None): Filter function in Javascript with signature (config, vertex, path) -> mixed,
          where mixed can have one of the following values (or an array with multiple):
          “exclude” (do not visit the vertex), “prune” (do not follow the edges of the vertex),
          or “undefined” (visit the vertex and follow its edges).
        """
        self._filter_func = filter_func
        return self
    
    def visitor_func(self, visitor_func):
        """Set the visitor function for traversal.

        Args:
            visitor_func (str | None): Visitor function in Javascript with signature
                (config, result, vertex, path, connected) -> void.
                The return value is ignored, result is modified by reference, and connected is
                populated only when parameter order is set to "preorder-expander".
        
        Returns:
            Options: Returns the Options object for method chaining.
        """
        self._visitor_func = visitor_func
        return self

    def expander_func(self, expander_func):
        """Set the expander function for traversal.

        Args:
            expander_func (str | None): Expander function in Javascript with signature
                (config, vertex, path) -> mixed.
                The function must return an array of connections for vertex. Each connection
                is an object with attributes "edge" and "vertex".

        Returns:
            Options: Returns the Options object for method chaining.
        """
        self._expander_func = expander_func
        return self

    def build(self):
        return TraversalOptions(self)