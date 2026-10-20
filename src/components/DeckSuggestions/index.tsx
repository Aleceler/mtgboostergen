import React, {useMemo, useState} from 'react';
import {Alert, Box, Chip, Paper, Tab, Tabs, Typography} from '@mui/material';
import PoolCardList from '../PoolCardList';
import {COLORS, PoolCard} from '../../services/poolAnalysis';
import {DECK_SLOTS, DeckSuggestion, suggestDecks} from '../../services/deckBuilder';

const MANA_SYMBOL_URL = 'https://svgs.scryfall.io/card-symbols';

const colorLabel = (code: string) => COLORS.find((color) => color.code === code)?.label ?? code;

const deckLabel = (deck: DeckSuggestion) =>
    `${deck.colors.map(colorLabel).join(' / ')}${deck.splash ? ` + ${colorLabel(deck.splash)}` : ''}`;

const sumCount = (cards: PoolCard[]) => cards.reduce((sum, card) => sum + card.count, 0);

const ManaSymbol: React.FC<{ code: string; size?: number }> = ({code, size = 20}) => (
    <Box component="img" src={`${MANA_SYMBOL_URL}/${code}.svg`} alt={colorLabel(code)} sx={{width: size, height: size}}/>
);

const DeckGroup: React.FC<{ title: string; cards: PoolCard[]; range?: { min: number; max: number } }> = ({title, cards, range}) => {
    if (!cards.length && !range) {
        return null;
    }

    return (
        <Box>
            <Typography variant="subtitle1" sx={{fontWeight: 500, marginBottom: 1}}>
                {title} ({sumCount(cards)}{range ? ` de ${range.min} a ${range.max}` : ''})
            </Typography>
            {cards.length ? <PoolCardList cards={cards} width={100}/> : <Typography variant="body2" color="text.secondary">Nenhuma.</Typography>}
        </Box>
    );
};

const ManaCurve: React.FC<{ curve: DeckSuggestion['curve'] }> = ({curve}) => {
    const max = Math.max(1, ...curve.map(({count}) => count));

    return (
        <Box sx={{display: 'flex', alignItems: 'flex-end', gap: 1, height: 90}}>
            {curve.map(({label, count}) => (
                <Box key={label} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28}}>
                    <Typography variant="caption">{count}</Typography>
                    <Box sx={{width: '100%', height: (count / max) * 56, minHeight: 2, backgroundColor: 'primary.main', borderRadius: 0.5}}/>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
            ))}
        </Box>
    );
};

const DeckView: React.FC<{ deck: DeckSuggestion }> = ({deck}) => (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
        <Box sx={{display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-end'}}>
            <Box>
                <Typography><strong>Mágicas:</strong> {deck.spellCount}</Typography>
                <Typography><strong>Terrenos:</strong> {deck.landCount}</Typography>
                <Typography>
                    <strong>Nota média:</strong> {deck.averageScore === undefined ? '-' : deck.averageScore.toFixed(1)}
                </Typography>
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary">Curva de mana</Typography>
                <ManaCurve curve={deck.curve}/>
            </Box>
            {deck.synergies.length > 0 && (
                <Box>
                    <Typography variant="caption" color="text.secondary">Sinergias do deck</Typography>
                    <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: 360, marginTop: 0.5}}>
                        {deck.synergies.map((synergy) => (
                            <Chip key={synergy.label} size="small" label={`${synergy.label} (${synergy.count})`}/>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>

        {deck.warnings.map((warning) => <Alert key={warning} severity="warning">{warning}</Alert>)}

        <DeckGroup title="Criaturas" cards={deck.creatures} range={DECK_SLOTS.creature}/>
        <DeckGroup title="Remoções" cards={deck.removal} range={DECK_SLOTS.removal}/>
        <DeckGroup title="Truques / Compra" cards={deck.tricks} range={DECK_SLOTS.trick}/>
        <DeckGroup title="Outras" cards={deck.others}/>

        <Box>
            <Typography variant="subtitle1" sx={{fontWeight: 500, marginBottom: 1}}>
                Terrenos ({deck.landCount})
            </Typography>
            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 1}}>
                {deck.basicLands.map((basic) => (
                    <Box key={basic.code} sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        <ManaSymbol code={basic.code}/>
                        <Typography>x{basic.count}</Typography>
                    </Box>
                ))}
            </Box>
            {deck.nonbasicLands.length > 0 && <PoolCardList cards={deck.nonbasicLands} width={100}/>}
        </Box>
    </Box>
);

const DeckSuggestions: React.FC<{ cards: PoolCard[] }> = ({cards}) => {
    const decks = useMemo(() => suggestDecks(cards), [cards]);
    const [selected, setSelected] = useState(0);
    const deck = decks[Math.min(selected, decks.length - 1)];

    return (
        <Paper sx={{padding: 2}}>
            <Typography variant="h6" sx={{marginBottom: 1}}>Decks sugeridos</Typography>
            {!deck ? (
                <Typography variant="body2">Cartas insuficientes para montar um deck.</Typography>
            ) : (
                <>
                    <Tabs
                        value={Math.min(selected, decks.length - 1)}
                        onChange={(_event, value: number) => setSelected(value)}
                        variant="scrollable"
                        allowScrollButtonsMobile
                        sx={{marginBottom: 2, borderBottom: 1, borderColor: 'divider'}}
                    >
                        {decks.map((suggestion) => (
                            <Tab
                                key={suggestion.id}
                                sx={{textTransform: 'none'}}
                                label={
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                        {suggestion.colors.map((code) => <ManaSymbol key={code} code={code} size={18}/>)}
                                        {suggestion.splash && (
                                            <>
                                                <span>+</span>
                                                <ManaSymbol code={suggestion.splash} size={18}/>
                                            </>
                                        )}
                                        <span>{deckLabel(suggestion)}</span>
                                    </Box>
                                }
                            />
                        ))}
                    </Tabs>
                    <DeckView deck={deck}/>
                </>
            )}
        </Paper>
    );
};

export default DeckSuggestions;
