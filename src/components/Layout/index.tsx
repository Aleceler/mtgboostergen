
import { Typography, Container, Box} from '@mui/material';
import {Outlet} from "react-router-dom";
import Header from "../Header";

const Layout: React.FC = () => {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
    <Header/>
            <Box component="main" flexGrow={1} py={3} pt={10}>
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