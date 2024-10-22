"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBridge } from "@/context/BridgeContext";
import Header from "./Header";
import Navbar from "./Navbar";
import Link from "next/link";
import { lendingPoolWrapper } from "@/helpers/helpers";



const SupplyMarket: React.FC = () => {
  const router = useRouter();
  const { tokens, setFromToken, supplyMarket } = useBridge();
  const [filteredTokens] = useState(tokens);

  const [tokenSupplied, setTokensSupplied ] = useState<number[]>([]);
  const [tokenAddresses, setTokenAddresses ] = useState<string[]>([]);

  const handleAssetSelect = (tokenId: string) => {
    setFromToken(tokenId);
  };

  useEffect(()=> {
    const getTotalSupplyTokensAndMarkets = async()=>{

      const result = await lendingPoolWrapper.getTotalTokensAndAMountsSuppliedMarket(
        "base-sepolia"
      )

      console.log("result", result)

      if(result) {
        setTokensSupplied(result.amounts)
        setTokenAddresses(result.addresses)
      }

    }

    getTotalSupplyTokensAndMarkets()

  }, [setTokensSupplied, setTokenAddresses])


  const formattedSupplyMarket = useMemo(
    () => lendingPoolWrapper.formatBalance(supplyMarket),
    [supplyMarket]
  );

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
              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] py-2 px-2 mx-auto w-full flex flex-col flex-grow gap-1 justify-center">
                <div className="flex flex-col flex-grow gap-4 py-2 px-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xs">Supply Market</span>
                    <span className="text-white text-sm font-semibold">
                      $ {formattedSupplyMarket}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto z-10 p-1 flex-grow h-[calc(100vh-300px)]">
                    {filteredTokens.map((token) => (
                      <div
                        key={token.id}
                        className="rounded border border-[#3E434773] bg-[#1A1A1A80] p-2 cursor-pointer"
                        onClick={() => handleAssetSelect(token.id)}
                      >
                       <div className="flex flex-row items-center justify-between">
                          <div className="flex items-center gap-4">
                          <Image
                            src={token.icon}
                            alt={token.name}
                            width={24}
                            height={24}
                          />
                          <div className="flex flex-col gap-2">
                          <span className="text-white text-sm">{token.symbol}</span>
                          <span className="text-[#9A9A9A] text-xs">
                            {token.id}
                          </span>
                          </div>
                          </div>
                          <span className="text-white text-sm">$ {formattedSupplyMarket}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] py-2 px-4 w-full flex flex-col flex-grow gap-1 justify-center">
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xs">Supply</span>

                  <Link
                    href={"/lending/supply"}
                    className="rounded bg-[#1E1E1E] py-1 font-semibold px-5 text-white flex justify-center items-center text-xs cursor-pointer"
                  >
                    Go
                  </Link>
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
          <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] py-2 px-2 mx-auto w-full flex flex-col flex-grow gap-1 justify-center">
                <div className="flex flex-col flex-grow gap-4 py-2 px-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9A9A9A] text-xs">Supply Market</span>
                    <span className="text-white text-sm font-semibold">
                      $ {formattedSupplyMarket}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto z-10 p-1 flex-grow h-[calc(100vh-300px)]">
                    {filteredTokens.map((token) => (
                      <div
                        key={token.id}
                        className="rounded border border-[#3E434773] bg-[#1A1A1A80] p-2 cursor-pointer"
                        onClick={() => handleAssetSelect(token.id)}
                      >
                       <div className="flex flex-row items-center justify-between">
                          <div className="flex items-center gap-4">
                          <Image
                            src={token.icon}
                            alt={token.name}
                            width={24}
                            height={24}
                          />
                          <div className="flex flex-col gap-2">
                          <span className="text-white text-sm">{token.symbol}</span>
                          <span className="text-[#9A9A9A] text-xs">
                            {token.id}
                          </span>
                          </div>
                          </div>
                          <span className="text-white text-sm">$ {formattedSupplyMarket}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] py-2 px-4 w-full flex flex-col flex-grow gap-1 justify-center">
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xs">Supply</span>

                  <Link
                    href={"/lending/supply"}
                    className="rounded bg-[#1E1E1E] py-1 font-semibold px-5 text-white flex justify-center items-center text-xs cursor-pointer"
                  >
                    Go
                  </Link>
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

export default SupplyMarket;
