import React, { useContext } from 'react';
import { ScreenWidthContext } from './../App';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export const MenuBar = ({ menuItems, onMenuItemClick, selectedMenuItemId }) => {
    const screenWidth = useContext(ScreenWidthContext);
    var drawerWidth = screenWidth > 1280 ? 210 : 50
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'hidden' }}>
                <List>
                    {menuItems.map((menuItem, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton onClick={() => onMenuItemClick(menuItem.id)}>
                                <ListItemIcon>{menuItem.icon}</ListItemIcon>
                                {screenWidth > 1280 &&
                                    (selectedMenuItemId == index ?
                                        <ListItemText primary={<b>{menuItem.text}</b>}
                                            primaryTypographyProps={{
                                                variant: 'subtitle2',
                                            }} />
                                        :
                                        <ListItemText primary={menuItem.text}
                                            primaryTypographyProps={{
                                                variant: 'subtitle2',
                                            }} />
                                    )
                                }
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}