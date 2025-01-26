import {useState} from "react";

type CardProps = {
    id: string;
    name: string;
    manaCost: number;
    image_uris: {
        small: string;
        normal: string;
        large: string;
    };
};

type CardsProps = {
    booster: CardProps[];
};

const Cards = ({booster}: CardsProps) => {
    const [selectedCards, setSelectedCards] = useState<CardProps[]>([]);

    const handleSelectCard = (card: CardProps) => {
        if (selectedCards.find(selected => selected.id === card.id)) {
            setSelectedCards(
                selectedCards
                    .filter(selected => selected.id !== card.id)
                    .sort((a, b) => a.manaCost - b.manaCost)
            );
        } else {
            setSelectedCards(
                [...selectedCards, card].sort((a, b) => a.manaCost - b.manaCost)
            );
        }
    };

    const isMobile = window.innerWidth <= 768;

    return (
        <div>
            <div style={{marginBottom: '20px'}}>
                {selectedCards.length > 0 && <h3>Cartas Selecionadas:</h3>}
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center'}}>
                    {selectedCards.map((card) => (
                        <div
                            key={card.id}
                            style={{
                                maxWidth: '150px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                transform: 'scale(1)',
                                zIndex: 1,
                            }}
                            onClick={() => handleSelectCard(card)}
                            onMouseEnter={(e) => {
                                if (!isMobile) {
                                    e.currentTarget.style.transform = 'scale(2.2)';
                                    e.currentTarget.style.zIndex = '10';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.zIndex = '1';
                            }}
                        >
                            <img
                                src={card.image_uris.normal}
                                alt={card.name}
                                style={{width: '100%', borderRadius: '8px'}}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div style={{marginBottom: '20px'}}>
                <h3>Cartas da Pool:</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center'}}>
                    {booster.map((card, index) => {
                        const isSelected = selectedCards.some(selected => selected.id === card.id);

                        return (
                            <div
                                key={index}
                                style={{
                                    maxWidth: '150px',
                                    textAlign: 'center',
                                    cursor: isSelected ? 'not-allowed' : 'pointer',
                                    opacity: isSelected ? 0.5 : 1,
                                    transition: 'transform 0.2s',
                                    position: 'relative',
                                    transform: 'scale(1)',
                                    zIndex: 1,
                                }}
                                onClick={() => !isSelected && handleSelectCard(card)}
                                onMouseEnter={(e) => {
                                    if (!isMobile && !isSelected) {
                                        e.currentTarget.style.transform = 'scale(2.2)';
                                        e.currentTarget.style.zIndex = '10';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.zIndex = '1';
                                }}
                            >
                                <img
                                    src={card.image_uris.normal}
                                    alt={card.name}
                                    style={{
                                        width: '100%',
                                        borderRadius: '8px',
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Cards;