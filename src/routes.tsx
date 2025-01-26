import {createBrowserRouter} from 'react-router-dom';
import Layout from './components/Layout';
import BoosterDraft from './views/BoosterDrafter';


const Routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        children: [
            {
                path: '/',
                element: <BoosterDraft/>,
            },
        ],
    },
]);


export default Routes;