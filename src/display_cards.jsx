import { useEffect, useState } from "react";
import ModelCard from "./model_card.jsx";
import NoModels from "./NoModels.jsx";
import SearchingModels from "./SearchingModels.jsx";

function ModelCards({ searchStarted }) {
    const [cards, setCards] = useState([]);
    const [searchComplete, setSearchComplete] = useState(false);
    const [searchError, setSearchError] = useState(false);

    useEffect(() => {
        if (!searchStarted) {
            setCards([]);
            setSearchComplete(false);
            setSearchError(false);
            return;
        }

        // A new search has started.
        // Immediately remove the previous search's cards.
        setCards([]);
        setSearchComplete(false);
        setSearchError(false);

        let cancelled = false;

        async function checkSearch() {
            if (cancelled) {
                return;
            }

            try {
                /*
                 * Ask the backend for the current search status.
                 */
                const statusResponse = await fetch(
                    "http://localhost:9000/search-status",
                    {
                        cache: "no-store",
                    }
                );

                if (!statusResponse.ok) {
                    throw new Error(
                        `Status request failed: ${statusResponse.status}`
                    );
                }

                const status = await statusResponse.json();

                if (cancelled) {
                    return;
                }

                /*
                 * Only load model cards while/after the current
                 * search is active.
                 */
                const found = [];

                for (let i = 1; i <= 15; i++) {
                    try {
                        const response = await fetch(
                            `../model_cards/model_card${i}.json`,
                            {
                                cache: "no-store",
                            }
                        );

                        if (!response.ok) {
                            break;
                        }

                        const json = await response.json();
                        found.push(json);
                    } catch (err) {
                        break;
                    }
                }

                if (cancelled) {
                    return;
                }

                setCards(found);

                /*
                 * The backend is the authority on whether the
                 * current search has finished.
                 */
                if (status.complete) {
                    setSearchComplete(true);
                    return;
                }

                /*
                 * Search is still running. Keep polling.
                 */
                setTimeout(checkSearch, 1000);

            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to check search status:",
                    err
                );

                /*
                 * Do not declare the search complete merely because
                 * a polling request failed.
                 */
                setSearchError(true);

                setTimeout(checkSearch, 2000);
            }
        }

        /*
         * Start immediately instead of waiting one second.
         */
        checkSearch();

        return () => {
            cancelled = true;
        };
    }, [searchStarted]);


    if (!searchStarted) {
        return null;
    }


    if (searchError && !searchComplete && cards.length === 0) {
        return <SearchingModels />;
    }


    if (!searchComplete && cards.length === 0) {
        return <SearchingModels />;
    }


    if (searchComplete && cards.length === 0) {
        return <NoModels />;
    }


    return (
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
    );
}

export default ModelCards;