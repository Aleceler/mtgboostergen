import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import {RouterProvider} from "react-router-dom";
import Routes from "./routes.tsx";

// link para gerar novo json https://scryfall.com/search?as=grid&order=name&q=%28game%3Apaper%29+set%3Adft

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={Routes} />
        </ThemeProvider>
    );
}

export default App;