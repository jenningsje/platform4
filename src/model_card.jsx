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
  } = model || {};

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          {name || "Unnamed Model"}
        </h2>

        {platform && (
          <span style={styles.platform}>
            {platform}
          </span>
        )}
      </div>

      <p style={styles.creator}>
        By {creator || "Unknown"}
      </p>

      <p style={styles.description}>
        {description || "No description available."}
      </p>

      {capabilities && capabilities.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            Capabilities
          </h4>

          <div style={styles.badgeContainer}>
            {capabilities.map((cap, index) => (
              <span
                key={index}
                style={styles.badge}
              >
                {String(cap)}
              </span>
            ))}
          </div>
        </div>
      )}

      {citation && (
        <p style={styles.citation}>
          <strong>Citation:</strong>{" "}
          {citation}
        </p>
      )}

      <div style={styles.footer}>
        <span style={styles.license}>
          License: {license || "N/A"}
        </span>

        {usage_link && (
          <a
            href={usage_link}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            Launch Model →
          </a>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#1a1d24",
    backgroundImage:
      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)",

    border: "1px solid rgba(255,255,255,0.1)",

    boxShadow:
      "0 8px 32px rgba(0,0,0,0.37), inset 0 1px 1px rgba(255,255,255,0.08)",

    borderRadius: "12px",

    padding: "24px",

    color: "#e2e8f0",

    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",

    width: "350px",
    maxWidth: "100%",

    flex: "0 0 350px",

    margin: 0,

    boxSizing: "border-box",

    overflow: "hidden",

    backdropFilter: "blur(4px)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",

    gap: "12px",

    marginBottom: "8px",

    minWidth: 0,
  },

  title: {
    margin: 0,

    fontSize: "20px",
    fontWeight: "600",

    color: "#f8fafc",

    lineHeight: "1.3",

    minWidth: 0,

    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  platform: {
    backgroundColor: "#334155",

    color: "#94a3b8",

    fontSize: "11px",

    padding: "4px 8px",

    borderRadius: "6px",

    textTransform: "uppercase",

    letterSpacing: "0.5px",

    flexShrink: 0,

    maxWidth: "45%",

    overflowWrap: "anywhere",

    wordBreak: "break-word",

    textAlign: "center",
  },

  creator: {
    margin: "0 0 12px 0",

    fontSize: "14px",

    color: "#94a3b8",

    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  description: {
    margin: "0 0 16px 0",

    fontSize: "14px",

    lineHeight: "1.5",

    color: "#cbd5e1",

    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  section: {
    marginBottom: "16px",

    minWidth: 0,
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

    width: "100%",

    minWidth: 0,
  },

  badge: {
    backgroundColor: "rgba(51,65,85,0.5)",

    border: "1px solid rgba(255,255,255,0.05)",

    color: "#cbd5e1",

    fontSize: "12px",

    padding: "3px 8px",

    borderRadius: "4px",

    maxWidth: "100%",

    overflowWrap: "anywhere",
    wordBreak: "break-word",

    boxSizing: "border-box",
  },

  citation: {
    margin: "0 0 16px 0",

    fontSize: "12px",

    color: "#64748b",

    fontStyle: "italic",

    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  footer: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    flexWrap: "wrap",

    gap: "10px",

    paddingTop: "12px",

    borderTop:
      "1px solid rgba(255,255,255,0.06)",

    fontSize: "12px",

    color: "#64748b",

    minWidth: 0,
  },

  license: {
    textTransform: "uppercase",

    letterSpacing: "0.5px",

    maxWidth: "100%",

    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  link: {
    backgroundColor: "#3b82f6",

    color: "#ffffff",

    padding: "6px 12px",

    borderRadius: "6px",

    textDecoration: "none",

    fontWeight: "500",

    transition: "background-color 0.2s",

    flexShrink: 0,
  },
};