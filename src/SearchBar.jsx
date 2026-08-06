import { useState } from "react";


export default function SearchBar({ setSearchStarted }) {

    const [query, setQuery] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        const trimmed = query.trim();

        if (!trimmed) return;
            setSearchStarted(true);

        const payload = {
            query: trimmed,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch("http://localhost:9000/", {
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

                <div className="search-actions">
                    <button type="submit" className="search-icon-btn" aria-label="Search">
                        <svg className="search-icon" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                        </svg>
                    </button>
                 </div>
            </form>
        </div>
    );
}
