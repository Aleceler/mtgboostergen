import React, {useState} from 'react';
import {Box, Chip, Dialog} from '@mui/material';
import {PoolCard} from '../../services/poolAnalysis';

const CardThumb: React.FC<{ card: PoolCard; width: number }> = ({card, width}) => {
    const [zoomed, setZoomed] = useState(false);

    return (
        <Box sx={{width, textAlign: 'center'}} title={card.name}>
            <Box
                component="img"
                src={card.imageUrl}
                alt={card.name}
                loading="lazy"
                onClick={() => setZoomed(true)}
                sx={{width: '100%', borderRadius: 1, cursor: 'zoom-in'}}
            />
            <Box sx={{display: 'flex', justifyContent: 'center', gap: 0.5}}>
                <Chip size="small" label={card.tier ?? '-'} color={card.tier ? 'primary' : 'default'}/>
                {card.count > 1 && <Chip size="small" label={`x${card.count}`}/>}
            </Box>
            <Dialog open={zoomed} onClose={() => setZoomed(false)} PaperProps={{sx: {backgroundColor: 'transparent', boxShadow: 'none'}}}>
                <Box
                    component="img"
                    src={card.imageUrl}
                    alt={card.name}
                    onClick={() => setZoomed(false)}
                    sx={{display: 'block', width: 'min(488px, 90vw)', borderRadius: 3, cursor: 'zoom-out'}}
                />
            </Dialog>
        </Box>
    );
};

const PoolCardList: React.FC<{ cards: PoolCard[]; width: number }> = ({cards, width}) => (
    <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
        {cards.map((card) => <CardThumb key={card.id} card={card} width={width}/>)}
    </Box>
);

export default PoolCardList;
