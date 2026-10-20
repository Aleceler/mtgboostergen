import React, {FormEvent, useState} from 'react';
import {Alert, Box, Button, CircularProgress, Paper, TextField, Typography} from '@mui/material';
import {Navigate, useLocation} from 'react-router-dom';
import {supabase} from '../../services/supabase';
import {useSession} from '../../hooks/useSession';

type Mode = 'signIn' | 'signUp';

const Login: React.FC = () => {
    const {session, loading} = useSession();
    const location = useLocation();
    const [mode, setMode] = useState<Mode>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string>();
    const [message, setMessage] = useState<string>();

    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/tier';

    if (loading) {
        return <CircularProgress/>;
    }

    if (session) {
        return <Navigate to={redirectTo} replace/>;
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(undefined);
        setMessage(undefined);

        const {data, error: authError} = mode === 'signIn'
            ? await supabase.auth.signInWithPassword({email, password})
            : await supabase.auth.signUp({email, password});

        setSubmitting(false);

        if (authError) {
            setError(authError.message);
            return;
        }

        if (mode === 'signUp' && !data.session) {
            setMessage('Conta criada. Confirme pelo link enviado para o seu e-mail.');
        }
    };

    return (
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
            <Paper component="form" onSubmit={handleSubmit} sx={{padding: 4, width: '100%', maxWidth: 400}}>
                <Typography variant="h5" sx={{marginBottom: 2}}>
                    {mode === 'signIn' ? 'Entrar' : 'Criar conta'}
                </Typography>
                {error && <Alert severity="error" sx={{marginBottom: 2}}>{error}</Alert>}
                {message && <Alert severity="success" sx={{marginBottom: 2}}>{message}</Alert>}
                <TextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Senha"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    fullWidth
                    margin="normal"
                    inputProps={{minLength: 6}}
                />
                <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{marginTop: 2}}>
                    {mode === 'signIn' ? 'Entrar' : 'Criar conta'}
                </Button>
                <Button
                    fullWidth
                    sx={{marginTop: 1, textTransform: 'none'}}
                    onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                >
                    {mode === 'signIn' ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;
