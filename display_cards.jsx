import { useEffect, useState } from "react";
import ModelCard from "./model_card.jsx";

function ModelCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const found = [];

      for (let i = 0; ; i++) {
        try {
          const response = await fetch(`/model_card${i}.json`);

          if (!response.ok) {
            break; // no more model cards
          }

          const json = await response.json();
          found.push(json);

        } catch (err) {
          break;
        }
      }

      setCards(found);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {cards.map((card, index) => (
        <ModelCard key={index} model={card} />
      ))}
    </div>
  );
}

export default ModelCards;