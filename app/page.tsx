"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";

// const alchemyUrl =
//     "https://eth-sepolia.g.alchemy.com/v2/vpEAMGP_rB7ZhU43ybQC6agpdVToaV5S";

const alchemyUrl =
    "https://eth-mainnet.g.alchemy.com/v2/vpEAMGP_rB7ZhU43ybQC6agpdVToaV5S";

const dexiAddress = "0xe2cfbbedbce1bd59b1b799c44282e6396d692b84";

export default function Home() {
    const { isConnecting, address } = useAccount();
    const [username, setUsername] = useState("");
    const [solAddress, setSolAddress] = useState("");
    const [balance, setBalance] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const checkETHBalance = async () => {
        try {
            // Connect to Ethereum network
            const provider = new ethers.JsonRpcProvider(alchemyUrl);

            // ERC-20 ABI
            const erc20Abi = [
                "function balanceOf(address owner) view returns (uint256)",
                "function decimals() view returns (uint8)",
            ];

            // Create a contract instance
            const tokenContract = new ethers.Contract(
                dexiAddress,
                erc20Abi,
                provider
            );

            // Fetch the token balance and decimals
            const rawBalance = await tokenContract.balanceOf(address);
            const decimals = await tokenContract.decimals();

            // Format the balance
            const formattedBalance = ethers.formatUnits(rawBalance, decimals);

            setBalance(formattedBalance);
        } catch (error) {
            console.error("Error fetching balance:", error);
            toast.error("Error fetching balance");
        }
    };

    const handleNext = async () => {
        if (step === 1 && !username) {
            toast.warn("Please enter a username");
            return;
        }

        if (step === 2 && !address) {
            toast.warn("Please connect your wallet");
            await checkETHBalance();
            return;
        }

        if (step === 3 && !solAddress) {
            toast.warn("Please enter your Solana address");
            return;
        }

        setStep(step + 1);
    };

    const handleSubmit = async () => {
        let currentBalance = balance;

        setLoading(true);
        // Fetch the balance if it's not already fetched
        if (!currentBalance) {
            try {
                await checkETHBalance();
                // Use the fetched balance after state update
                const provider = new ethers.JsonRpcProvider(alchemyUrl);
                const erc20Abi = [
                    "function balanceOf(address owner) view returns (uint256)",
                    "function decimals() view returns (uint8)",
                ];
                const tokenContract = new ethers.Contract(
                    dexiAddress,
                    erc20Abi,
                    provider
                );
                const rawBalance = await tokenContract.balanceOf(address);
                const decimals = await tokenContract.decimals();
                currentBalance = ethers.formatUnits(rawBalance, decimals);
            } catch (error) {
                console.error("Error fetching balance:", error);
                toast.error("Error fetching balance");
                return;
            } finally {
                setLoading(false); // Stop loading
            }
        }

        try {
            console.log(currentBalance);
            await axios.post("/api/send-to-telegram", {
                username,
                address,
                balance: currentBalance,
                solAddress,
            });
            toast.success("Submitted successfully");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to submit information");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-primary justify-center p-4">
            <ToastContainer />
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                {loading ? ( // Show loading spinner or message
                    <div className="flex justify-center items-center">
                        <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
                        <p className="ml-2 text-blue-500">Loading...</p>
                    </div>
                ) : (
                    <>
                        {step === 1 && (
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                                    Enter Username
                                </h1>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Enter your username"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                />
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                                    Connect Wallet
                                </h1>
                                <div className="mb-6">
                                    <ConnectKitButton />
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                                    Enter Solana Address
                                </h1>
                                <input
                                    type="text"
                                    value={solAddress}
                                    onChange={(e) =>
                                        setSolAddress(e.target.value)
                                    }
                                    placeholder="Enter your Solana address"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                />
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                                    Thank You
                                </h1>
                                <p className="text-center mb-4">
                                    Your information has been collected. Submit
                                    it now.
                                </p>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
