import React from 'react';
import {CircularProgress} from '@mui/material';
import {Navigate, useLocation} from 'react-router-dom';
import {useSession} from '../../hooks/useSession';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {session, loading} = useSession();
    const location = useLocation();

    if (loading) {
        return <CircularProgress/>;
    }

    if (!session) {
        return <Navigate to="/login" replace state={{from: location.pathname}}/>;
    }

    return children;
};

export default RequireAuth;
