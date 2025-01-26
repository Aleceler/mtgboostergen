import cardsData from '../../../aetherdrift.json';
import Cards from '../../components/Cards';
import {useState} from "react";
import AetherDriftImg from '../../assets/images/aetherdriftimg.png'

type Card = {
    id: string;
    name: string;
    rarity: string;
};

const generateBoosterPack = (data: { data: Card[] }) => {
    const commonCards = data.data.filter((card) => card.rarity === 'common');
    const uncommonCards = data.data.filter((card) => card.rarity === 'uncommon');
    const rareCards = data.data.filter((card) => card.rarity === 'rare');
    const mythicCards = data.data.filter((card) => card.rarity === 'mythic');

    const getRandomCards = (pool: Card[], count: number) => {
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
    const [boosters, setBoosters] = useState<Card[][]>([]);

    const generateBoosters = () => {
        const generatedBoosters = [];
        for (let i = 0; i < 6; i++) {
            generatedBoosters.push(generateBoosterPack(cardsData));
        }
        setBoosters(generatedBoosters);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <img src={AetherDriftImg} alt="" style={{marginBottom: '20px'}}/>
            <button
                onClick={generateBoosters}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    background: '#007BFF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Gerar 6 boosters
            </button>
            <div style={{marginTop: '20px'}}>
                {boosters.map((booster, index) => (
                    <Cards key={index} booster={booster}/>
                ))}
            </div>
        </div>
    );
};

export default BoosterDrafter;