import React, { useState } from "react";
import ModelCards from "./display_cards";

export default function App() {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const payload = {
      query: trimmedQuery,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Successfully created and populated /src/search.json:', data);
      setQuery('');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  return (
    <div style={appStyles.body}>
      <div style={appStyles.mainContainer}>
        <div style={appStyles.searchContainer}>
          <form style={appStyles.searchForm} onSubmit={handleSubmit}>
            <input 
              type="text" 
              style={appStyles.searchInput} 
              autoFocus 
              autoComplete="off" 
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div style={appStyles.searchActions}>
              <button type="submit" style={appStyles.searchIconBtn} aria-label="Search">
                <svg style={appStyles.searchIcon} focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
        <ModelCards />
      </div>
    </div>
  );
}

const appStyles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: "linear-gradient(rgba(10, 15, 25, 0.55), rgba(10, 15, 25, 0.55)), url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop') no-repeat center center fixed",
    backgroundSize: "cover",
    color: "#202124",
    minHeight: "100vh",
    backdropFilter: "blur(6px)",
    boxSizing: "border-box",
    margin: 0,
    padding: "40px 20px",
  },
  mainContainer: {
    maxWidth: "620px",
    margin: "0 auto",
  },
  searchContainer: {
    width: "100%",
    marginBottom: "30px",
    textAlign: "center",
  },
  searchForm: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: "30px",
    padding: "6px 8px 6px 18px",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    boxSizing: "border-box",
  },
  searchInput: {
    flex: 1,
    height: "44px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    background: "transparent",
    color: "#202124",
    paddingRight: "12px",
  },
  searchActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  searchIconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  searchIcon: {
    width: "20px",
    height: "20px",
    fill: "#5f6368",
  },
};