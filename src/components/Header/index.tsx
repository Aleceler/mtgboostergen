import React, {useState} from 'react';
import {AppBar, Toolbar, Box, Button, Chip, IconButton, Menu, MenuItem, Select, useMediaQuery, useTheme} from '@mui/material';
import {Link} from 'react-router-dom';
import mtgLogo from '../../assets/images/mtglogo.png';
import {isUpcomingSet, ScryfallSet} from '../../services/scryfall';
import {supabase} from '../../services/supabase';
import {useSession} from '../../hooks/useSession';

type HeaderProps = {
    sets: ScryfallSet[];
    selectedCode?: string;
    onSelectSet: (code: string) => void;
};

const NAV_LINKS = [
    {label: 'Gerador Booster', to: '/'},
    {label: 'Tier', to: '/tier'},
    {label: 'Análise', to: '/analise'},
];

const navButtonSx = {
    fontWeight: 'bold',
    textTransform: 'none',
    color: 'text.primary',
    whiteSpace: 'nowrap',
};

const Header: React.FC<HeaderProps> = ({sets, selectedCode, onSelectSet}) => {
    const {session} = useSession();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const closeMenu = () => setMenuAnchor(null);

    const signOut = () => {
        closeMenu();
        supabase.auth.signOut();
    };

    return (
        <AppBar position="fixed" elevation={0}>
            <Toolbar sx={{gap: {xs: 1, md: 2}}}>
                <Box
                    component="img"
                    src={mtgLogo}
                    alt="Logo"
                    sx={{height: {xs: 28, md: 40}, filter: 'invert(1) hue-rotate(180deg)'}}
                />
                <Box sx={{flexGrow: 1}}/>
                {sets.length > 0 && (
                    <Select
                        size="small"
                        value={selectedCode ?? ''}
                        onChange={(event) => onSelectSet(event.target.value)}
                        sx={{minWidth: 0, width: {xs: '100%', md: 240}, maxWidth: 240}}
                    >
                        {sets.map((set) => (
                            <MenuItem key={set.code} value={set.code}>
                                <Box
                                    component="img"
                                    src={set.icon_svg_uri}
                                    alt=""
                                    sx={{height: 18, width: 18, marginRight: 1, verticalAlign: 'middle', filter: 'invert(1)'}}
                                />
                                {set.name}
                                {isUpcomingSet(set) && (
                                    <Chip size="small" label="Pré-release" color="secondary" sx={{marginLeft: 1, height: 20}}/>
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                )}
                {isMobile ? (
                    <>
                        <IconButton aria-label="Menu" onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{color: 'text.primary'}}>
                            ☰
                        </IconButton>
                        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                            {NAV_LINKS.map((link) => (
                                <MenuItem key={link.to} component={Link} to={link.to} onClick={closeMenu}>
                                    {link.label}
                                </MenuItem>
                            ))}
                            {session ? (
                                <MenuItem onClick={signOut}>Sair</MenuItem>
                            ) : (
                                <MenuItem component={Link} to="/login" onClick={closeMenu}>Entrar</MenuItem>
                            )}
                        </Menu>
                    </>
                ) : (
                    <Box sx={{display: 'flex'}}>
                        {NAV_LINKS.map((link) => (
                            <Button key={link.to} sx={navButtonSx} component={Link} to={link.to}>
                                {link.label}
                            </Button>
                        ))}
                        {session ? (
                            <Button sx={navButtonSx} onClick={signOut}>
                                Sair
                            </Button>
                        ) : (
                            <Button sx={navButtonSx} component={Link} to="/login">
                                Entrar
                            </Button>
                        )}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
