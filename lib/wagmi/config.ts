import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
