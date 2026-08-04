export default function SearchingModels() {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>
                Searching for available models...
            </h1>

            <div style={styles.loadingBar}>
                <div style={styles.progress}></div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
        maxWidth: "700px",
        margin: "60px auto",
        padding: "40px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        textAlign: "center",
    },

    title: {
        fontSize: "36px",
        color: "#444",
        marginBottom: "30px",
    },

    loadingBar: {
        width: "100%",
        height: "20px",
        background: "#ddd",
        borderRadius: "10px",
        overflow: "hidden",
    },

    progress: {
        width: "50%",
        height: "100%",
        background: "#4285f4",
        borderRadius: "10px",
        animation: "loading 1.5s infinite ease-in-out",
    },
};