import React from "react";

export default function ModelCard({ model }) {
  const {
    name,
    creator,
    platform,
    usage_link,
    citation,
    description,
    capabilities,
    license,
  } = model;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{name}</h2>
        {platform && <span style={styles.platform}>{platform}</span>}
      </div>

      <p style={styles.creator}>By {creator}</p>
      <p style={styles.description}>{description}</p>

      {capabilities && capabilities.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Capabilities</h4>
          <div style={styles.badgeContainer}>
            {capabilities.map((cap, index) => (
              <span key={index} style={styles.badge}>
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {citation && (
        <p style={styles.citation}>
          <strong>Citation:</strong> {citation}
        </p>
      )}

      <div style={styles.footer}>
        <span style={styles.license}>License: {license || "N/A"}</span>
        {usage_link && (
          <a
            href={usage_link}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            Launch Model &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#1a1d24",
    backgroundImage: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "24px",
    color: "#e2e8f0",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    maxWidth: "480px",
    margin: "16px auto",
    backdropFilter: "blur(4px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#f8fafc",
  },
  platform: {
    backgroundColor: "#334155",
    color: "#94a3b8",
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  creator: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    color: "#94a3b8",
  },
  description: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#cbd5e1",
  },
  section: {
    marginBottom: "16px",
  },
  sectionTitle: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#64748b",
  },
  badgeContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  badge: {
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    color: "#cbd5e1",
    fontSize: "12px",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  citation: {
    margin: "0 0 16px 0",
    fontSize: "12px",
    color: "#64748b",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    fontSize: "12px",
    color: "#64748b",
  },
  license: {
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  link: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
};
