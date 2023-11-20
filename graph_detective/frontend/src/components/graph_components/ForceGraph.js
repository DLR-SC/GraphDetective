import React from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from "three-spritetext";
import PropTypes from "prop-types";

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
    textMode,
    labelProp,
    linkWidth,
    linkResolution,
    dagMode,
    nodeDistance
}) => {
    const fgRef = useRef();
    switch (textMode) {
        case 1:
            var isNodeExtended = false;
            var nodeRelSize = 4;
            var nodeObjectFunction = node => {
                const sprite = new SpriteText(node.id);
                sprite.color = node.color;
                sprite.backgroundColor = "rgba(236, 236, 236, 0.15)"
                sprite.fontWeight = "bold"
                sprite.padding = 1.5
                sprite.borderRadius = 1
                return sprite;
            };
            var nodelabel = () => {
                return "<b>(Click to add)</b>"
            }
            break;
        case 2:
            var isNodeExtended = true;
            var nodeRelSize = 1;
            var nodeObjectFunction = (node) => {
                const sprite = new SpriteText(node.id);
                sprite.color = "white";
                return sprite;
            };
            break;
        default:
            var isNodeExtended = false;
            var nodeRelSize = 4;
            var nodeObjectFunction = "";
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
                return 'radialin';
        }
    }

    return (
        <div>
            <div className="reactCanvas">
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
                    nodeThreeObject={nodeObjectFunction}
                    nodeThreeObjectExtend={isNodeExtended}
                    nodeRelSize={nodeRelSize}
                    linkWidth={linkWidth}
                    linkResolution={linkResolution}
                    linkOpacity={0.5}
                    dagMode={getDagMode(dagMode)} // radialin
                    dagLevelDistance={nodeDistance}
                    forceEngine="d3" // d3
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