import { useEffect, useState } from "react";
import ModelCard from "./model_card.jsx";
import NoModels from "./NoModels.jsx";

function ModelCards() {
  const [cards, setCards] = useState([]);
  const [searchComplete, setSearchComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const found = [];

      for (let i = 1; i<=15; i++) {
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

      try {
        const statusResponse = await fetch("http://localhost:9000/search-status");
        const status = await statusResponse.json();

        setSearchComplete(status.complete);

      } catch (err) {
        console.error("Failed to get search status:", err);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (searchComplete && cards.length === 0) {
    return <NoModels />;
  }

  return (
    <div className="model-cards">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              flex: "0 0 350px",
            }}
          >
            <ModelCard model={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModelCards;