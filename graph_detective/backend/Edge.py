from Node import Node

class Edge:
    def __init__(self,
                 id:str,
                 source:Node,
                 target:Node,
                 type:str,
                 name:str,
                 conditions:list):
        self.id:str = id
        self.source:Node = source
        self.target:Node = target
        self.type:str = type
        self.name:str = name
        self.conditions:list = conditions
        self.direction:int = None