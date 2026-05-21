"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

export default function WalletButton() {
  return (
    <ConnectButton
      showBalance={false}
      chainStatus="none"
      accountStatus={{
        smallScreen: "avatar",
        largeScreen: "full",
      }}
    />
  );
}
