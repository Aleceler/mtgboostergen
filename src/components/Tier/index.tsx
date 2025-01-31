import React, {useState} from 'react';
import {Box, Card, Typography, Button} from '@mui/material';
import cardsData from '../../../aetherdrift.json';

type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

interface CardItem {
    id: string;
    name: string;
    color: string;
    tier?: Tier;
    imageUrl: string;
}


const convertCardsData = (data: any): CardItem[] => {
    return data.data.map((card: any) => ({
        id: card.id,
        name: card.name,
        imageUrl: card.image_uris.normal,
    }));
};

const initialCards: CardItem[] = convertCardsData(cardsData);

const TierSystem: React.FC = () => {
    const [cards, setCards] = useState<CardItem[]>(initialCards);

    const moveToTier = (cardId: string, tier: Tier) => {
        setCards((prevCards) =>
            prevCards.map((card) =>
                card.id === cardId ? {...card, tier} : card
            )
        );
    };

    const returnToList = (cardId: string) => {
        setCards((prevCards) =>
            prevCards.map((card) =>
                card.id === cardId ? {...card, tier: undefined} : card
            )
        );
    };

    const renderTierCards = (tier: Tier) => (
        <Box sx={{marginBottom: 2, border: '1px solid gray', borderRadius: 2, padding: 2}}>
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
            {(['S', 'A', 'B', 'C', 'D', 'E'] as Tier[]).map((tier) =>
                renderTierCards(tier)
            )}

            <Box sx={{marginTop: 4,}}>
                <Typography variant="h6">Lista Completa</Typography>
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 2}}>
                    {cards
                        .filter((card) => !card.tier)
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
                                <Typography variant="body2" color="white" sx={{textAlign: 'center', marginTop: 1}}>
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