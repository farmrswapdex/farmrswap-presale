import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "FarmrSwap",
  projectId: "8X1df9Wbcqj6A7LWG71Ra5yLYj-1eL7y",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

