"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import dexiLogo from './images/dexi-logo.jpeg'
// const alchemyUrl =
//     "https://eth-sepolia.g.alchemy.com/v2/vpEAMGP_rB7ZhU43ybQC6agpdVToaV5S";

const alchemyUrl =
    "https://eth-mainnet.g.alchemy.com/v2/vpEAMGP_rB7ZhU43ybQC6agpdVToaV5S";

const dexiAddress = "0xe2cfbbedbce1bd59b1b799c44282e6396d692b84";
const dexiStake = "0xd5a7569973d329747a8D4a398A9A81f9fF5Be1CB";
const dexiStake2 = "0x1810F07671fFF4D03110Ec3bA9B3C8E88D88Ed89";

const dexiStateAbi = [
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "userInfo",
        outputs: [
            { internalType: "address", name: "user", type: "address" },
            { internalType: "uint256", name: "stakedAmount", type: "uint256" },
            { internalType: "uint256", name: "rewardAmount", type: "uint256" },
            { internalType: "uint256", name: "lastOperation", type: "uint256" },
            { internalType: "uint256", name: "unlockTime", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
];

export default function Home() {
    const { isConnecting, address } = useAccount();
    const { disconnect } = useDisconnect();
    const [username, setUsername] = useState("");
    const [solAddress, setSolAddress] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dexiBalance, setDexiBalance] = useState("");
    const [stakedBalance, setStakedBalance] = useState("");
    const [rewardBalance, setRewardBalance] = useState("");

    const checkETHBalance = async () => {
        try {
            // Connect to Ethereum network
            const provider = new ethers.JsonRpcProvider(alchemyUrl);

            // ERC-20 ABI
            const erc20Abi = [
                "function balanceOf(address owner) view returns (uint256)",
                "function decimals() view returns (uint8)",
            ];

            // Create a contract instance for the token
            const tokenContract = new ethers.Contract(
                dexiAddress,
                erc20Abi,
                provider
            );

            // Fetch the token balance and decimals
            const rawBalance = await tokenContract.balanceOf(address);
            const decimals = await tokenContract.decimals();

            // Format the balance
            const formattedBalance = Number(
                ethers.formatUnits(rawBalance, decimals)
            )
                .toFixed(3)
                .toString();

            // Fetch staking details
            const stakeContract = new ethers.Contract(
                dexiStake,
                dexiStateAbi,
                provider
            );
            const userInfo = await stakeContract.userInfo(address);

            const stakeContract2 = new ethers.Contract(
                dexiStake2,
                dexiStateAbi,
                provider
            );
            const userInfo2 = await stakeContract2.userInfo(address);

            const formattedStakedAmount = Number(
                ethers.formatUnits(
                    userInfo?.stakedAmount + userInfo2?.stakedAmount,
                    decimals
                )
            )
                .toFixed(3)
                .toString();

            const formattedRewardAmount = Number(
                ethers.formatUnits(
                    userInfo?.rewardAmount + userInfo2?.rewardAmount,
                    decimals
                )
            )
                .toFixed(3)
                .toString();

            setDexiBalance(formattedBalance);
            setStakedBalance(formattedStakedAmount);
            setRewardBalance(formattedRewardAmount);

            return {
                formattedBalance,
                formattedStakedAmount,
                formattedRewardAmount,
            };
        } catch (error) {
            console.error("Error fetching balance or staking info:", error);
            toast.error("Error fetching balance or staking info");
            return null;
        }
    };

    const handleNext = async () => {
        if (step === 1 && !username) {
            toast.warn("Please enter a username");
            return;
        }

        if (step === 2 && !address) {
            toast.warn("Please connect your wallet");
            return;
        }

        if (step == 2) {
            checkETHBalance();
        }

        if (step === 3 && !solAddress) {
            toast.warn("Please enter your Solana address");
            return;
        }

        setStep(step + 1);
    };

    const handleSubmit = async () => {
        if (!solAddress) {
            toast.warn("Please enter your Solana address");
            return;
        }

        setLoading(true);

        try {
            // Fetch balance and staking details
            const result = await checkETHBalance();
            if (!result) {
                setLoading(false);
                return;
            }

            const {
                formattedBalance,
                formattedStakedAmount,
                formattedRewardAmount,
            } = result;

            // Send data to Telegram API
            await axios.post("/api/send-to-telegram", {
                username,
                address,
                balance: formattedBalance,
                stakedAmount: formattedStakedAmount,
                rewardAmount: formattedRewardAmount,
                solAddress,
            });

            setLoading(false);
            setStep(5);
            toast.success("Submitted successfully");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to submit information");
            setLoading(false);
        }
    };

    useEffect(() => {
        disconnect();
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center bg-black justify-center p-4">
            <ToastContainer />
            <img src="/dexi-logo.jpeg" alt="Dexi Logo" className="w-32 mb-8" />
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
                                    className="w-full dexi-blue py-3 rounded-lg hover:opacity-90 transition"
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
                                    className="w-full dexi-blue py-3 rounded-lg hover:opacity-90 transition"
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
                                    className="w-full dexi-blue py-3 rounded-lg hover:opacity-90 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                                    Review Your Information
                                </h1>
                                <div className="bg-gray-100 p-4 rounded-lg mb-4 flex flex-col gap-2">
                                    <p>
                                        <strong>Username:</strong> {username}
                                    </p>
                                    <p>
                                        <strong>Ethereum Address:</strong>{" "}
                                        {address}
                                    </p>
                                    <p>
                                        <strong>Dexi Balance:</strong>{" "}
                                        {dexiBalance}
                                    </p>
                                    <p>
                                        <strong>Staked Balance:</strong>{" "}
                                        {stakedBalance}
                                    </p>
                                    <p>
                                        <strong>Reward Amount:</strong>{" "}
                                        {rewardBalance}
                                    </p>
                                    <p>
                                        <strong>Total Balance:</strong>{" "}
                                        {Number(dexiBalance) +
                                            Number(stakedBalance) +
                                            Number(rewardBalance)}
                                    </p>
                                    <p>
                                        <strong>Solana Address:</strong>{" "}
                                        {solAddress}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
                                >
                                    Submit
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center">
                                <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
                                <p className="ml-2 text-blue-500">Loading...</p>
                            </div>
                        ) : (
                            step === 5 && (
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-800 mb-4  text-center">
                                        Thank You
                                    </h1>
                                    <p className="text-center mb-4">
                                        Your information has been submitted
                                        successfully.
                                    </p>
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
