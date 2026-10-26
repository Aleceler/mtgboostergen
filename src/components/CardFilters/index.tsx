import React from 'react';
import {Box, Button, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import {COLORS} from '../../services/poolAnalysis';
import {
    CardFilterState,
    CMC_OPTIONS,
    COLORLESS,
    EMPTY_FILTERS,
    hasActiveFilters,
    MAX_CMC_FILTER,
    MULTICOLOR,
    RARITIES,
    SORT_OPTIONS,
    SortKey,
} from '../../services/cardFilters';

const MANA_SYMBOL_URL = 'https://svgs.scryfall.io/card-symbols';

type CardFiltersProps = {
    value: CardFilterState;
    onChange: (filters: CardFilterState) => void;
    shown: number;
    total: number;
};

const FilterGroup: React.FC<{ label: string; children: React.ReactNode }> = ({label, children}) => (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {children}
    </Box>
);

const CardFilters: React.FC<CardFiltersProps> = ({value, onChange, shown, total}) => {
    const update = (changes: Partial<CardFilterState>) => onChange({...value, ...changes});

    return (
        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 2}}>
            <FilterGroup label="Cor">
                <ToggleButtonGroup size="small" value={value.colors} onChange={(_event, colors: string[]) => update({colors})} sx={{flexWrap: 'wrap'}}>
                    {COLORS.map((color) => (
                        <ToggleButton key={color.code} value={color.code} title={color.label}>
                            <Box component="img" src={`${MANA_SYMBOL_URL}/${color.code}.svg`} alt={color.label} sx={{width: 20, height: 20}}/>
                        </ToggleButton>
                    ))}
                    <ToggleButton value={MULTICOLOR} title="Multicolor" sx={{textTransform: 'none'}}>
                        Multi
                    </ToggleButton>
                    <ToggleButton value={COLORLESS} title="Incolor">
                        <Box component="img" src={`${MANA_SYMBOL_URL}/C.svg`} alt="Incolor" sx={{width: 20, height: 20}}/>
                    </ToggleButton>
                </ToggleButtonGroup>
            </FilterGroup>

            <FilterGroup label="Custo de mana">
                <ToggleButtonGroup size="small" value={value.cmcs} onChange={(_event, cmcs: number[]) => update({cmcs})}>
                    {CMC_OPTIONS.map((cmc) => (
                        <ToggleButton key={cmc} value={cmc} sx={{minWidth: 36}}>
                            {cmc === MAX_CMC_FILTER ? `${cmc}+` : cmc}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </FilterGroup>

            <FilterGroup label="Raridade">
                <ToggleButtonGroup size="small" value={value.rarities} onChange={(_event, rarities: string[]) => update({rarities})}>
                    {RARITIES.map((rarity) => (
                        <ToggleButton key={rarity.code} value={rarity.code} sx={{textTransform: 'none'}}>
                            {rarity.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </FilterGroup>

            <FilterGroup label="Ordenar por">
                <Select size="small" value={value.sort} onChange={(event) => update({sort: event.target.value as SortKey})} sx={{minWidth: 160}}>
                    {SORT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </Select>
            </FilterGroup>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto'}}>
                <Typography variant="body2" color="text.secondary">{shown} de {total} cartas</Typography>
                {hasActiveFilters(value) && (
                    <Button size="small" onClick={() => onChange({...EMPTY_FILTERS, sort: value.sort})}>
                        Limpar filtros
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default CardFilters;
