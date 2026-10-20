import React, {ChangeEvent, useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import {useBoosterSet} from '../../hooks/useBoosterSet';
import {fetchTiers} from '../../services/supabase';
import {
    analyzePool,
    CardGroup,
    COLORS,
    filterGroupsByColors,
    imageToDataUrl,
    isCreature,
    isLand,
    PoolAnalysis as Analysis,
    RecognizedCard,
    recognizePoolCards,
} from '../../services/poolAnalysis';
import mockRecognition from '../../mocks/poolRecognition.json';
import PoolCardList from '../../components/PoolCardList';
import DeckSuggestions from '../../components/DeckSuggestions';

const MANA_SYMBOL_URL = 'https://svgs.scryfall.io/card-symbols';

const formatScore = (score?: number) => (score === undefined ? '-' : score.toFixed(1));

const GroupAccordions: React.FC<{ groups: CardGroup[]; defaultExpanded?: boolean }> = ({groups, defaultExpanded}) => {
    if (!groups.length) {
        return <Typography variant="body2">Nada encontrado.</Typography>;
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            {groups.map((group) => (
                <Accordion
                    key={group.label}
                    disableGutters
                    defaultExpanded={defaultExpanded}
                    slotProps={{transition: {unmountOnExit: true}}}
                    sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        overflow: 'hidden',
                        '&::before': {display: 'none'},
                    }}
                >
                    <AccordionSummary
                        expandIcon={<Typography component="span" sx={{fontSize: 18, lineHeight: 1}}>▾</Typography>}
                        sx={{
                            backgroundColor: 'action.hover',
                            transition: 'background-color 0.2s',
                            '&:hover': {backgroundColor: 'action.selected'},
                            '&.Mui-expanded': {borderBottom: 1, borderColor: 'divider'},
                        }}
                    >
                        <Typography sx={{flexGrow: 1, fontWeight: 500}}>{group.label}</Typography>
                        <Chip size="small" label={group.count} color="primary" sx={{marginRight: 1}}/>
                    </AccordionSummary>
                    <AccordionDetails>
                        <PoolCardList cards={group.cards} width={90}/>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({title, children, action}) => (
    <Paper sx={{padding: 2}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, marginBottom: 1}}>
            <Typography variant="h6">{title}</Typography>
            {action}
        </Box>
        {children}
    </Paper>
);

const ColorFilter: React.FC<{ value: string[]; onChange: (colors: string[]) => void }> = ({value, onChange}) => (
    <ToggleButtonGroup size="small" value={value} onChange={(_event, colors: string[]) => onChange(colors)}>
        {COLORS.map((color) => (
            <ToggleButton key={color.code} value={color.code} title={color.label}>
                <Box component="img" src={`${MANA_SYMBOL_URL}/${color.code}.svg`} alt={color.label} sx={{width: 20, height: 20}}/>
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);

const PoolAnalysis: React.FC = () => {
    const {selectedSet, cards, loading, error} = useBoosterSet();
    const [image, setImage] = useState<string>();
    const [analysis, setAnalysis] = useState<Analysis>();
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string>();
    const [synergyColors, setSynergyColors] = useState<string[]>([]);

    useEffect(() => {
        setAnalysis(undefined);
        setAnalysisError(undefined);
        setSynergyColors([]);
    }, [selectedSet?.code]);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }

        setAnalysis(undefined);
        setAnalysisError(undefined);

        try {
            setImage(await imageToDataUrl(file));
        } catch {
            setAnalysisError('Não foi possível ler a imagem.');
        }
    };

    const runAnalysis = async (recognize: () => Promise<RecognizedCard[]>) => {
        if (!selectedSet) {
            return;
        }

        setAnalyzing(true);
        setAnalysisError(undefined);

        try {
            const [recognized, tiers] = await Promise.all([recognize(), fetchTiers(selectedSet.code)]);
            setAnalysis(analyzePool(recognized, cards, tiers));
        } catch (analyzeError) {
            const detail = analyzeError instanceof Error ? `: ${analyzeError.message}` : '.';
            setAnalysisError(`Não foi possível analisar a imagem${detail}`);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAnalyze = () => {
        if (!image || !selectedSet) {
            return;
        }
        runAnalysis(() => recognizePoolCards(image, selectedSet.name, cards.map((card) => card.name)));
    };

    const handleUseMock = () => runAnalysis(async () => mockRecognition.cards);

    if (loading) {
        return <CircularProgress/>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    const creatures = analysis?.cards.filter(isCreature) ?? [];
    const spells = analysis?.cards.filter((card) => !isCreature(card) && !isLand(card)) ?? [];
    const lands = analysis?.cards.filter(isLand) ?? [];

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <Paper sx={{padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                <Typography variant="h5" sx={{textAlign: 'center'}}>Análise do pool - {selectedSet?.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center'}}>
                    Envie uma foto das cartas do seu sealed para comparar com os tiers que você configurou.
                </Typography>
                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center'}}>
                    <Button variant="outlined" component="label" disabled={analyzing}>
                        Escolher imagem
                        <input type="file" accept="image/*" hidden onChange={handleFileChange}/>
                    </Button>
                    <Button variant="contained" onClick={handleAnalyze} disabled={!image || analyzing || !cards.length}>
                        Analisar
                    </Button>
                    {import.meta.env.DEV && (
                        <Button onClick={handleUseMock} disabled={analyzing || !cards.length}>
                            Usar exemplo
                        </Button>
                    )}
                </Box>
                {image && (
                    <Box component="img" src={image} alt="Pool enviado" sx={{maxWidth: '100%', maxHeight: 400, borderRadius: 1}}/>
                )}
                {analyzing && <CircularProgress/>}
                {analysisError && <Alert severity="error">{analysisError}</Alert>}
            </Paper>

            {analysis && (
                <>
                    <Paper sx={{padding: 2, display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                        <Typography><strong>Cartas reconhecidas:</strong> {analysis.total}</Typography>
                        <Typography><strong>Nota média (S=5, E=0):</strong> {formatScore(analysis.averageScore)}</Typography>
                    </Paper>

                    {analysis.unmatched.length > 0 && (
                        <Alert severity="warning">
                            Não encontradas na edição: {analysis.unmatched.join(', ')}
                        </Alert>
                    )}

                    <Section title={`Bombas - tier S e A (${analysis.bombs.reduce((sum, group) => sum + group.count, 0)})`}>
                        <GroupAccordions groups={analysis.bombs} defaultExpanded/>
                    </Section>

                    <DeckSuggestions cards={analysis.cards}/>

                    <Section title="Tiers">
                        <GroupAccordions groups={analysis.tiers.filter((group) => group.count > 0)}/>
                    </Section>

                    <Section title="Cores">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Cor</TableCell>
                                    <TableCell align="right">Cartas</TableCell>
                                    <TableCell align="right">Nota média</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {analysis.colors.map((color) => (
                                    <TableRow key={color.code}>
                                        <TableCell>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <Box component="img" src={`${MANA_SYMBOL_URL}/${color.code}.svg`} alt="" sx={{width: 18, height: 18}}/>
                                                {color.label}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">{color.count}</TableCell>
                                        <TableCell align="right">{formatScore(color.averageScore)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell>Multicolor</TableCell>
                                    <TableCell align="right">{analysis.multicolor}</TableCell>
                                    <TableCell/>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Incolor</TableCell>
                                    <TableCell align="right">{analysis.colorless}</TableCell>
                                    <TableCell/>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Section>

                    <Section title="Sinergias no texto" action={<ColorFilter value={synergyColors} onChange={setSynergyColors}/>}>
                        <GroupAccordions groups={filterGroupsByColors(analysis.synergies, synergyColors)}/>
                    </Section>

                    <Section title="Palavras-chave" action={<ColorFilter value={synergyColors} onChange={setSynergyColors}/>}>
                        <GroupAccordions groups={filterGroupsByColors(analysis.keywords, synergyColors)}/>
                    </Section>

                    <Section title={`Criaturas (${creatures.reduce((sum, card) => sum + card.count, 0)})`}>
                        <PoolCardList cards={creatures} width={130}/>
                    </Section>

                    <Section title={`Mágicas (${spells.reduce((sum, card) => sum + card.count, 0)})`}>
                        <PoolCardList cards={spells} width={130}/>
                    </Section>

                    {lands.length > 0 && (
                        <Section title={`Terrenos (${lands.reduce((sum, card) => sum + card.count, 0)})`}>
                            <PoolCardList cards={lands} width={130}/>
                        </Section>
                    )}
                </>
            )}
        </Box>
    );
};

export default PoolAnalysis;
