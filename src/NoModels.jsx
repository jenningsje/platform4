// NoModels.jsx

export default function NoModels() {
    return (
        <div style={styles.container}>
            <img
                src="https://media.tenor.com/QxXwM7JQwW4AAAAi/pusheen-sad.gif"
                alt="Sad Pusheen"
                style={styles.image}
            />

            <h1 style={styles.title}>
                Sorry!
            </h1>

            <p style={styles.message}>
                There are no models available for that search.
            </p>
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

    image: {
        width: "220px",
        marginBottom: "24px",
    },

    title: {
        fontSize: "42px",
        color: "#444",
        marginBottom: "16px",
    },

    message: {
        fontSize: "24px",
        color: "#666",
        lineHeight: 1.4,
    },
};