

<h1 align="center">Welcome to GraphDetective </h1>
<p align="center">
  <a href="https://img.shields.io/badge/Made%20with-Python-1f425f.svg">
    <img src="https://img.shields.io/badge/Made%20with-Python-1f425f.svg" alt="Badge: Made with Python"/>
  </a>
    <a href="https://img.shields.io/badge/Made%20with-React-1f425f.svg">
    <img src="https://img.shields.io/badge/Made%20with-React-1f425f.svg" alt="Badge: Made with React"/>
  </a>

<a href="https://zenodo.org/doi/10.5281/zenodo.10285971"><img src="https://zenodo.org/badge/721157619.svg" alt="DOI"></a>

 <a href="https://github.com/DLR-SC/corpus-annotation-graph-builder/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg" target="_blank" />
  </a>
    <a href="https://twitter.com/dlr_software">
    <img alt="Twitter: DLR Software" src="https://img.shields.io/twitter/follow/dlr_software.svg?style=social" target="_blank" />
  </a>
</p>


This repository provides the code for our Demonstration Paper "Graph Detective - Comprehensive User Interface for Intuitive Graph Exploration and Analysis", submitted to [EACL2024](https://2024.eacl.org/calls/demos/). Video of system demonstration can be found on [YouTube](https://youtu.be/xUkV5h98lm4).

> Graph databases are used across several domains due to the intuitive structure of graphs.
> Yet, querying such graphs requires database
> experts’ involvement, reducing accessibility to
> non-experts. To address this issue, we present
> GraphDetective, a web interface that offers an
> intuitive entry point for graph data exploration,
> where users can effortlessly create queries visually, eliminating the need for expertise in query
> writing. After processing, the resulting graph
> data is then rendered in an interactive 3D visualization. 

##### UI Interface
###### Ontology View
![Ontology View](./graph_detective/images/Ontology_GIF.gif)
###### Query Graph Visualization
![GraphDetective Interface](./graph_detective/images/GD_Screenshot_InputArea.PNG?raw=true)
###### Defining a QGV
![QGV 1](./graph_detective/images/QGV_1_GIF.gif)

###### Applying node filters
![QGV 2](./graph_detective/images/QGV_2_GIF.gif)

###### Query Graph Result
![GraphDetective Graph Result](./graph_detective/images/GD_Screenshot_DisplayArea_1.PNG?raw=true)
###### Navigating a graph result
![Graph Result 1](./graph_detective/images/Graph_1_GIF.gif)

###### Display Modes
![Graph Result 2](./graph_detective/images/Graph_2_GIF.gif)

###### Individual Node Expansion
![Expanding Nodes](./graph_detective/images/Graph_Expansion_GIF.gif)

## Installation
The application is divided into **Frontend** and **Backend**. They communicate via HTTPS and need to be installed and run individually. Furthermore, a **ArangoDB database** must be available.

### Database
*GraphDetective* needs a graph on an ArangoDB database. In order to make this graph accessible to *GraphDetective*, please follow the steps defined in Section *Backend*.

### Frontend
The frontend runs on React. To install all modules and run the app, execute the following commands from within the folder `./graph_detective/frontend/`:

> `npm install --legacy-peer-deps`
> `npm start`

from the same folder. Alternatively, a docker file is included to install and run the frontend using 

> `docker build -f Dockerfile.client -t graph_detective_frontend.`
> `docker run -d -p 3000:3000 graph_detective_frontend`

### Backend
##### Installation
The backend runs on Flask. To install all libraries and run the app, use *pip* to execute the following commands from within the folder `./graph_detective/backend/`:
> `pip install -r ./requirements.txt`

Feel free to use your own package manager. Alternatively, a docker file is included to install and run the backend using
> `docker build -f Dockerfile.api -t graph_detective_backend .`
> `docker run -d -p 16001:16001 graph_detective_backend`

##### Database Configuration
The backend requires a total of four additional, distinct configuration files in the `./graph_detective/backend/config/` folder. Templates are already inclufed in the folder

**`config.json`**: This is the main configuration for the database connection. It is a JSON file containint the following key/value pairs:

> `{` <br/>
>	`"DB_HOST":"<url>",` <br/>
>	`"DB_PORT":"<port>",` <br/>
>	`"DB_NAME":"<database name>",` <br/>
>	`"DB_USER":"<user login>",` <br/>
>	`"DB_PASSWORD":"<user password>",` <br/>
>	`"DB_GRAPH":"<graph name>",` <br/>
>	`"DB_LABEL_ATTRIBUTE":"<default label to display in the graph. If unsure, use '_id' or '_key'"` <br/>
> `}`

**`collection_map.json`**: This file contains all collections, that should be displayed in the user interface. It further defines the display name for each collection. Example:
> `{` <br/>
>	`"WikipediaArticle":"Wikipedia Article",` <br/>
>	`"person":"Person",` <br/>
>	`"sOmE_ColLeCtInOn":"Give it any name you want"` <br/>
> `...` <br/>
> `}`

**`collection_views.json`**: This file defines any views that might be specified for any collection. Please besure to include all collections, that are specified in `collection_map.json` and provide an empty string if no view exists. Example:
> `{` <br/>
>	`"WikipediaArticle":"Wiki_View",` <br/>
>	`"person":"person_view",` <br/>
>	`"sOmE_ColLeCtInOn":""` (no view available - add empty string) <br/>
> `...` <br/>
> `}`

**`edges.json`**: Finally, you need to provide all edges that you would like to display and use in the graph. Any edge that is not defined here will not be usable or displayed in the graph. The format is as follows: keys represent the source collections, values are lists of target collections. This means, that each collection (...that has an edge) should be present in as a key exactly once. You do not need to provide the name of the edge. Example:
> `{` <br/>
>	`"WikipediaArticle":["Person"],` <br/>
>	`"person":["sOmE_ColLeCtInOn"],` <br/>
>	`"sOmE_ColLeCtInOn":["Person", "sOmE_ColLeCtInOn"]` <br/>
> `...` <br/>
> `}`


## Basic Usage
### Define a QGV
A *Query Graph Visualization* is a visual graph structure that you want to query from the database. To define it, add collections onto the respective canvas area on the top and connect them as desired. Then hit execute.

![Graph Detective Example QGV](./graph_detective/images/person_institution_project.PNG?raw=true)

Depending on the query, execution can be instant or take a while. Once done, the resulting graph is displayed in the visualization area below. Interact with the graph through panning, zooming, dragging and clicking.

![GraphDetective Graph Result](./graph_detective/images/GD_Screenshot_DisplayArea_2.PNG?raw=true)
