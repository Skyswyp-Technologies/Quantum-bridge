"use client";

import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";



export function WalletComponents() {

  const { address, isConnected } = useAccount();

  return (
    <div className="flex justify-end">
      <Wallet>
        
        <ConnectWallet
          className="bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white font-bold py-2 px-4 rounded-full"
        >
            {isConnected && address ? (
          <>
            <Avatar address={address} className="h-6 w-6" />
            <Name address={address} />
          </>
        ) : (
          <span className="text-white">Connect Wallet</span>
        )}
        
        </ConnectWallet>


        <WalletDropdown className="z-[51] mt-2 bg-[#1A1A1A] border border-[#3E4347] rounded-lg shadow-xl">
        {isConnected && address ? (
          <Identity 
            className="px-4 pt-3 pb-2" 
            hasCopyAddressOnClick
            address={address}
          >
            <Avatar address={address} className="w-10 h-10 rounded-full" />
            <Name address={address} className="text-white font-semibold" />
            <Address address={address} className="text-[#A6A9B8] text-sm" />
            <EthBalance address={address} className="text-[#A6A9B8] text-sm" />
          </Identity>
        ) : null}
        <WalletDropdownBasename />
        <WalletDropdownLink
          icon="wallet"
          href="https://keys.coinbase.com"
          className="text-[#A6A9B8] hover:text-white transition-colors duration-200"
        >
          Wallet
        </WalletDropdownLink>
        <WalletDropdownFundLink className="text-[#A6A9B8] hover:text-white transition-colors duration-200" />
        <WalletDropdownDisconnect />
      </WalletDropdown>

      </Wallet>
    </div>
  );
}
