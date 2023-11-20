class Node:
    
    def __init__(self,
                 id:str,
                 collection:str,
                 conditions:list,
                 type:str):
        self.id = id
        self.collection = collection
        self.conditions = conditions
        self.type = type # can only be "node"

    