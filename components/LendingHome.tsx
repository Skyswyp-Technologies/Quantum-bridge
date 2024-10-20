"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./Header";
import { useAccount } from "wagmi";
import Navbar from "./Navbar";
import { useBridge } from "@/context/BridgeContext";
import debounce from 'lodash/debounce';


const LendingHome: React.FC = () => {
  const { address } = useAccount();
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const {
    getSuppliedBalance,
    getBorrowedBalance,
    updateCreditLimit,
    updateMarketTotals,
    setUserAddress,
    userAddress,
    supplyBalance,
    borrowBalance,
    creditLimit,
    supplyMarket,
    loanMarket,
  } = useBridge();

  const fetchUserData = useCallback(async (userAddress: string) => {
    const now = Date.now();
    if (now - lastFetchTime < 60000) { // 1 minute cooldown
      console.log("Skipping fetch, too soon since last fetch");
      return;
    }

    try {
      await Promise.all([
        getSuppliedBalance(userAddress, "base-sepolia"),
        getBorrowedBalance(userAddress, "base-sepolia"),
        updateCreditLimit(userAddress, "base-sepolia"),
        updateMarketTotals(
          "0x2816a02000B9845C464796b8c36B2D5D199525d5",
          "base-sepolia"
        ),
      ]);
      setLastFetchTime(now);
    } catch (error) {
      console.log("unable to fetch user Data on Token Lending:", error);
    }
  }, [getSuppliedBalance, getBorrowedBalance, updateCreditLimit, updateMarketTotals, lastFetchTime]);

  const debouncedFetchUserData = useMemo(
    () => debounce(fetchUserData, 1000), // Increased debounce time to 1 second
    [fetchUserData]
  );

  useEffect(() => {
    if (address) {
      setUserAddress(address);
      debouncedFetchUserData(address);
    }

    return () => {
      debouncedFetchUserData.cancel();
    };
  }, [address, setUserAddress, debouncedFetchUserData]);

  const formatBalance = (balance: string | number) => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formattedSupplyBalance = useMemo(() => formatBalance(supplyBalance), [supplyBalance]);
  const formattedBorrowBalance = useMemo(() => formatBalance(borrowBalance), [borrowBalance]);
  const formattedCreditLimit = useMemo(() => formatBalance(creditLimit), [creditLimit]);
  const formattedSupplyMarket = useMemo(() => formatBalance(supplyMarket), [supplyMarket]);
  const formattedLoanMarket = useMemo(() => {
    const num = parseFloat(loanMarket);
    return num < 0.01 ? '10.00' : formatBalance(num);
  }, [loanMarket]);



  console.log("loan market", loanMarket.toString())


  const MobileDesign = () => {
    return (
      <div className="bg-[#000000] text-white md:hidden min-h-screen w-full flex flex-col overflow-y-auto">
        <Header />
        <div className="flex-grow flex flex-col m-4 rounded-3xl border border-[#3E4347] relative overflow-y-auto">
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

          <div className="flex flex-col flex-grow overflow-y-auto z-10 p-4">
            <div className="flex flex-col space-y-3">
              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                <span className="text-[#A6A9B8] text-xs font-bold">
                  Your Balance
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-sm font-bold">
                    Supply
                  </span>
                  <span className="text-[#A6A9B8] text-sm font-bold">
                    $ {formattedSupplyBalance}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-sm font-bold">Loan</span>
                  <span className="text-[#A6A9B8] text-sm font-bold">
                    $ {formattedBorrowBalance}
                  </span>
                </div>
              </div>

              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xs">
                    Your Credit Limit
                  </span>
                  <span className="text-[#A6A9B8] text-sm font-bold">
                    $ {formattedCreditLimit}
                  </span>
                </div>
              </div>

              {/* Other sections for Supply, Borrow, Withdraw, etc. */}
              {["Supply", "Borrow", "Withdraw", "Repay"].map((item) => (
                <div
                  key={item}
                  className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xs">{item}</span>
                    <Link
                      href={`/lending/${item.toLowerCase()}`}
                      className="rounded bg-[#1E1E1E] py-1 font-semibold px-5 text-white flex justify-center items-center text-xs cursor-pointer"
                    >
                      Go
                    </Link>
                  </div>
                </div>
              ))}

              <div className="rounded border border-[#A6A9B880] bg-[#1A1A1A80] p-3 w-full flex flex-col gap-2 justify-center">
                <span className="text-[#A6A9B8] text-xs font-bold">
                  Markets
                </span>
                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xs">
                      Supply Market
                    </span>
                    <div className="rounded bg-[#1E1E1E] p-1 font-semibold text-white flex justify-center items-center text-xs cursor-pointer">
                      $ {formattedSupplyMarket}
                    </div>
                  </div>
                </div>
                <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xs">Loan Market</span>
                    <div className="rounded bg-[#1E1E1E] p-1 font-semibold text-white flex justify-center items-center text-xs cursor-pointer">
                      $ {formattedLoanMarket}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    );
  };

  const DesktopDesign = () => (
    <div className="bg-[#000000] text-white h-screen w-full hidden md:flex flex-col overflow-y-auto">
      <Navbar />
      <div className="flex-grow flex items-center justify-center overflow-y-auto">
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

          <div className="flex-grow py-6 px-4 flex flex-col space-y-4 z-10 overflow-y-auto">
            {/* Balance Section */}
            <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
              <span className="text-[#A6A9B8] text-xs font-bold">
                Your Balance
              </span>
              <div className="flex justify-between items-center">
                <span className="text-[#9A9A9A] text-sm font-bold">Supply</span>
                <span className="text-[#A6A9B8] text-sm font-bold">
                  $ {formattedSupplyBalance}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9A9A9A] text-sm font-bold">Loan</span>
                <span className="text-[#A6A9B8] text-sm font-bold">
                  $ {formattedBorrowBalance}
                </span>
              </div>
            </div>

            <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xs">
                    Your Credit Limit
                  </span>
                  <span className="text-[#A6A9B8] text-sm font-bold">
                    $ {formattedCreditLimit}
                  </span>
                </div>
              </div>

            {/* Other Sections */}
            {["Supply", "Borrow", "Withdraw", "Repay"].map((item) => (
              <div
                key={item}
                className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xs">{item}</span>
                  <Link
                    href={`/lending/${item.toLowerCase()}`}
                    className="rounded bg-[#1E1E1E] py-1 font-semibold px-5 text-white flex justify-center items-center text-xs cursor-pointer"
                  >
                    Go
                  </Link>
                </div>
              </div>
            ))}

            {/* Markets */}
            <div className="rounded border border-[#A6A9B880] bg-[#1A1A1A80] p-3 w-full flex flex-col gap-2 justify-center">
              <span className="text-[#A6A9B8] text-xs font-bold">Markets</span>
              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xs">Supply Market</span>
                  <div className="rounded bg-[#1E1E1E] p-1 font-semibold text-white flex justify-center items-center text-xs cursor-pointer">
                    $ {formattedSupplyMarket}
                  </div>
                </div>
              </div>
              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col gap-1 justify-center">
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xs">Loan Market</span>
                  <div className="rounded bg-[#1E1E1E] p-1 font-semibold text-white flex justify-center items-center text-xs cursor-pointer">
                    $ {formattedLoanMarket}
                  </div>
                </div>
              </div>
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

export default LendingHome;