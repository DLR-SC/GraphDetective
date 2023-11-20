import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

export const GraphTabs = ({ selectedTab, setSelectedTab }) => {

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const style = { color: "black" }

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={selectedTab}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="secondary tabs example"
            >
                <Tab
                    style={style}
                    iconPosition="start"
                    value="meta_graph"
                    label={"Ontology"} />
                <Divider orientation="vertical" flexItem />
                <Tab
                    style={style}
                    iconPosition="start"
                    value="intermediate_result_viewer"
                    label={"Node Analyzer"} />
                <Divider orientation="vertical" flexItem />
                <Tab
                    style={style}
                    iconPosition="start"
                    value="node_editor"
                    label={"Filters"} />
                <Divider orientation="vertical" flexItem />
                <Tab
                    style={style}
                    iconPosition="start"
                    value="object_graph"
                    label={"Result Explorer"} />
            </Tabs>
        </Box>
    );
}