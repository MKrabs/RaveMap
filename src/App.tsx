import './App.css'
import { Box, Grid } from '@mui/joy';
import RaveList from './RaveList.tsx';
import RaveMap from './RaveMap.tsx';

function App() {
    return (
        <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid xs={4}>
                    <RaveList/>
                </Grid>
                <Grid xs={8}>
                    <RaveMap/>
                </Grid>
            </Grid>
        </Box>
    )
}

export default App