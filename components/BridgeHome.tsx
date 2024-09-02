"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Exchange from "./../public/exchange.svg";
import Usdt from "./../public/usdt.svg";
import Gas from "./../public/gas.svg";
import Tools from "./../public/tools.svg";
import Time from "./../public/time.svg";
import Arrow from "./../public/arrow.svg";
import Image from "next/image";
import MobConnect from "./ConnectWallet";
import { useBridge } from "@/context/BridgeContext";
import Header from "./Header";

const BridgeHome: React.FC = () => {
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
  } = useBridge();

  const router = useRouter();



  const handleExchange = () => {
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
  };

  const handleBridge = () => {
    router.push("/bridge-transaction");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipientAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
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
          src={tokens.find(t => t.id === (type === "from" ? fromToken : toToken))?.icon || Usdt}
          alt="token"
          width={24}
          height={24}
        />
        <div className="flex flex-col gap-1">
          <span>{type === "from" ? fromToken : toToken}</span>
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
                  onClick={() => setAmount("10")}
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
    <div className="bg-[#000000] text-white h-screen hidden  w-full md:flex flex-col">
      <div className="flex justify-between items-center w-full h-[60px] px-8 py-2 bg-[#1A1A1A]">
        <span className="text-base">Quantum Protocol</span>
        <MobConnect />
      </div>
      <div className="flex-grow flex justify-center items-center">
        <div className="w-[428px] h-[550px] mx-auto">
          <div className="bg-[#1A1A1A] rounded-3xl border border-[#3E4347] overflow-hidden">
            <div className="p-10">
              <h2 className="text-4xl font-bold mb-8">Bridge Assets</h2>
              <div className="space-y-8">
                <div className="flex justify-between items-center space-x-6">
                  <NetworkSelector type="from" />
                  <div
                    className="cursor-pointer transform hover:scale-110 transition-transform duration-200"
                    onClick={handleExchange}
                  >
                    <Image
                      src={Exchange}
                      alt="exchange"
                      width={30}
                      height={30}
                    />
                  </div>{" "}
                  <NetworkSelector type="to" />
                </div>

                <div className="rounded-xl border border-[#3E4347] bg-[#1A1A1A80] p-6 w-full flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[#A6A9B8] text-lg">You Pay</span>
                    <span className="text-[#A6A9B8] text-lg">
                      $ {parseFloat(amount || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#9A9A9A] text-2xl text-right w-40"
                      placeholder="0"
                    />
                    <button
                      className="bg-[#1E1E1E] px-4 py-2 rounded-lg text-white text-base"
                      onClick={() => setAmount("10")}
                    >
                      max
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#3E4347] bg-[#1A1A1A80] p-6 w-full">
                  <div className="relative w-full">
                    <span className="text-[#A6A9B8] text-base absolute top-0 left-0">
                      Recipient address (optional)
                    </span>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full pt-8 pb-2 bg-transparent border-none focus:outline-none focus:ring-0 text-[#A6A9B8] placeholder-[#A6A9B8] text-lg"
                      placeholder="Enter Address"
                    />
                    <button
                      className="absolute right-0 bottom-2 bg-[#1E1E1E] px-4 py-2 rounded-lg text-white text-base"
                      onClick={handlePaste}
                    >
                      paste
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#A6A9B880] bg-[#1A1A1ACC] p-6 w-full">
                  <span className="text-[#A6A9B8] text-lg font-bold">
                    You get
                  </span>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[#9A9A9A] text-2xl">
                      {amount || "0"} {toNetwork}
                    </span>
                    <span className="text-[#A6A9B8] text-lg">
                      $ {parseFloat(amount || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <Image src={Gas} alt="gas" width={16} height={16} />
                      <span className="text-[#A6A9B8] text-base">$1.5</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image src={Tools} alt="tools" width={16} height={16} />
                      <span className="text-[#A6A9B8] text-base">$1.5</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image src={Time} alt="time" width={16} height={16} />
                      <span className="text-[#A6A9B8] text-base">1 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-[#141618]">
              <button
                onClick={handleBridge}
                className="w-full bg-[#3B82F6] py-4 rounded-full font-bold text-2xl text-white"
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
              Select {modalType === "from" ? "Source" : "Destination"} Network and Token
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-[#A6A9B8]">Network</h3>
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
                      <span>{network.name} ({network.id})</span>
                      {((modalType === "from" && fromNetwork === network.id) ||
                        (modalType === "to" && toNetwork === network.id)) && (
                        <span className="text-green-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-[#A6A9B8]">Token</h3>
                <div className="space-y-2">
                  {tokens.map((token) => (
                    <button
                      key={token.id}
                      className="w-full bg-[#2C3B52] text-[#A6A9B8] p-4 rounded-xl text-left text-lg flex items-center justify-between"
                      onClick={() => {
                        if (modalType === "from") {
                          setFromToken(token.id);
                        } else {
                          setToToken(token.id);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <Image src={token.icon} alt={token.name} width={24} height={24} className="mr-3" />
                        <span>{token.name} ({token.id})</span>
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
              className="w-full bg-[#3B82F6] mt-6 py-4 rounded-full font-bold text-2xl text-white"
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
