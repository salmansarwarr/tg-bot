import { NextResponse } from "next/server";
import axios from "axios";

// Replace with your bot token and chat ID
const TELEGRAM_BOT_TOKEN = "7589839454:AAETPvy6RLVdJvnGuYIfKSBt4BFc_3hyJjk";
const TELEGRAM_CHAT_ID = "-1002488144868";


export async function POST(request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { username, address } = body;

        // Check if username exists
        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        // Prepare and send message to Telegram
        const message = `New username received: ${username} with wallet address: ${address}`;
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
