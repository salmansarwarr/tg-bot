"use client";

import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
    getDefaultConfig({
        alchemyId:
            "https://eth-mainnet.g.alchemy.com/v2/vpEAMGP_rB7ZhU43ybQC6agpdVToaV5S",
        walletConnectProjectId: "99296b5d7acb2ca478909bd3e7b4f780",

        appName: "Nextjs14 ConnectKit",
        appDescription: "Nextjs14 - ConnectKit",
        appUrl: "https://family.co",
        appIcon: "https://family.co/logo.png",
        autoConnect: false
    })
);

export const ConnectkitProvider = ({ children }: any) => {
    return (
        <WagmiConfig config={config}>
            <ConnectKitProvider theme="retro">{children}</ConnectKitProvider>
        </WagmiConfig>
    );
};
