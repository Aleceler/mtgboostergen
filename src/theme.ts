import {createTheme} from '@mui/material/styles';

const zinc = {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
};

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: zinc[200],
            contrastText: zinc[900],
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: zinc[900],
            paper: zinc[800],
        },
        text: {
            primary: zinc[100],
            secondary: zinc[400],
        },
        divider: zinc[700],
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
        },
        h2: {
            fontSize: '2rem',
        }
    },
    spacing: 8,
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: zinc[950],
                    borderBottom: `1px solid ${zinc[800]}`,
                },
            },
        },
    },
});

export default theme;
