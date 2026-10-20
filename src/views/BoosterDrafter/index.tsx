import Cards from '../../components/Cards';
import {useEffect, useState} from "react";
import {Button, CircularProgress, Typography} from '@mui/material';
import {BoosterCard} from '../../services/scryfall';
import {useBoosterSet} from '../../hooks/useBoosterSet';

const generateBoosterPack = (cards: BoosterCard[]) => {
    const commonCards = cards.filter((card) => card.rarity === 'common');
    const uncommonCards = cards.filter((card) => card.rarity === 'uncommon');
    const rareCards = cards.filter((card) => card.rarity === 'rare');
    const mythicCards = cards.filter((card) => card.rarity === 'mythic');

    const getRandomCards = (pool: BoosterCard[], count: number) => {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };

    const selectedCommons = getRandomCards(commonCards, 10);
    const selectedUncommons = getRandomCards(uncommonCards, 3);

    const rareOrMythic =
        Math.random() < 0.125 && mythicCards.length > 0
            ? getRandomCards(mythicCards, 1)
            : getRandomCards(rareCards, 1);

    const allCards = [...commonCards, ...uncommonCards, ...rareCards, ...mythicCards];
    const wildcard = getRandomCards(allCards, 1);

    const booster = [...selectedCommons, ...selectedUncommons, ...rareOrMythic, ...wildcard];

    return booster;
};


const BoosterDrafter = () => {
    const {selectedSet, cards, loading, error} = useBoosterSet();
    const [boosters, setBoosters] = useState<BoosterCard[][]>([]);

    useEffect(() => {
        setBoosters([]);
    }, [selectedSet?.code]);

    const generateBoosters = () => {
        const generatedBoosters = [];
        for (let i = 0; i < 6; i++) {
            generatedBoosters.push(generateBoosterPack(cards));
        }
        setBoosters(generatedBoosters);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            {selectedSet && (
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
                    <img src={selectedSet.icon_svg_uri} alt="" style={{height: '48px', filter: 'invert(1)'}}/>
                    <Typography variant="h4" sx={{fontSize: {xs: '1.6rem', sm: '2.125rem'}}}>{selectedSet.name}</Typography>
                </div>
            )}
            {error && <Typography color="error">{error}</Typography>}
            {loading ? (
                <CircularProgress/>
            ) : (
                <Button variant="contained" size="large" onClick={generateBoosters} disabled={!cards.length}>
                    Gerar 6 boosters
                </Button>
            )}
            <div style={{marginTop: '20px'}}>
                {boosters.map((booster, index) => (
                    <Cards key={index} booster={booster}/>
                ))}
            </div>
        </div>
    );
};

export default BoosterDrafter;
