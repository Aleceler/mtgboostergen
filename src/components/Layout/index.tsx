
import { Typography, Container, Box} from '@mui/material';
import {Outlet} from "react-router-dom";
import Header from "../Header";
import {useBoosterSetLoader} from "../../hooks/useBoosterSet";

const Layout: React.FC = () => {
    const boosterSet = useBoosterSetLoader();

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
    <Header sets={boosterSet.sets} selectedCode={boosterSet.selectedSet?.code} onSelectSet={boosterSet.selectSet}/>
            <Box component="main" flexGrow={1} py={3} pt={10}>
                <Container>
                    <Outlet context={boosterSet}/>
                </Container>
            </Box>

            <Box component="footer" py={2} bgcolor="background.paper" color="text.secondary" textAlign="center" borderTop={1} borderColor="divider">
                <Container>
                    <Typography variant="body2">&copy; 2023 - Natálio</Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
