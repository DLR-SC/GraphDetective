import ReactJson from 'react-json-view'
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import Chip from '@mui/material/Chip';

// List of keys to exclude
const keysToExclude = ['val', '__threeObj', '__lineObj', '__curve', 'color', 'index', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'fx', 'fy', 'fz'];

export const NodeView = ({ leftClickElement, setLeftClickElement }) => {

    if (leftClickElement === null) {
        return <div></div>
    }

    const filterKeysRecursively = (data) => {
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map(filterKeysRecursively);
        }

        return Object.keys(data).reduce((result, key) => {
            if (!keysToExclude.includes(key)) {
                result[key] = filterKeysRecursively(data[key]);
            }
            return result;
        }, {});
    };

    // Filter out excluded keys
    const filteredNode = filterKeysRecursively(leftClickElement);

    const source = leftClickElement.source ? leftClickElement.source.collection : null
    const target = leftClickElement.target ? leftClickElement.target.collection : null
    console.log("S: ", source)

    return (
        <div >
            <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
            >

                {(source && target) ? (
                    <Stack
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        spacing={1}
                    >
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: leftClickElement.source.color }} />
                        <div>
                            <b>{source}</b>
                        </div>
                        <HorizontalRuleIcon /> <Chip label={<i>{leftClickElement._id.split("/")[0]}</i>} /><HorizontalRuleIcon />
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: leftClickElement.target.color }} />
                        <div>
                            <b>{target}</b>
                        </div>
                    </Stack>
                ) :
                    (
                        <Stack
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                            spacing={1}
                        >
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: leftClickElement.color }} />
                            <div>{filteredNode.collection}</div>
                        </Stack>
                    )}

                <IconButton aria-label="Close" onClick={() => setLeftClickElement(null)}>
                    <CloseIcon />
                </IconButton>
            </Stack>
            <ReactJson
                style={{
                    textAlign: "left",
                    padding: "1em",
                    boxShadow: "0 0 0 rgba(0, 0, 0, 0.4), 0 6px 20px 0 rgba(0, 0, 0, 0.05)",
                    border: "1px dashed black"
                }}
                src={filteredNode}
                indentWidth={8}
                iconStyle="square"
                displayDataTypes={false}
                //theme="bright:inverted"
                theme="rjv-default"
                collapsed={1}
                className="jsonCanvas"
            />
        </div>
    );

}