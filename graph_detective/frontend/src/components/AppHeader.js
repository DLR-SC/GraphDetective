import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import logo from '../assets/DLR_Signet_schwarz.png';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SettingsIcon from '@mui/icons-material/Settings';
import { EditDatabaseDialog } from './EditDatabaseDialog.tsx';

export const AppHeader = ({
    title,
    menuItems,
    onMenuItemClick,
    selectedMenuItemId
}) => {
    const trigger = useScrollTrigger();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <CssBaseline />
            <Slide appear={false} direction="down" in={!trigger}>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static" sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backgroundColor: '#ffffff',
                        color: 'black',
                        boxShadow: 'none',
                    }}>
                        <Toolbar>
                            <img src={logo} alt="DLR Signet" className="logo-image" />
                            <Typography variant="h6" noWrap component="div" className="app-title">
                                <b>
                                    {title}
                                </b>
                            </Typography>
                            {menuItems.map((menuItem, index) => (
                                <div key={index} style={{ padding: "1em" }}
                                    onClick={() => onMenuItemClick(menuItem.id)}
                                    className="appMenuItem">
                                    <Divider orientation="vertical" flexItem />
                                    <Typography
                                        textAlign="center"
                                    >
                                        {menuItem.text}
                                    </Typography>
                                </div>
                            ))}
                            <Stack orientation={"row"} sx={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <EditDatabaseDialog
                                        title={"Edit Connection"}
                                        icon={<SettingsIcon />}
                                    />
                                </div>
                            </Stack>
                        </Toolbar>
                    </AppBar>
                </Box>
            </Slide >

            {/* This serves as a placeholder to accomodate for the top bar */}
            < Box component="main" sx={{ flexGrow: 1, p: 1 }} />
        </Box >
    );
}