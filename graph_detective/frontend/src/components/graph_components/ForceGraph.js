import React, { useCallback, useState, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from "three-spritetext";
import PropTypes from "prop-types";
import * as THREE from 'three';

const { useRef } = React;

export const ForceGraph = ({
    id,
    graphData,
    width,
    height,
    backgroundColor,
    nodeResolution,
    onNodeLeftClick,
    onNodeRightClick,
    onLinkLeftClick,
    onLinkRightClick,
    onItemHover,
    textMode,
    labelProp,
    linkWidth,
    linkResolution,
    dagMode,
    nodeDistance
}) => {
    const fgRef = useRef();
    const canvasWidth = width + 2;
    const nodeRelSize = 4;
    const segments = 12;
    const sphereGeometry = new THREE.SphereGeometry(nodeRelSize, segments, segments);
    const sphereGeometryLarge = new THREE.OctahedronGeometry(Math.round(nodeRelSize * 1.75), 1);
    const globalMaterials = {}; // Global dictionary to store materials
    let nodeObjectFunction_1 = () => { }
    let nodeObjectFunction_2 = () => { }
    function getMaterial(color, brightnessScalar) {
        const key = `${color}_${brightnessScalar}`;
    
        if (!globalMaterials[key]) {
            // Create a new material if it doesn't exist
            const originalColor = new THREE.Color(color);
            const shadedColor = originalColor.clone().multiplyScalar(brightnessScalar);
            globalMaterials[key] = new THREE.MeshStandardMaterial({ color: shadedColor });
        }
    
        return globalMaterials[key];
    }
    function getSphereObject(radius, color, brightnessScalar) {
        // brightnessScalar: the lower, the darker. Set to 1 for original color
        const sphereMaterial = getMaterial(color, brightnessScalar);
        const sphere = new THREE.Mesh(radius == "m" ? sphereGeometry : sphereGeometryLarge, sphereMaterial);
        return sphere;
    }

    switch (textMode) {
        case 1: // Metagraph
            var isNodeExtended = false;
            nodeObjectFunction_1 = node => {
                const sprite = new SpriteText(node.id);
                sprite.color = node.color;
                sprite.backgroundColor = "rgba(236, 236, 236, 0.15)"
                sprite.fontWeight = "bold"
                sprite.padding = 1.5
                sprite.borderRadius = 1
                return sprite;
            };
            nodeObjectFunction_2 = nodeObjectFunction_1;
            var nodelabel = () => {
                return "<b>(Click to add)</b>"
            }
            break;
        case 0: // Objectgraph
            var isNodeExtended = false; // states whether a custom "nodeObjectFunction" is replacing or adding onto the default node styling
            nodeObjectFunction_1 = node => {
                // This is returned for the nodes
                return getSphereObject("m", node.color, 1);
            };
            nodeObjectFunction_2 = node => {
                // This is returned for the nodes when they are being hovered
                return getSphereObject("l", node.color, 1.5);
            };
            var nodelabel = node => {
                return;
            }
            break;
        default:
            var isNodeExtended = false;
            return getSphereObject(nodeRelSize, 16, node.color, 1);
    }

    let debug = false
    if (debug) {
        return <div>Debug-Mode</div>
    }

    const getDagMode = (mode) => {
        if (!mode) {
            return null
        }
        mode = mode.toLowerCase();
        switch (mode) {
            case 'top-down':
                return 'td';
            case 'bottom-up':
                return 'bu';
            case 'left-right':
                return 'lr';
            case 'right-left':
                return 'rl';
            case 'near-to-far':
                return 'zout';
            case 'far-to-near':
                return 'zin';
            case 'outwards-radially':
                return 'radialout';
            case 'inwards-radially':
                return 'radialin';
            default:
                return 'td';
        }
    }

    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());

    function getNeighbours(nodeId) {
        const neighbourNodes = [];
        const neighbourLinks = [];
        
        // Find links where the specified node is the source or target
        graphData.links.forEach(link => {
            if (link.source.id === nodeId) {
                // If the specified node is the source, add the target node to neighbors
                const targetNode = graphData.nodes.find(node => node.id === link.target.id);
                if (targetNode) {
                    neighbourNodes.push(targetNode);
                    neighbourLinks.push(link)
                }
            } else if (link.target.id === nodeId) {
                // If the specified node is the target, add the source node to neighbors
                const sourceNode = graphData.nodes.find(node => node.id === link.source.id);
                if (sourceNode) {
                    neighbourNodes.push(sourceNode);
                    neighbourLinks.push(link)
                }
            }
        });
    
        return {
            neighbourNodes: neighbourNodes,
            neighbourLinks: neighbourLinks
        };
    }

    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    const handleNodeHover = node => {
        onItemHover(node);
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            // Get neighbour nodes and links
            const { neighbourNodes, neighbourLinks } = getNeighbours(node.id)

            // Add all neighbour nodes to Set
            for (const item of neighbourNodes) {
                highlightNodes.add(item);
            }
            // Also add current node
            highlightNodes.add(node);

            // Add all neighbour links to Set
            for (const item of neighbourLinks) {
                highlightLinks.add(item);
            }
        }

        updateHighlight();
    };

    return (
        <div>
            <div className="reactCanvas" style={{ width: canvasWidth }}>
                <ForceGraph3D
                    ref={fgRef}
                    graphData={graphData}
                    width={width}
                    height={height}
                    nodeLabel={nodelabel}
                    backgroundColor={backgroundColor}
                    id={id}
                    nodeResolution={nodeResolution}
                    onNodeClick={node => onNodeLeftClick(node)}
                    onNodeRightClick={node => onNodeRightClick(node)}
                    onLinkClick={link => onLinkLeftClick(link)}
                    onLinkRightClick={link => onLinkRightClick(link)}

                    onNodeHover={handleNodeHover}
                    onLinkHover={link => onItemHover(link)}
                    
                    nodeThreeObject={(node) =>
                        highlightNodes.has(node)
                            ? nodeObjectFunction_2(node)
                            : nodeObjectFunction_1(node)
                    }
                    nodeThreeObjectExtend={isNodeExtended}
                    nodeRelSize={nodeRelSize}
                    linkWidth={link => highlightLinks.has(link) ? Math.round(linkWidth * 1.5) : linkWidth}
                    linkColor={link => highlightLinks.has(link) ? "#4A4A4A" : "#A2A2A2"}
                    linkDirectionalParticleWidth={link => highlightLinks.has(link) ? Math.round(linkWidth * 1.5)+1 : 0}
                    linkDirectionalParticleSpeed={0.005}
                    linkDirectionalParticles={4}
                    linkDirectionalParticleResolution={segments}
                    linkResolution={linkResolution}
                    linkOpacity={0.8}
                    dagMode={getDagMode(dagMode)}
                    dagLevelDistance={nodeDistance}
                    forceEngine="d3"
                    onNodeDragEnd={node => {
                        node.fx = node.x;
                        node.fy = node.y;
                        node.fz = node.z;
                    }}
                    cooldownTime={900}
                />
            </div>
        </div>
    )
}