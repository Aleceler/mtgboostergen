import React from 'react';
import {AppBar, Toolbar, Typography, Box, Button} from '@mui/material';
import {Link} from 'react-router-dom';
import mtgLogo from '../../assets/images/mtglogo.png';

const Header: React.FC = () => {
    return (
        <AppBar position="fixed" sx={{backgroundColor: 'white', boxShadow: '0px 4px 10px rgba(0, 0, 255, 0.1)'}}>
            <Toolbar>
                <Box
                    component="img"
                    src={mtgLogo}
                    alt="Logo"
                    sx={{height: 40, marginRight: 2}}
                />
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                </Typography>
                <Box>
                    <Button
                        sx={{
                            fontWeight: 'bold',
                            textTransform: 'none',
                            color: 'black'
                        }}
                        component={Link}
                        to="/"
                    >
                        Gerador Booster
                    </Button>
                    <Button
                        sx={{
                            fontWeight: 'bold',
                            textTransform: 'none',
                            color: 'black'
                        }}
                        component={Link}
                        to="/tier"
                    >
                        Tier
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;