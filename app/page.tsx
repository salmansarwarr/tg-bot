"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

export default function Home() {
    const { isConnecting, address } = useAccount();
    const [username, setUsername] = useState("");

    const handleSubmit = async () => {
        if (!username) {
            toast.warn("Please enter a username");
            return;
        }

        if (!address) {
            toast.warn("Please connect your wallet");
            return;
        }

        try {
            await axios.post("/api/send-to-telegram", {
                username,
                address,
            });
            toast.success("Submitted succesfully");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to submit username");
        }
    };

    if (isConnecting)
        return <div className="text-center text-lg">Connecting...</div>;

    return (
        <div className="flex min-h-screen flex-col items-center bg-primary justify-center p-4">
            <ToastContainer/>
            <div className="mb-6">
                <ConnectKitButton />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                    Enter Username
                </h1>

                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
