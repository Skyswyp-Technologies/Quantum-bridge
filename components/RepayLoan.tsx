"use client";

import React, { useEffect, useState } from "react";
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
import { useBridge } from "@/context/BridgeContext";
import Header from "./Header";
import Navbar from "./Navbar";
import { lendingPoolWrapper } from "@/helpers/helpers";

const RepayLoan: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const { fromToken, tokens, borrowBalance, setBorrowBalance, getTokenInfo } =
    useBridge();

  const [interest, setInterest] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  useEffect(() => {
    const tokenInfo = getTokenInfo(fromToken);
    if (!tokenInfo) {
      return;
    }

    const handleInterest = async () => {
      
      const result = await lendingPoolWrapper.interestAndRepayAMount(
        tokenInfo.address,
        borrowBalance,
        tokenInfo.originChain
      );

      if (result && walletClient) {
        setRepayAmount(result!.totalRepayAmount);
        setInterest(result!.interest);

        const initialBorrow = await lendingPoolWrapper.getUserBorrowedAmount(
          walletClient.account.address,
          tokenInfo.address,
          tokenInfo.originChain
        );

        if (initialBorrow) {
          setBorrowBalance(initialBorrow);
        }
      }
    };

    handleInterest();
  }, [fromToken, borrowBalance, getTokenInfo, setBorrowBalance]);

  const handleProceed = () => {
    if (!address || !walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    const tokenInfo = getTokenInfo(fromToken);
    if (!tokenInfo) {
      toast.error("Invalid token selected");
      return;
    }

    router.push("/lending/repay/transaction");
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
                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xs">Loan Balance</span>
                    <span className="text-[#A6A9B8] text-sm font-bold">
                      $ {borrowBalance}
                    </span>
                  </div>
                </div>

                <TokenSelector type="from" />

                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <span className="text-[#A6A9B8] text-xs font-bold">
                    You pay
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A6A9B8] font-bold">
                      {tokenSymbol} {repayAmount}
                    </span>

                    <span className="text-[#A6A9B8] text-xs">
                      $ {repayAmount}
                    </span>
                  </div>

                  <span className="text-[#A6A9B8] text-xs">
                    Transaction details
                  </span>

                  <div className="flex flex-row gap-4 items-center">
                    <div className="flex flex-row gap-2">
                      <span className="text-[#A6A9B8] text-xs">APY</span>
                      <span className="text-[#A6A9B8] text-xs">
                        {(apy * 100).toFixed(2)}%
                      </span>
                    </div>

                    <span className="text-[#A6A9B8] text-xs">
                      Interest: ${interest}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 mt-auto z-10">
            <button
              onClick={handleProceed}
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

              <div className="flex-grow py-6 px-4 flex flex-col space-y-4 z-10">
                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xs">Loan Balance</span>
                    <span className="text-[#A6A9B8] text-sm font-bold">
                      $ {borrowBalance}
                    </span>
                  </div>
                </div>

                <TokenSelector type="from" />

                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <span className="text-[#A6A9B8] text-xs font-bold">
                    You pay
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A6A9B8] font-bold">
                      {tokenSymbol} {repayAmount}
                    </span>

                    <span className="text-[#A6A9B8] text-xs">
                      $ {repayAmount}
                    </span>
                  </div>

                  <span className="text-[#A6A9B8] text-xs">
                    Transaction details
                  </span>

                  <div className="flex flex-row gap-4 items-center">
                    <div className="flex flex-row gap-2">
                      <span className="text-[#A6A9B8] text-xs">APY</span>
                      <span className="text-[#A6A9B8] text-xs">
                        {(apy * 100).toFixed(2)}%
                      </span>
                    </div>

                    <span className="text-[#A6A9B8] text-xs">
                      Interest: ${interest}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 mt-auto z-10">
                <button
                  onClick={handleProceed}
                  className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 rounded-full font-bold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200"
                >
                  Proceed
                </button>
              </div>
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

export default RepayLoan;
