import {useEffect, useState} from 'react';
import {Session} from '@supabase/supabase-js';
import {supabase} from '../services/supabase';

export const useSession = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({data}) => {
            setSession(data.session);
            setLoading(false);
        });

        const {data} = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            setLoading(false);
        });

        return () => data.subscription.unsubscribe();
    }, []);

    return {session, loading};
};
