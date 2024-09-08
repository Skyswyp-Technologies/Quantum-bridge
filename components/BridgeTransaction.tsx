"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileNav from "./Header";
import Exchange from "./../public/exchange.svg";
import Usdt from "./../public/usdt.svg";
import Gas from "./../public/gas.svg";
import Tools from "./../public/tools.svg";
import Time from "./../public/time.svg";
import Arrow from "./../public/arrow.svg";
import { toast } from 'react-toastify'
import Loader from "./Loader";
import Image from "next/image";
import MobConnect from "./ConnectWallet";
import { useBridge } from "@/context/BridgeContext";
import { bridgeWrapper } from "@/helpers/helpers";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import Link from "next/link";
import Navbar from "./Navbar";

const BridgeTransaction: React.FC = () => {
  const {
    fromNetwork,
    setFromNetwork,
    toNetwork,
    setToNetwork,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    amount,
    setAmount,
    recipientAddress,
    setRecipientAddress,
    isModalOpen,
    setIsModalOpen,
    modalType,
    setModalType,
    networks,
    tokens,
    setTokenBalance,
    tokenBal,
    setUserAddress,
    feeInUSD,
    nativeFee,
    getTokenInfo,
  } = useBridge();

  //wagmi stuff

  const { data: walletClient } = useWalletClient({});

  // New states for different processes
  const [approveState, setApproveState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [transferState, setTransferState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [transactionState, setTransactionState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const clearError = () => {
    setErrorMessage(null);
  };

  // Using array
const getTokenSymbol = (tokenId: string) => {
  const token = tokens.find((t) => t.id === tokenId);
  return token ? token.symbol : tokenId; // Fallback to tokenId if not found
};

  const approveBridge = async () => {
    clearError();

    try {
      setApproveState("loading");

      const info = getTokenInfo(fromToken);

      if (walletClient && info) {
        const approveTx = await bridgeWrapper.approveBridge(
          info.address,
          amount,
          walletClient
        );

        if (!approveTx.success) {
          setApproveState("error");
          toast.error("Approval failed");
        } else {
          setApproveState("success");
          setTransferState("idle"); // Ready for transfer
          toast.success("Approval successful");
        }
      }
    } catch (error) {
      setApproveState("error");
      toast.error("An error occurred during approval");    }
  };

  const bridgeERC20Asset = async () => {
    if (approveState !== "success") {
      setErrorMessage("Please complete the approval step first");
      return;
    }
  
    clearError();
  
    try {
      setTransferState("loading");
  
      const info = getTokenInfo(fromToken);
  
      if (walletClient && info) {
        const destID = info.destinationID;
        const destChain = "ARB";
        const amountToSend = ethers.utils.parseUnits(amount.toString());
        const tokenAddress = info.address;
        const receiver = recipientAddress;
        const signer = walletClient;
        const fee = nativeFee;
  
        const bridgeTx = await bridgeWrapper.depositERC20Assets(
          fee,
          destID,
          amountToSend,
          tokenAddress,
          receiver,
          destChain,
          signer
        );
  
        if (!bridgeTx!.success) {
          setTransferState("error");
          toast.error("Transfer failed");
        } else {
          setTransferState("success");
          setTransactionState("success"); // Add this line
          toast.success("Transfer successful");
        }
      }
    } catch (error) {
      setTransferState("error");
      toast.error("An error occurred during transfer");
    }
  };

  const handleButtonClick = () => {
    if (approveState === "idle" || approveState === "error") {
      approveBridge();
    } else if (approveState === "success" && transferState === "idle") {
      bridgeERC20Asset();
    } else if (transferState === "error") {
      bridgeERC20Asset();
    } else if (transactionState === "success") {
      router.push("/");
    }
  };

  const getButtonText = () => {
    if (approveState === "idle" || approveState === "error") return "Approve";
    if (approveState === "loading") return "Approving...";
    if (approveState === "success" && transferState === "idle") return "Transfer";
    if (transferState === "loading") return "Transferring...";
    if (transferState === "error") return "Retry Transfer";
    if (transactionState === "success") return "Done";
    return "Retry";
  };

  const isButtonDisabled = () => {
    return approveState === "loading" || transferState === "loading";
  };

  const TransactionContent = () => (
    <div className="space-y-3">
      <div
        className={`rounded border ${
          approveState === "error" ? "border-red-500" : "border-[#3E4347]"
        } bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Approve Token</span>
          <span className="text-[#A6A9B8] text-xs">Approve in wallet</span>
        </div>
        {approveState === "loading" && <Loader />}
        {approveState === "success" && (
          <span className="text-green-500">✓</span>
        )}
        {approveState === "error" && <span className="text-red-500">✗</span>}
      </div>

      <div
        className={`rounded border ${
          transferState === "error" ? "border-red-500" : "border-[#3E4347]"
        } bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Transfer Token</span>
          <span className="text-[#A6A9B8] text-xs">
            Transferring token to wallet
          </span>
        </div>
        {approveState === "success" && (
          <>
            {transferState === "loading" && <Loader />}
            {transferState === "success" && (
              <span className="text-green-500">✓</span>
            )}
            {transferState === "error" && (
              <span className="text-red-500">✗</span>
            )}
          </>
        )}
      </div>

      {transactionState !== "success" && (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full h-[85px] flex flex-col gap-1 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">You get</span>
          <div className="flex justify-between items-center">
            <span className="text-[#9A9A9A] text-xl">
              {amount} {tokens.find((t) => t.id === fromToken)?.symbol || ""}
            </span>
            <span className="text-[#A6A9B8] text-xs">
              $ {(Number(amount) || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row gap-2 items-center">
              <Image src={Gas} alt="gas" width={12} height={12} />
              <span className="text-[#A6A9B8] text-xs">${feeInUSD}</span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src={Tools} alt="tools" width={12} height={12} />
              <span className="text-[#A6A9B8] text-xs">${feeInUSD}</span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src={Time} alt="time" width={12} height={12} />
              <span className="text-[#A6A9B8] text-xs">1 min</span>
            </div>
          </div>
        </div>
      )}

      {transactionState === "success" && (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full h-[252px] flex flex-col gap-3 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">
            Transaction Successful
          </span>
          <div className="flex flex-col">
            <span className="text-[#A6A9B8] text-xs font-bold">Route</span>
            <div className="flex justify-between">
              {/* From network details */}
              <div className="w-[42%] h-[81px] rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 flex flex-col gap-1">
                <span className="text-[#A6A9B8] text-xs">From</span>
                <div className="flex justify-between items-center">
                  <Image src={Usdt} alt="usdt" width={24} height={24} />
                  <div className="flex flex-col gap-1">
                    <span>{getTokenSymbol(fromToken)}</span>
                    <span className="font-bold">On {fromNetwork}</span>
                  </div>
                </div>
              </div>
              <Image src={Exchange} alt="exchange" width={30} height={30} />
              {/* To network details */}
              <div className="w-[42%] h-[81px] rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 flex flex-col gap-1">
                <span className="text-[#A6A9B8] text-xs">To</span>
                <div className="flex justify-between items-center">
                  <Image src={Usdt} alt="usdt" width={24} height={24} />
                  <div className="flex flex-col gap-1">
                    <span>{getTokenSymbol(toToken)}</span>
                    <span className="font-bold">On {toNetwork}</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[#A6A9B8] text-xs font-bold mt-2">
              Amount received
            </span>
            <div className="flex justify-between items-center">
              <span className="text-[#9A9A9A] text-xl">
                {amount} {tokens.find((t) => t.id === fromToken)?.symbol || ""}
              </span>
              <span className="text-[#A6A9B8] text-xs">
                $ {(Number(amount) || 0).toFixed(2)}
              </span>
            </div>
            <span className="text-[#A6A9B8] text-xs font-bold mt-2">
              Transaction cost
            </span>
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-row gap-2 items-center">
                <Image src={Gas} alt="gas" width={12} height={12} />
                <span className="text-[#A6A9B8] text-xs">${feeInUSD}</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Image src={Tools} alt="tools" width={12} height={12} />
                <span className="text-[#A6A9B8] text-xs">${feeInUSD}</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Image src={Time} alt="time" width={12} height={12} />
                <span className="text-[#A6A9B8] text-xs">1 min</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMessage &&
        !(
          <div className="rounded border border-red-500 bg-gray-100 p-2 w-full">
            <span className="text-red-500 text-sm">{errorMessage}</span>
          </div>
        )}
    </div>
  );

  const MobileDesign = () => (
    <div className="bg-[#000000] text-white md:hidden h-screen w-full flex flex-col">
      <MobileNav />
      <div className="mx-4 my-2 flex flex-col flex-grow rounded-3xl border border-[#3E4347] overflow-y-auto max-h-[calc(100vh-20px)] sm:max-h-[calc(100vh-20px)] relative">
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

        <div className="p-4 flex-grow">
          <TransactionContent />
        </div>
        <div className="p-4 mt-auto z-10">
          <button
            className={`w-full p-3 rounded-full border font-bold text-xl ${
              isButtonDisabled()
                ? "bg-[#141618] border border-[#A6A9B8] text-[#A6A9B8] cursor-not-allowed"
                : transactionState === "success"
                ? "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white"
                : "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white"
            }`}
            disabled={isButtonDisabled()}
            onClick={handleButtonClick}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );

  const DesktopDesign = () => (
    <div className="bg-[#000000] text-white h-screen w-full hidden md:flex flex-col">
       <Navbar />
      <div className="flex-grow flex">
        <div className="w-full flex items-center justify-center">
          <div className="w-[360px] h-[calc(100vh-75px)] bg-[#000000] rounded-3xl border border-[#3E4347] overflow-hidden flex flex-col relative">
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

            <div className="flex-grow py-6 px-4 flex flex-col space-y-4 z-10">
              <TransactionContent />
            </div>
            <div className="px-6 pb-3 mt-auto z-10">
              <button
                className={`w-full p-3 rounded-full font-bold text-xl ${
                  isButtonDisabled()
                    ? "bg-[#141618] border border-[#A6A9B8] text-[#A6A9B8] cursor-not-allowed"
                    : transactionState === "success"
                    ? "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white"
                    : "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white"
                }`}
                disabled={isButtonDisabled()}
                onClick={handleButtonClick}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileDesign />
      <DesktopDesign />
    </>
  );
};

export default BridgeTransaction;
