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
import Loader from "./Loader";
import Image from "next/image";
import MobConnect from "./ConnectWallet";
import { useBridge } from "@/context/BridgeContext";
import { bridgeWrapper } from "@/helpers/helpers";
import { useWalletClient } from "wagmi";

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
    nativeFee
  } = useBridge();

  //wagmi stuff

  const { data: walletClient } = useWalletClient({});

  const [transactionStep, setTransactionStep] = useState(0);
  const [transactionSuccessful, setTransactionSuccessful] = useState(false);
  const router = useRouter();

  // Simulating data that would typically be passed as props or through context

  useEffect(() => {
    const simulateTransaction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTransactionStep(1);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTransactionStep(2);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTransactionSuccessful(true);
    };

    simulateTransaction();
  }, []);

  const approveBridge = async () => {
    try {
      const tokenAddress = "0x84cba2A35398B42127B3148744DB3Cd30981fCDf";
      const amountToApprove = amount;

      if (walletClient) {
        const approveTx = await bridgeWrapper.approveBridge(
          tokenAddress,
          amountToApprove,
          walletClient
        );

        console.log("approveTx", approveTx)

        if (!approveTx.success) {
          console.log("unsuccesful transaction");
        } else {
          setTransactionSuccessful(true);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const bridgeERC20Asset = async()=> {
    try {
      const destID = "40231"
      const destChain = "ARB"
      const amoutToSend = amount
      const tokenAddress = "0x84cba2A35398B42127B3148744DB3Cd30981fCDf"
      const receiver = recipientAddress
      const signer = walletClient
      const fee = nativeFee

      const bridgeTx = await bridgeWrapper.depositERC20Assets(
        fee,
        destID,
        amoutToSend,
        tokenAddress,
        receiver,
        destChain,
        signer
      )

      if (!bridgeTx!.success) {
        console.log("unsuccesful transaction");
      } else {
        setTransactionSuccessful(true);
      }

    } catch (error) {
      throw error;
    }
  }

  const TransactionContent = () => (
    <div className="space-y-3">
      <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Approve Token</span>
          <span className="text-[#A6A9B8] text-xs">Approve in wallet</span>
        </div>
        {transactionStep === 0 && <Loader />}
        {transactionStep > 0 && <span className="text-green-500">✓</span>}
      </div>

      <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className="text-[#A6A9B8] text-xs">Transfer Token</span>
          <span className="text-[#A6A9B8] text-xs">
            Transferring token to wallet
          </span>
        </div>
        {transactionStep === 1 && <Loader />}
        {transactionStep > 1 && <span className="text-green-500">✓</span>}
      </div>

      {!transactionSuccessful && (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full h-[85px] flex flex-col gap-1 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">You get</span>
          <div className="flex justify-between items-center">
            <span className="text-[#9A9A9A] text-xl">
              {amount} {toNetwork}
            </span>
            <span className="text-[#A6A9B8] text-xs">
              $ {parseFloat(amount).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row gap-2 items-center">
              <Image src={Gas} alt="gas" width={12} height={12} />
              <span className="text-[#A6A9B8] text-xs">$1.5</span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src={Tools} alt="tools" width={12} height={12} />
              <span className="text-[#A6A9B8] text-xs">$1.5</span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src={Time} alt="time" width={12} height={12} />
              <span className="text-[#A6A9B8] text-xs">1 min</span>
            </div>
          </div>
        </div>
      )}

      {transactionSuccessful && (
        <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full h-[252px] flex flex-col gap-3 justify-center">
          <span className="text-[#A6A9B8] text-xs font-bold">
            Transaction Successful
          </span>
          <div className="flex flex-col">
            <span className="text-[#A6A9B8] text-xs font-bold">Route</span>
            <div className="flex justify-between">
              <div className="w-[42%] h-[81px] rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 flex flex-col gap-1">
                <span className="text-[#A6A9B8] text-xs">From</span>
                <div className="flex justify-between items-center">
                  <Image src={Usdt} alt="usdt" width={24} height={24} />
                  <div className="flex flex-col gap-1">
                    <span>Usdt</span>
                    <span className="font-bold">On {fromNetwork}</span>
                  </div>
                  <Image src={Arrow} alt="arrow" width={20} height={20} />
                </div>
              </div>
              <Image src={Exchange} alt="exchange" width={30} height={30} />
              <div className="w-[42%] h-[81px] rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 flex flex-col gap-1">
                <span className="text-[#A6A9B8] text-xs">To</span>
                <div className="flex justify-between items-center">
                  <Image src={Usdt} alt="usdt" width={24} height={24} />
                  <div className="flex flex-col gap-1">
                    <span>Usdt</span>
                    <span className="font-bold">On {toNetwork}</span>
                  </div>
                  <Image src={Arrow} alt="arrow" width={20} height={20} />
                </div>
              </div>
            </div>
            <span className="text-[#A6A9B8] text-xs font-bold mt-2">
              Amount received
            </span>
            <div className="flex justify-between items-center">
              <span className="text-[#9A9A9A] text-xl">
                {amount} {toNetwork}
              </span>
              <span className="text-[#A6A9B8] text-xs">
                $ {parseFloat(amount).toFixed(2)}
              </span>
            </div>
            <span className="text-[#A6A9B8] text-xs font-bold mt-2">
              Transaction cost
            </span>
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-row gap-2 items-center">
                <Image src={Gas} alt="gas" width={12} height={12} />
                <span className="text-[#A6A9B8] text-xs">$1.5</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Image src={Tools} alt="tools" width={12} height={12} />
                <span className="text-[#A6A9B8] text-xs">$1.5</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Image src={Time} alt="time" width={12} height={12} />
                <span className="text-[#A6A9B8] text-xs">1 min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const MobileDesign = () => (
    <div className="bg-[#000000] text-white md:hidden h-screen w-full flex flex-col">
      <MobileNav />
      <div className="mx-4 my-2 flex flex-col flex-grow rounded-3xl border border-[#3E4347] overflow-auto">
        <div className="p-4 flex-grow">
          <TransactionContent />
        </div>
        <div className="p-4 mt-auto">
          <button
            className={`w-full p-3 rounded-full border  font-bold text-xl ${
              transactionSuccessful
                ? "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white"
                : "bg-[#141618] border-[#A6A9B8] text-[#A6A9B8]"
            }`}
            disabled={!transactionSuccessful}
            onClick={bridgeERC20Asset}
          >
            {transactionSuccessful ? "Done" : "Transferring Assets ..."}
          </button>
        </div>
      </div>
    </div>
  );

  const DesktopDesign = () => (
    <div className="bg-[#000000] text-white h-screen w-full hidden md:flex flex-col">
      <div className="flex justify-between items-center w-full h-16 px-8 xl:px-20 mx-auto py-4 bg-[#000000] border-b border-b-[#3E4347]">
        <span className="text-lg text-[#A6A9B8]">Quantum Protocol</span>
        <MobConnect />
      </div>
      <div className="flex-grow flex">
        <div className="w-1/2 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-[#A6A9B8] z-10 relative text-center">
            {transactionSuccessful ? (
              <>Bridging Complete</>
            ) : (
              <>Bridging in Progress</>
            )}
          </h1>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <div className="w-[360px] h-[calc(100vh-75px)] bg-[#000000] rounded-3xl border border-[#3E4347] overflow-hidden flex flex-col">
            <div className="flex-grow py-6 px-4 flex flex-col space-y-4">
              <TransactionContent />
            </div>
            <div className="px-6 pb-3 mt-auto">
              <button
                className={`w-full p-3 rounded-full  font-bold text-xl ${
                  transactionSuccessful
                    ? "bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-white"
                    : "border-[#A6A9B8] bg-[#141618] text-[#A6A9B8]"
                }`}
                disabled={!transactionSuccessful}
                onClick= {bridgeERC20Asset}
              >
                {transactionSuccessful ? "Done" : "Transferring Assets ..."}
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
