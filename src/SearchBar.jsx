import { useState } from "react";

export default function SearchBar() {

    const [query, setQuery] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        const trimmed = query.trim();

        if (!trimmed) return;

        const payload = {
            query: trimmed,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log(data);

            setQuery("");

        } catch(error) {
            console.error(error);
        }
    }


    return (
        <div className="search-container">

            <form 
                className="search-form"
                onSubmit={handleSubmit}
            >

                <input
                    className="search-input"
                    autoFocus
                    autoComplete="off"
                    placeholder="Search..."
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                />

                <button
                    className="search-icon-btn"
                    type="submit"
                >
                    🔍
                </button>

            </form>

        </div>
    );
}
