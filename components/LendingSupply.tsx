"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Exchange from "./../public/exchange.svg";
import Usdt from "./../public/usdt.svg";
import Gas from "./../public/gas.svg";
import Tools from "./../public/tools.svg";
import Time from "./../public/time.svg";
import Arrow from "./../public/arrow.svg";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAccount, useWalletClient } from "wagmi";
import MobConnect from "./ConnectWallet";
import { useBridge } from "@/context/BridgeContext";
import Header from "./Header";
import Link from "next/link";
import Navbar from "./Navbar";

const LendingSupply: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputMobRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const {
    fromToken,
    tokens,
    amount,
    setAmount,
    supply,
    getTokenInfo,
    getSuppliedBalance,
    updateCreditLimit,
  } = useBridge();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSupply = async () => {
    if (!address || !walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    const tokenInfo = getTokenInfo(fromToken);
    if (!tokenInfo) {
      toast.error("Invalid token selected");
      return;
    }

    setIsLoading(true);
    try {
      await supply(
        tokenInfo.address,
        amount.toString(),
        walletClient,
        tokenInfo.originChain
      );
      toast.success("Supply successful");
      await getSuppliedBalance(address, tokenInfo.originChain);
      await updateCreditLimit(address, tokenInfo.originChain);
      setIsSuccess(true);
    } catch (error) {
      console.error("Supply error:", error);
      toast.error("Supply failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!fromToken) {
      toast.error("Please select an asset before entering an amount.");
      return;
    }
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setAmount(numValue);
      } else {
        setAmount(0);
      }
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Move cursor to the end of the input
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [amount]);

  useEffect(() => {
    if (inputMobRef.current) {
      inputMobRef.current.focus();
      // Move cursor to the end of the input
      inputMobRef.current.setSelectionRange(
        inputMobRef.current.value.length,
        inputMobRef.current.value.length
      );
    }
  }, [amount]);

  const Receipt = () => {
    const selectedToken = tokens.find((t) => t.id === fromToken);
    const tokenSymbol = selectedToken?.symbol || "";

    return (
      <div className="rounded-lg bg-[#1A1A1A] p-4 w-full">
        <h2 className="text-white text-lg font-bold mb-4">Receipt</h2>
        <div className="space-y-2">
          <p className="text-green-500">Transaction Successful</p>
          <div>
            <p className="text-[#A6A9B8] text-sm">Route</p>
            <div className="flex justify-between items-center mt-2">
              <div className="bg-[#2D2D2D] rounded p-2">
                <p className="text-[#A6A9B8] text-xs">From</p>
                <div className="flex items-center space-x-2">
                  <Image src={Usdt} alt="From token" width={20} height={20} />
                  <p className="text-white">0xquantum</p>
                </div>
              </div>
              <Image src={Exchange} alt="Exchange" width={20} height={20} />
              <div className="bg-[#2D2D2D] rounded p-2">
                <p className="text-[#A6A9B8] text-xs">To</p>
                <div className="flex items-center space-x-2">
                  <Image src={Usdt} alt="To token" width={20} height={20} />
                  <p className="text-white">0x46...</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[#A6A9B8] text-sm">Amount received</p>
            <p className="text-white text-lg">
              {tokenSymbol} {amount}
            </p>
            <p className="text-[#A6A9B8] text-sm">$ {amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[#A6A9B8] text-sm">Transaction cost</p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-[#A6A9B8] text-xs">APY</span>
                <span className="text-white text-xs">5%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[#A6A9B8] text-xs">LTV:</span>
                <span className="text-white text-xs">0.95</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TokenSelector = ({ type }: { type: "from" | "to" }) => {
    const handleAssetSelect = () => {
      router.push(`/selectAsset?type=${type}`);
    };

    const token = tokens.find((t) => t.id === fromToken);

    return (
      <div
        className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex justify-between items-center cursor-pointer"
        onClick={handleAssetSelect}
      >
        <span className="text-[#A6A9B8] text-xs">
          {token ? "Asset Selected" : "Choose Asset"}
        </span>
        <div className="flex flex-row gap-2 items-center">
          <Image src={token?.icon || Usdt} alt="token" width={20} height={20} />
          <span className="text-sm text-[#A6A9B8]">
            {token?.symbol || "Select Token"}
          </span>
          <Image src={Arrow} alt="Arrow" width={12} height={12} />
        </div>
      </div>
    );
  };

  const MobileDesign = () => {
    const selectedToken = tokens.find((t) => t.id === fromToken);
    const tokenSymbol = selectedToken?.symbol || "";
    const apy = 0.05; // Assuming 5% APY, you might want to fetch this from the context if available

    // Calculate rewards based on the amount and APY
    const calculatedRewards = amount * apy;

    // Assume that 'amount' represents the USD value of the token
    const rewardsInUSD = calculatedRewards;

    return (
      <div className="bg-[#000000] text-white md:hidden h-screen w-full flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col m-4 h-[calc(100vh-64px)] rounded-3xl border border-[#3E4347] relative">
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

          <div className="flex flex-col flex-grow overflow-y-auto z-10">
            <div className="p-4 flex-grow">
              <div className="flex flex-col space-y-3">
                <TokenSelector type="from" />

                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#A6A9B8] text-sm">You Pay</span>

                      <span className="text-[#A6A9B8] text-sm font-bold">
                        $ {(amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[#9A9A9A] text-sm mr-1">
                      {tokens.find((t) => t.id === fromToken)?.symbol || ""}
                    </span>
                    <input
                      type="text"
                      ref={inputMobRef}
                      value={amount === 0 ? "" : amount.toString()}
                      onChange={handleAmountChange}
                      className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#9A9A9A] text-xl text-right w-24"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full flex flex-col gap-1 justify-center">
                  <span className="text-[#A6A9B8] text-xs font-bold">
                    Calculated Rewards
                  </span>

                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xl">
                      {calculatedRewards.toFixed(4)} {tokenSymbol}
                    </span>
                    <span className="text-[#A6A9B8] text-xs">
                      $ {rewardsInUSD.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-row items-center gap-4">
                    <div className="flex flex-row gap-2 items-center">
                      <span className="text-[#A6A9B8] text-xs">APY</span>
                      <span className="text-[#A6A9B8] text-xs">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 mt-auto z-10">
            <button
              onClick={handleSupply}
              className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 rounded-full font-bold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DesktopDesign = () => {
    const selectedToken = tokens.find((t) => t.id === fromToken);
    const tokenSymbol = selectedToken?.symbol || "";
    const apy = 0.05; // Assuming 5% APY, you might want to fetch this from the context if available

    // Calculate rewards based on the amount and APY
    const calculatedRewards = amount * apy;

    // Assume that 'amount' represents the USD value of the token
    const rewardsInUSD = calculatedRewards;

    return (
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

              {!isSuccess ? (
                <>
                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <div className="space-y-2">
                    <p className="text-green-500">Transaction Successful</p>
                    <div>
                      <p className="text-[#A6A9B8] text-sm">Route</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="bg-[#2D2D2D] rounded p-2">
                          <p className="text-[#A6A9B8] text-xs">From</p>
                          <div className="flex items-center space-x-2">
                            <Image
                              src={Usdt}
                              alt="From token"
                              width={20}
                              height={20}
                            />
                            <p className="text-white">0xquantum</p>
                          </div>
                        </div>
                        <Image
                          src={Exchange}
                          alt="Exchange"
                          width={20}
                          height={20}
                        />
                        <div className="bg-[#2D2D2D] rounded p-2">
                          <p className="text-[#A6A9B8] text-xs">To</p>
                          <div className="flex items-center space-x-2">
                            <Image
                              src={Usdt}
                              alt="To token"
                              width={20}
                              height={20}
                            />
                            <p className="text-white">0x46...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[#A6A9B8] text-sm">Amount received</p>
                      <p className="text-white text-lg">
                        {tokenSymbol} {amount}
                      </p>
                      <p className="text-[#A6A9B8] text-sm">
                        $ {amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#A6A9B8] text-sm">Transaction cost</p>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-[#A6A9B8] text-xs">APY</span>
                          <span className="text-white text-xs">5%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-[#A6A9B8] text-xs">LTV:</span>
                          <span className="text-white text-xs">0.95</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                 <Link
                 href="/lending"
                 className="px-6 pb-6 mt-auto z-10"
               >
                 <button className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 rounded-full font-bold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200">
                   Proceed
                 </button>
               </Link>
               </>
              ) : (
                <>
                  <div className="flex-grow py-6 px-4 flex flex-col space-y-4 z-10">
                    <TokenSelector type="from" />

                    <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                          <span className="text-[#A6A9B8] text-sm">
                            You Pay
                          </span>

                          <span className="text-[#A6A9B8] text-sm font-bold">
                            $ {(amount || 0).toFixed(2)}
                          </span>
                        </div>

                        <span className="text-[#9A9A9A] text-sm mr-1">
                          {tokens.find((t) => t.id === fromToken)?.symbol || ""}
                        </span>
                        <input
                          type="text"
                          ref={inputRef}
                          value={amount === 0 ? "" : amount.toString()}
                          onChange={handleAmountChange}
                          className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#9A9A9A] text-xl text-right w-24"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full flex flex-col gap-1 justify-center">
                      <span className="text-[#A6A9B8] text-xs font-bold">
                        Calculated Rewards
                      </span>

                      <div className="flex justify-between items-center">
                        <span className="text-[#9A9A9A] text-xl">
                          {calculatedRewards.toFixed(4)} {tokenSymbol}
                        </span>
                        <span className="text-[#A6A9B8] text-xs">
                          $ {rewardsInUSD.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex flex-row items-center gap-4">
                        <div className="flex flex-row gap-2 items-center">
                          <span className="text-[#A6A9B8] text-xs">APY</span>
                          <span className="text-[#A6A9B8] text-xs">5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={handleSupply}
                    className="px-6 pb-6 mt-auto z-10"
                  >
                    <button className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 rounded-full font-bold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200">
                      Proceed
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <MobileDesign />

      <DesktopDesign />
    </>
  );
};

export default LendingSupply;
