import { NextResponse } from "next/server";
import axios from "axios";

const TELEGRAM_BOT_TOKEN = "7589839454:AAETPvy6RLVdJvnGuYIfKSBt4BFc_3hyJjk";
const TELEGRAM_CHAT_ID = "-1002488144868";

// TEST CREDENTIALS
// const TELEGRAM_BOT_TOKEN = "7632341268:AAGd_URy_yqWRe0pzbIpTT0Bn9SoNRLtTQY";
// const TELEGRAM_CHAT_ID = "-1002468945866";

export async function POST(request) {
    try {
        // Parse the request body
        const body = await request.json();
        const {
            username,
            address,
            balance,
            stakedAmount,
            rewardAmount,
            solAddress,
        } = body;

        // Check if username exists
        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        // Prepare and send message to Telegram
        const message = `NEW SUBMISSION\n\nTelegram: ${username}\n\nAddress: ${address}\n\nDexi Balance: ${balance}\nStaked Balance: ${stakedAmount}\nReward Amount: ${rewardAmount}\nTotal Balance: ${(
            Number(balance) +
            Number(stakedAmount) +
            Number(rewardAmount)
        ).toFixed(3)}\n\nSolana Address: ${solAddress}`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
        });

        return NextResponse.json(
            { success: true, message: "Message sent to Telegram!" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending message to Telegram:", error);
        return NextResponse.json(
            { error: "Failed to send message to Telegram" },
            { status: 500 }
        );
    }
}
