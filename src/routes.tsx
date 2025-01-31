import {createBrowserRouter} from 'react-router-dom';
import Layout from './components/Layout';
import BoosterDraft from './views/BoosterDrafter';
import Tier from "./components/Tier";


const Routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        children: [
            {
                path: '/',
                element: <BoosterDraft/>,
            },
            {
                path: '/tier',
                element: <Tier/>
            }
        ],
    },
]);


export default Routes;