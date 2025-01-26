import {createTheme} from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#424242',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f4f6f8',
        },
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
});

export default theme;