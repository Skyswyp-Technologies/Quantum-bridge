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
import { useAccount } from "wagmi";
import MobConnect from "./ConnectWallet";
import { useBridge } from "@/context/BridgeContext";
import Header from "./Header";
import { bridgeWrapper } from "@/helpers/helpers";

const BridgeHome: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

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
    feeInUSD
  } = useBridge();

  const { address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    try {
      if (address) {
        setUserAddress(address);
      }
    } catch (error) {
      throw error;
    }
  }, [address, setUserAddress]);

  const handleExchange = () => {
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
  };

  const handleBridge = () => {
    if (!address) {
      setError(
        "Please connect your wallet to proceed with the bridge transaction."
      );
    } else {
      setError(null); // Clear any previous errors
      router.push("/bridge-transaction");
    }
  };


  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipientAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  const handleMaxClick = async () => {
    try {
      if (tokenBal) {
        setAmount(tokenBal.toString());
      }
    } catch (error) {
      throw error;
    }
  };

  const openModal = (type: "from" | "to") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const NetworkSelector = ({ type }: { type: "from" | "to" }) => (
    <div className="w-[42%] h-[81px] rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 flex flex-col gap-1">
      <span className="text-[#A6A9B8] text-xs">
        {type === "from" ? "From" : "To"}
      </span>
      <div className="flex justify-between items-center">
        <Image
          src={
            tokens.find((t) => t.id === (type === "from" ? fromToken : toToken))
              ?.icon || Usdt
          }
          alt="token"
          width={24}
          height={24}
        />
        <div className="flex flex-col gap-1">
          {/* <span>{type === "from" ? fromToken : toToken}</span> */}
          <span className="font-bold">
            On {type === "from" ? fromNetwork : toNetwork}
          </span>
        </div>
        <Image
          src={Arrow}
          alt="arrow"
          width={20}
          height={20}
          onClick={() => openModal(type)}
          className="cursor-pointer"
        />
      </div>
    </div>
  );

  const MobileDesign = () => (
    <div className="bg-[#000000] text-white md:hidden  h-screen w-full flex flex-col">
      <Header />
      <div className="mx-4 my-2 flex flex-col flex-grow rounded-3xl border border-[#3E4347] overflow-auto">
        <div className="p-4 flex-grow">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <NetworkSelector type="from" />
              <div
                className="cursor-pointer transform hover:scale-110 transition-transform duration-200"
                onClick={handleExchange}
              >
                <Image src={Exchange} alt="exchange" width={30} height={30} />
              </div>{" "}
              <NetworkSelector type="to" />
            </div>

            <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full h-[58px] flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-[#A6A9B8] text-xs">You Pay</span>
                <span className="text-[#A6A9B8] text-xs">
                  $ {parseFloat(amount || "0").toFixed(2)}
                </span>
              </div>

              <div className="flex flex-row gap-2 items-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#9A9A9A] text-xl text-right w-24"
                  placeholder="0"
                />
                <div
                  className="rounded bg-[#1E1E1E] p-1 text-white flex justify-center items-center text-xs cursor-pointer"
                  onClick={handleMaxClick}
                >
                  max
                </div>
              </div>
            </div>

            <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full h-[58px] flex flex-col justify-center">
              <div className="relative w-full">
                <span className="text-[#A6A9B8] text-xs absolute top-0 left-0">
                  Recipient address (optional)
                </span>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full pt-4 pb-1 px-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[#A6A9B8] placeholder-[#A6A9B8]"
                  placeholder="Enter Address"
                />
                <button
                  className="absolute right-0 focus:border-none bottom-1 rounded bg-[#1E1E1E] px-2 py-1 text-white text-xs"
                  onClick={handlePaste}
                >
                  paste
                </button>
              </div>
            </div>

            <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full h-[85px] flex flex-col gap-1 justify-center">
              <span className="text-[#A6A9B8] text-xs font-bold">You get</span>

              <div className="flex justify-between items-center">
                <span className="text-[#9A9A9A] text-xl">
                  {amount || "0"} {toNetwork}
                </span>
                <span className="text-[#A6A9B8] text-xs">
                  $ {parseFloat(amount || "0").toFixed(2)}
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
          </div>
        </div>
        <div className="p-4 mt-auto">
          <button
            onClick={handleBridge}
            className="w-full bg-[#141618] py-3 rounded-full border border-[#A6A9B8] font-bold text-xl text-[#A6A9B8]"
          >
            Bridge Assets
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
          <h1 className="text-4xl font-bold text-[#A6A9B8]">
            Bridge Assets Across Chains
          </h1>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <div className="w-[360px] h-[calc(100vh-75px)] bg-[#000000] rounded-3xl border border-[#3E4347] overflow-hidden flex flex-col">
            <div className="flex-grow py-6 px-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <NetworkSelector type="from" />
                <div
                  className="cursor-pointer transform hover:scale-110 transition-transform duration-200"
                  onClick={handleExchange}
                >
                  <Image src={Exchange} alt="exchange" width={30} height={30} />
                </div>
                <NetworkSelector type="to" />
              </div>

              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[#A6A9B8] text-sm">You Pay</span>
                  <span className="text-[#A6A9B8] text-sm">
                    $ {parseFloat(amount || "0").toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#9A9A9A] text-xl text-right w-24"
                    placeholder="0"
                  />
                  <button
                    className="rounded bg-[#1E1E1E] px-2 py-1 text-white text-xs"
                    onClick={handleMaxClick}
                  >
                    max
                  </button>
                </div>
              </div>

              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-3">
                <div className="relative w-full">
                  <span className="text-[#A6A9B8] text-sm absolute top-0 left-0">
                    Recipient address (optional)
                  </span>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full pt-6 pb-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[#A6A9B8] placeholder-[#A6A9B8] text-sm"
                    placeholder="Enter Address"
                  />
                  <button
                    className="absolute right-0 bottom-1 rounded bg-[#1E1E1E] px-2 py-1 text-white text-xs"
                    onClick={handlePaste}
                  >
                    paste
                  </button>
                </div>
              </div>

              <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-3 flex flex-col gap-2">
                <span className="text-[#A6A9B8] text-sm font-bold">
                  You get
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xl">
                    {amount || "0"} {toNetwork}
                  </span>
                  <span className="text-[#A6A9B8] text-sm">
                    $ {parseFloat(amount || "0").toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Image src={Gas} alt="gas" width={12} height={12} />
                    <span className="text-[#A6A9B8] text-xs">${feeInUSD}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Image src={Tools} alt="tools" width={12} height={12} />
                    <span className="text-[#A6A9B8] text-xs">${feeInUSD}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Image src={Time} alt="time" width={12} height={12} />
                    <span className="text-[#A6A9B8] text-xs">1 min</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 mt-auto">
              <button
                onClick={handleBridge}
                className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 rounded-full font-bold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200"
              >
                Bridge Assets
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

      {/* Modal (shared between mobile and desktop) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl p-8 transform transition-all duration-300 ease-out"
            style={{
              transform: isModalOpen ? "translateY(0)" : "translateY(100%)",
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[#A6A9B8]">
              Select {modalType === "from" ? "Source" : "Destination"} Network
              and Token
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-[#A6A9B8]">
                  Network
                </h3>
                <div className="space-y-2">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      className="w-full bg-[#2C3B52] text-[#A6A9B8] p-4 rounded-xl text-left text-lg flex items-center justify-between"
                      onClick={() => {
                        if (modalType === "from") {
                          setFromNetwork(network.id);
                        } else {
                          setToNetwork(network.id);
                        }
                      }}
                    >
                      <span>
                        {network.name} ({network.id})
                      </span>
                      {((modalType === "from" && fromNetwork === network.id) ||
                        (modalType === "to" && toNetwork === network.id)) && (
                        <span className="text-green-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-[#A6A9B8]">
                  Token
                </h3>
                <div className="space-y-2">
                  {tokens.map((token) => (
                    <button
                      key={token.id}
                      className="w-full bg-[#2C3B52] text-[#A6A9B8] p-4 rounded-xl text-left text-lg flex items-center justify-between"
                      onClick={() => {
                        if (modalType === "from") {
                          setFromToken(token.address);
                        } else {
                          setToToken(token.address);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <Image
                          src={token.icon}
                          alt={token.name}
                          width={24}
                          height={24}
                          className="mr-3"
                        />
                        <span>
                          {token.name} ({token.id})
                        </span>
                      </div>
                      {((modalType === "from" && fromToken === token.id) ||
                        (modalType === "to" && toToken === token.id)) && (
                        <span className="text-green-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              className="w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] mt-6 py-4 rounded-full hover:bg-gradient-to-l transition-colors duration-200 font-bold text-2xl text-white"
              onClick={closeModal}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BridgeHome;
