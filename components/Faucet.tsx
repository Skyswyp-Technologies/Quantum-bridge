"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBridge } from "@/context/BridgeContext";
import { bridgeWrapper } from "@/helpers/helpers";
import { SupportedChain } from "@/helpers/inteface/interface";
import { useAccount, useConnect } from "wagmi";

interface ContentProps {
  address: string;
  setAddress: (address: string) => void;
  handleClaim: () => Promise<void>;
  isLoading: boolean;
  isWalletConnected: boolean;
  chainId: number | undefined;
  connectWallet: () => void;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  tokenSymbol: string;
  chain: string;
  recipientAddress: string;
  txHash: string;
}

const Loader: React.FC = () => (
  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 animate-spin"></div>
);

const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const shortenTxHash = (hash: string): string => {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

const getExplorerUrl = (chain: string, txHash: string): string => {
  switch (chain) {
    case "eth-sepolia":
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case "base-sepolia":
      return `https://sepolia-explorer.base.org/tx/${txHash}`;
    default:
      return "#";
  }
};

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  amount,
  tokenSymbol,
  chain,
  recipientAddress,
  txHash,
}) => {
  if (!isOpen) return null;

  const shortAddress = shortenAddress(recipientAddress);
  const shortTxHash = shortenTxHash(txHash);
  const explorerUrl = getExplorerUrl(chain, txHash);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1ACC] border border-[#A6A9B880] rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Successful!</h2>
        <p className="text-gray-300 mb-4">
          You have successfully claimed your test tokens!
        </p>
        <div className="space-y-2 mb-6">
          <p className="text-white">
            <span className="font-bold">Amount:</span> {amount} {tokenSymbol}{" "}
            (USDT)
          </p>
          <p className="text-white">
            <span className="font-bold">Chain:</span> {chain}
          </p>
          <p className="text-white">
            <span className="font-bold">Recipient:</span> {shortAddress}
          </p>
          <p className="text-white">
            <span className="font-bold">Tx Hash:</span>{" "}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {shortTxHash}
            </a>
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-2 px-4 rounded-full text-white font-semibold hover:bg-gradient-to-l transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const ErrorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  message: string;
}> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1ACC] border border-[#A6A9B880] rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-2 px-4 rounded-full text-white font-semibold hover:bg-gradient-to-l transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Faucet: React.FC = () => {
  const { tokenAddress, originalChain, tokenSymbol } = useBridge();
  const [address, setAddress] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState({
    amount: 0,
    chain: "",
    recipientAddress: "",
    txHash: "",
  });

  const { chainId } = useAccount();

  const { connect, connectors } = useConnect();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClaim = async () => {
    if (!chainId) return;

    setIsLoading(true);
    try {
      let chain: SupportedChain;
      let tokenAddress: string;
      let amount: number;

      if (chainId === 11155111) {
        chain = "eth-sepolia";
        tokenAddress = "0x84cba2A35398B42127B3148744DB3Cd30981fCDf";
      } else if (chainId === 84532) {
        chain = "base-sepolia";
        tokenAddress = "0x2816a02000B9845C464796b8c36B2D5D199525d5";
      } else {
        throw Error("Not supported chain");
      }

      const params = {
        tokenAddress,
        recipientAddress: address,
        chain,
      };

      const result = await bridgeWrapper.mintERC20TokensAndTransferETH(params);
      console.log("RESULT:", result);

      if (result && result.transactionHash) {
        amount = 1000; // Assuming 1000 tokens are minted each time
        setSuccessData({
          amount,
          chain,
          recipientAddress: address,
          txHash: result.transactionHash,
        });
        setShowSuccessModal(true);
      } else {
        throw Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error claiming tokens:", error);
      setErrorMessage(
        "You already minted 1000 USDT tokens. Please wait 24 hours before requesting more tokens."
      );
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const isWalletConnected = !!chainId;

  return (
    <div className="bg-[#000000] text-white w-full h-screen flex flex-col">
      {isMobile ? <MobileNavbar /> : <Navbar />}
      <div className="flex-1 flex">
        {isMobile ? (
          <MobileFaucetContent
            connectWallet={connectWallet}
            address={address}
            setAddress={setAddress}
            handleClaim={handleClaim}
            isWalletConnected={isWalletConnected}
            isLoading={isLoading}
            chainId={chainId}
          />
        ) : (
          <DesktopFaucetContent
            connectWallet={connectWallet}
            address={address}
            setAddress={setAddress}
            handleClaim={handleClaim}
            isWalletConnected={isWalletConnected}
            isLoading={isLoading}
            chainId={chainId}
          />
        )}
      </div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={successData.amount}
        tokenSymbol={tokenSymbol}
        chain={successData.chain}
        recipientAddress={successData.recipientAddress}
        txHash={successData.txHash}
      />
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
};

const MobileNavbar: React.FC = () => {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="cursor-pointer" onClick={() => router.push("/")}>
        <Image src="/back.svg" alt="back" width={13} height={22} />
      </div>
      <h1 className="text-xl text-[#A6A9B8] font-semibold">Faucet</h1>
      <div className="w-6"></div>
    </nav>
  );
};

const MobileFaucetContent: React.FC<ContentProps> = ({
  connectWallet,
  address,
  setAddress,
  handleClaim,
  isLoading,
  chainId,
  isWalletConnected,
}) => (
  <main className="flex-1 flex flex-col py-6 px-4 w-full">
    <div className="flex-1 flex flex-col rounded-3xl border border-[#3E4347] relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/wave.png"
          alt="wave background"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
        <div className="absolute w-[59px] h-[223px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial-glow from-[#6AEFFF33] to-[#6AEFFF] opacity-60 blur-3xl"></div>
      </div>
      <div className="flex-1 flex flex-col justify-between p-4 z-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          <h2 className="text-xl text-[#A6A9B8] font-semibold text-center">
            Get Test Tokens
          </h2>

          <div className="text-sm text-gray-400 text-center">
            Don&apos;t have Base-Sepolia ETH for transaction fees?<br />
            <a 
              href="https://faucets.chain.link/base-sepolia" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:underline"
            >
              Get some from this faucet
            </a>
          </div>

          <div className="w-full bg-[#1A1A1A80] border border-[#3E434773] rounded-lg p-4 flex flex-col gap-4 backdrop-blur-sm">
            <label className="text-gray-400 text-sm">Enter your address</label>

            <div className="flex w-full items-center gap-2 relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x85F...76cf"
                disabled={!isWalletConnected}
                className="w-full bg-transparent border-b border-gray-700 py-2 pr-16 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
              {isWalletConnected && (
                <button
                  className="absolute right-2 p-1 px-2 bg-[#1E1E1E] text-xs rounded text-gray-400 hover:bg-[#2A2A2A] transition-colors"
                  onClick={() =>
                    navigator.clipboard
                      .readText()
                      .then((text) => setAddress(text))
                  }
                >
                  paste
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* <button
            className={`w-full py-3 px-7 rounded-full font-semibold text-lg text-white transition-colors duration-200 flex items-center justify-center ${
              (!isWalletConnected || !address || isLoading)
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] hover:bg-gradient-to-l'
            }`}
            onClick={isWalletConnected ? handleClaim : connectWallet}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader />
                <span className="ml-2">Claiming...</span>
              </>
            ) : !isWalletConnected ? (
              'Connect Wallet'
            ) : !address ? (
              'Input Address'
            ) : (
              'Claim'
            )}
          </button> */}
          <button
            className="w-full bg-gray-500 cursor-not-allowed py-3 px-3 rounded-full font-semibold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200"
          >
           Coming Soon ..
          </button>
        </div>
      </div>
    </div>
  </main>
);

const DesktopFaucetContent: React.FC<ContentProps> = ({
  connectWallet,
  address,
  setAddress,
  handleClaim,
  isLoading,
  chainId,
  isWalletConnected,
}) => (
  <main className="flex-1 flex items-center justify-center relative w-full">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6AEFFF] opacity-30 blur-[100px] rounded-full"></div>

    <div className="w-full max-w-3xl space-y-5 text-center relative z-10">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2859A9] to-[#6AEFFF] text-transparent bg-clip-text">
        FAUCET
      </h1>
      <p className="text-xl text-gray-300">Get Test Tokens</p>

      <div className="text-sm text-gray-400 text-center">
            Don&apos;t have Base-Sepolia ETH for transaction fees?<br />
            <a 
              href="https://faucets.chain.link/base-sepolia" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:underline"
            >
              Get some from this faucet
            </a>
          </div>

      <div className="w-full mx-auto bg-[#1A1A1A80] border border-[#3E434773] rounded-lg p-6 flex flex-col gap-8 backdrop-blur-sm">
        <label className="text-[#FFFFFF] text-xl text-left">
          Enter your address
        </label>

        <div className="flex w-full items-center gap-4">
          <div className="flex w-full items-center gap-2">
            {isWalletConnected && (
              <button
                className="p-2 bg-[#1E1E1E] rounded hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
                onClick={() =>
                  navigator.clipboard
                    .readText()
                    .then((text) => setAddress(text))
                }
              >
                Paste
              </button>
            )}

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              className="w-full bg-transparent border-b border-gray-700 py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 relative z-10"
              disabled={!isWalletConnected}
            />
          </div>

          {/* <button
            className={`w-auto py-3 px-7 rounded-full font-bold text-xl text-white whitespace-nowrap transition-colors duration-200 flex items-center justify-center
              ${(!isWalletConnected || !address || isLoading)
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] hover:bg-gradient-to-l'
              }`}
              onClick={isWalletConnected ? handleClaim : connectWallet}
            disabled={isWalletConnected && isLoading}
          >
            {isLoading ? (
              <>
                <Loader />
                <span className="ml-2">Claiming...</span>
              </>
            ) : !isWalletConnected ? (
              'Connect Wallet'
            ) : !address ? (
              'Input Address'
            ) : (
              'Claim'
            )}
          </button> */}

<button
            className="w-full bg-gray-500 cursor-not-allowed py-3 px-3 rounded-full font-semibold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200"
          >
           Coming Soon ..
          </button>
        </div>
      </div>
    </div>
  </main>
);

export default Faucet;
