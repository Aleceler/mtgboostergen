import {useEffect, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {BoosterCard, fetchBoosterCards, fetchLatestSets, ScryfallSet} from '../services/scryfall';

export type BoosterSetState = {
    sets: ScryfallSet[];
    selectedSet?: ScryfallSet;
    selectSet: (code: string) => void;
    cards: BoosterCard[];
    loading: boolean;
    error?: string;
};

export const useBoosterSetLoader = (): BoosterSetState => {
    const [sets, setSets] = useState<ScryfallSet[]>([]);
    const [selectedCode, setSelectedCode] = useState<string>();
    const [cards, setCards] = useState<BoosterCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        fetchLatestSets()
            .then((latestSets) => {
                setSets(latestSets);
                setSelectedCode(latestSets[0]?.code);
                if (!latestSets.length) {
                    setLoading(false);
                }
            })
            .catch(() => {
                setError('Não foi possível carregar as edições.');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!selectedCode) {
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(undefined);
        setCards([]);

        fetchBoosterCards(selectedCode)
            .then((loadedCards) => {
                if (!cancelled) {
                    setCards(loadedCards);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Não foi possível carregar as cartas da edição.');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [selectedCode]);

    return {
        sets,
        selectedSet: sets.find((set) => set.code === selectedCode),
        selectSet: setSelectedCode,
        cards,
        loading,
        error,
    };
};

export const useBoosterSet = () => useOutletContext<BoosterSetState>();
