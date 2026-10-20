import {createBrowserRouter} from 'react-router-dom';
import Layout from './components/Layout';
import BoosterDraft from './views/BoosterDrafter';
import Tier from "./components/Tier";
import Login from './views/Login';
import RequireAuth from './components/RequireAuth';
import PoolAnalysis from './views/PoolAnalysis';


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
                element: <RequireAuth><Tier/></RequireAuth>
            },
            {
                path: '/analise',
                element: <RequireAuth><PoolAnalysis/></RequireAuth>
            },
            {
                path: '/login',
                element: <Login/>
            }
        ],
    },
]);


export default Routes;
