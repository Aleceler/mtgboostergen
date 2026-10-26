import React, {useEffect, useState} from 'react';
import {Alert, Box, Card, Typography, Button, CircularProgress} from '@mui/material';
import {useBoosterSet} from '../../hooks/useBoosterSet';
import {fetchTiers, removeTier, saveTier, Tier} from '../../services/supabase';
import {applyCardFilters, CardFilterState, EMPTY_FILTERS} from '../../services/cardFilters';
import CardFilters from '../CardFilters';

const TierSystem: React.FC = () => {
    const {selectedSet, cards: setCards, loading, error} = useBoosterSet();
    const [tiers, setTiers] = useState<Record<string, Tier>>({});
    const [tiersLoading, setTiersLoading] = useState(false);
    const [tiersError, setTiersError] = useState<string>();
    const [filters, setFilters] = useState<CardFilterState>(EMPTY_FILTERS);

    const setCode = selectedSet?.code;

    useEffect(() => {
        setTiers({});
        setFilters(EMPTY_FILTERS);
        if (!setCode) {
            return;
        }

        let cancelled = false;
        setTiersLoading(true);
        setTiersError(undefined);

        fetchTiers(setCode)
            .then((savedTiers) => {
                if (!cancelled) {
                    setTiers(savedTiers);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setTiersError('Não foi possível carregar seus tiers.');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setTiersLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [setCode]);

    const cards = setCards.map((card) => ({...card, tier: tiers[card.id]}));
    const untieredCards = cards.filter((card) => !card.tier);
    const listCards = applyCardFilters(untieredCards, filters);

    const updateTier = async (cardId: string, tier?: Tier) => {
        if (!setCode) {
            return;
        }

        const previousTiers = tiers;
        const nextTiers = {...tiers};
        if (tier) {
            nextTiers[cardId] = tier;
        } else {
            delete nextTiers[cardId];
        }
        setTiers(nextTiers);
        setTiersError(undefined);

        try {
            if (tier) {
                await saveTier(setCode, cardId, tier);
            } else {
                await removeTier(cardId);
            }
        } catch {
            setTiers(previousTiers);
            setTiersError('Não foi possível salvar o tier.');
        }
    };

    const moveToTier = (cardId: string, tier: Tier) => updateTier(cardId, tier);

    const returnToList = (cardId: string) => updateTier(cardId);

    if (loading || tiersLoading) {
        return <CircularProgress/>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    const renderTierCards = (tier: Tier) => (
        <Box sx={{marginBottom: 2, border: 1, borderColor: 'divider', borderRadius: 2, padding: 2}}>
            <Typography variant="h6">Tier {tier}</Typography>
            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 2}}>
                {cards
                    .filter((card) => card.tier === tier)
                    .map((card) => (
                        <Card
                            key={card.id}
                            sx={{
                                width: 200,
                                height: "100%",
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: 1,
                            }}
                            onClick={() => returnToList(card.id)}
                        >
                            <img
                                src={card.imageUrl}
                                alt={card.name}
                                style={{
                                    width: '100%',
                                    height: '70%',
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                }}
                            />
                        </Card>
                    ))}
            </Box>
        </Box>
    );

    return (
        <Box>
            {tiersError && <Alert severity="error" sx={{marginBottom: 2}}>{tiersError}</Alert>}
            {(['S', 'A', 'B', 'C', 'D', 'E'] as Tier[]).map((tier) =>
                renderTierCards(tier)
            )}

            <Box sx={{marginTop: 4,}}>
                <Typography variant="h6">Lista Completa</Typography>
                <CardFilters value={filters} onChange={setFilters} shown={listCards.length} total={untieredCards.length}/>
                {listCards.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{marginTop: 2}}>
                        Nenhuma carta com esses filtros.
                    </Typography>
                )}
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 2}}>
                    {listCards
                        .map((card) => (
                            <Card
                                key={card.id}
                                sx={{
                                    width: 250,
                                    height: "100%",
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 1,
                                }}
                            >
                                <img
                                    src={card.imageUrl}
                                    alt={card.name}
                                    style={{width: '100%', height: '70%', objectFit: 'cover', borderRadius: 4}}
                                />
                                <Typography variant="body2" color="text.primary" sx={{textAlign: 'center', marginTop: 1}}>
                                    {card.name}
                                </Typography>
                                <Box sx={{marginTop: 1, display: 'flex'}}>
                                    {(['S', 'A', 'B', 'C', 'D', 'E'] as Tier[]).map((tier) => (
                                        <Button
                                            key={tier}
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                margin: '2px',
                                                minWidth: '25px',
                                                height: '25px',
                                                padding: 0,
                                            }}
                                            onClick={() => moveToTier(card.id, tier)}
                                        >
                                            {tier}
                                        </Button>
                                    ))}
                                </Box>
                            </Card>
                        ))}
                </Box>
            </Box>
        </Box>
    );
};

export default TierSystem;