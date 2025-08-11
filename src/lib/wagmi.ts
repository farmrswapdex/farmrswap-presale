import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Token Presale",
  projectId: (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

