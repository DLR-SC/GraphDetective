// https://blog.logrocket.com/python-developers-guide-react/

import { useState, createContext } from 'react';
import './App.css';
import { GraphViewerPage } from './pages/GraphViewerPage';
import { DocumentSearchPage } from './pages/DocumentSearchPage';
import { AppHeader } from './components/AppHeader';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { MessageProvider } from './contexts/MessageContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export const ScreenWidthContext = createContext();

function App() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  window.addEventListener('resize', () => {
    setScreenWidth(window.innerWidth);
  });


  return (
    <div className="App">
      <ScreenWidthContext.Provider value={screenWidth}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MessageProvider>
            <Box sx={{ flexGrow: 1 }}>
              <AppHeader
                title="InsightsNet Graph Explorer"
                menuItems={[]}
              />
              <Grid container spacing={2} columns={32}>
                <Grid item xl={1} lg={1}>
                  {/* <MenuBar menuItems={menuItems} onMenuItemClick={setSelectedMenuItemId} selectedMenuItemId={selectedMenuItemId} /> */}
                </Grid>
                <Grid item justifyContent="center" alignItems="center" xl={31} lg={31}>
                  <GraphViewerPage />
                </Grid>
              </Grid>
            </Box>
          </MessageProvider>
        </LocalizationProvider>
      </ScreenWidthContext.Provider>
    </div>
  );
}

export default App;
