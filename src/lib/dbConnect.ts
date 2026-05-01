import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
    connectionPromise?: Promise<void>;
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    // Prevent multiple concurrent connection attempts during cold start
    if (connection.connectionPromise) {
        return connection.connectionPromise;
    }

    connection.connectionPromise = (async () => {
        try {
            const db = await mongoose.connect(process.env.MONGODB_URI as string)
            connection.isConnected = db.connections[0].readyState
            console.log("DB Connected Successfully")
        } catch (error) {
            console.log("Database connection failed", error);
            connection.connectionPromise = undefined;
            process.exit(1)
        }
    })();

    return connection.connectionPromise;
}

export default dbConnect;