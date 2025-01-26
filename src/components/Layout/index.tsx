import React from 'react';
import {AppBar, Toolbar, Typography, Container, Box} from '@mui/material';
import {Outlet} from "react-router-dom";

const Layout: React.FC = () => {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box component="main" flexGrow={1} py={3}>
                <Container>
                    <Outlet/>
                </Container>
            </Box>

            <Box component="footer" py={2} bgcolor="primary.main" color="white" textAlign="center">
                <Container>
                    <Typography variant="body2">&copy; 2023 - Natálio</Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;