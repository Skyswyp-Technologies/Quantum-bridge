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
import { useAccount } from "wagmi";
import MobConnect from "./ConnectWallet";
import { useBridge } from "@/context/BridgeContext";
import Header from "./Header";
import Link from "next/link";
import Navbar from "./Navbar";

const BridgeHome: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputMobRef = useRef<HTMLInputElement | null>(null);

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

  const handleExchange = () => {
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleBridge = () => {
    if (!address) {
      toast.error(
        "Please connect your wallet to proceed with the bridge transaction."
      );
      return;
    }

    if (!fromToken || !toToken) {
      toast.error("Please select both source and destination tokens.");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    if (!fromNetwork || !toNetwork) {
      toast.error("Please select both source and destination networks.");
      return;
    }

    if (fromNetwork === toNetwork) {
      toast.error("Source and destination networks must be different.");
      return;
    }

    if (!recipientAddress.trim()) {
      toast.error("Please enter a recipient address.");
      return;
    }

    if (!isValidAddress(recipientAddress)) {
      toast.error("Invalid recipient address. Please enter a valid address.");
      return;
    }

    // If all checks pass, proceed with the bridge transaction
    router.push("/bridge-transaction");
  };

  // Helper function to validate Ethereum addresses (basic check)
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipientAddress(text);
      toast.success("Address pasted successfully");
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      toast.error("Failed to paste address. Please try again.");
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

  const handleMaxClick = () => {
    if (tokenBal) {
      const maxAmount = parseFloat(tokenBal);
      if (!isNaN(maxAmount)) {
        setAmount(maxAmount);
      }
    }
  };

  const getBridgeButtonStatus = () => {
    if (!fromToken) {
      return { disabled: true, text: "Select Source Asset" };
    }
    if (!toToken) {
      return { disabled: true, text: "Select Destination Asset" };
    }
    if (!amount || amount === 0) {
      return { disabled: true, text: "Enter Amount" };
    }
    return { disabled: false, text: "Bridge Assets" };
  };

  const buttonStatus = getBridgeButtonStatus();

  const buttonClass = buttonStatus.disabled
    ? "w-full border bg-[#141618] border-[#A6A9B8] py-3 rounded-full font-bold text-lg text-gray-400 text-[#A6A9B8] cursor-not-allowed"
    : "w-full bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] py-3 rounded-full font-bold text-lg text-white hover:bg-gradient-to-l transition-colors duration-200";

  const openModal = (type: "from" | "to") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const updateNetworkAndToken = (
    network: string,
    token: string,
    type: "from" | "to"
  ) => {
    if (type === "from") {
      setFromNetwork(network);
      setFromToken(token);
    } else {
      setToNetwork(network);
      setToToken(token);
    }
  };

  const getNetworkFromToken = (tokenId: string) => {
    const [, network] = tokenId.split("-");
    return network === "MAINNET" ? "ETH" : network;
  };

  const NetworkSelector = ({ type }: { type: "from" | "to" }) => {
    const router = useRouter();
    const { fromNetwork, toNetwork, networks } = useBridge();
    
    const currentNetwork = type === "from" ? fromNetwork : toNetwork;
    const network = networks.find((n) => n.id === currentNetwork);
  
    const handleNetworkSelect = () => {
      router.push(`/selectNetwork?type=${type}`);
    };
  
    return (
      <div className="w-[42%] rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 flex flex-col gap-1 relative">
       
       <div className="relative z-10">
        <span className="text-[#A6A9B8] text-xs">
          {type === "from" ? "From" : "To"}
        </span>
        <div className="flex justify-between items-center mt-1">
          {network ? (
            <Image src={network.icon} alt={network.name} width={24} height={24} />
          ) : (
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div> // Placeholder if no network is selected
          )}
          <span className="font-bold text-xs text-[#A6A9B8]">
            {network?.name || "Select Network"}
          </span>
          <Image
            src={Arrow}
            alt="arrow"
            width={20}
            height={20}
            onClick={handleNetworkSelect}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
    );
  };

  const TokenSelector = ({ type }: { type: "from" | "to" }) => {
    const router = useRouter();
    const currentToken = type === "from" ? fromToken : toToken;
    const token = tokens.find((t) => t.id === currentToken);
  
    const handleAssetSelect = () => {
      router.push(`/selectAsset?type=${type}`);
    };
  
    return (
      <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex justify-between items-center cursor-pointer" onClick={handleAssetSelect}>
        <span className="text-[#A6A9B8] text-xs">
          {token ? "Asset Selected" : "Choose Asset"}
        </span>
        <div className="flex flex-row gap-2 items-center">
          <Image src={token?.icon || Usdt} alt="token" width={20} height={20} />
          <span className="text-sm text-[#A6A9B8]">
            {token?.symbol || "Select Token"}
          </span>
          <Image
            src={Arrow}
            alt="Arrow"
            width={12}
            height={12}
          />
        </div>
      </div>
    );
  };

  const MobileDesign = () => {
    return (
      <div className="bg-[#000000] text-white md:hidden h-screen w-full flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col m-4 rounded-3xl border border-[#3E4347] overflow-hidden relative">
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
    
              <TokenSelector type="from" />
    
              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[#A6A9B8] text-xs">You Pay</span>
                  <span className="text-[#A6A9B8] text-xs">
                    $ {(amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="relative flex items-center bg-transparent rounded px-2 py-1">
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
                  <div
                    className="rounded bg-[#1E1E1E] p-1 text-white flex justify-center items-center text-xs cursor-pointer"
                    onClick={handleMaxClick}
                  >
                    max
                  </div>
                </div>
              </div>
              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-2 w-full flex flex-col justify-center">
                <div className="relative w-full">
                  <span className="text-[#A6A9B8] text-xs absolute top-0 left-0">
                    Recipient address <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full pt-4 pb-1 px-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[#A6A9B8] placeholder-[#A6A9B8]"
                    placeholder="Enter Address"
                    required
                  />
                  <button
                    className="absolute right-0 focus:border-none bottom-1 rounded bg-[#1E1E1E] px-2 py-1 text-white text-xs"
                    onClick={handlePaste}
                  >
                    paste
                  </button>
                </div>
              </div>
    
              <div className="rounded border border-[#A6A9B880] bg-[#1A1A1ACC] p-2 w-full flex flex-col gap-1 justify-center">
                <span className="text-[#A6A9B8] text-xs font-bold">
                  You get
                </span>
    
                <div className="flex justify-between items-center">
                  <span className="text-[#9A9A9A] text-xl">
                    {amount || "0"}{" "}
                    {tokens.find((t) => t.id === fromToken)?.symbol || ""}
                  </span>
                  <span className="text-[#A6A9B8] text-xs">
                    $ {(amount || 0).toFixed(2)}
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
        </div>
        <div className="p-4 mt-auto z-10">
          <button
            onClick={handleBridge}
            disabled={buttonStatus.disabled}
            className={buttonClass}
          >
            {buttonStatus.text}
          </button>
        </div>
      </div>
    </div>
    );
  };

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

              <TokenSelector type="from" />

              <div className="rounded border border-[#3E4347] bg-[#1A1A1A80] p-3 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[#A6A9B8] text-xs">You Pay</span>
                  <span className="text-[#A6A9B8] text-xs">
                    $ {(amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="relative flex items-center bg-transparent rounded px-2 py-1">
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
                    Recipient address <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full pt-4 pb-1 px-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[#A6A9B8] placeholder-[#A6A9B8]"
                    placeholder="Enter Address"
                    required
                  />
                  <button
                    className="absolute right-0 focus:border-none bottom-1 rounded bg-[#1E1E1E] px-2 py-1 text-white text-xs"
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
                    {amount || "0"}{" "}
                    {tokens.find((t) => t.id === fromToken)?.symbol || ""}
                  </span>
                  <span className="text-[#A6A9B8] text-xs">
                    $ {(amount || 0).toFixed(2)}
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
            <div className="px-6 pb-6 mt-auto z-10">
              <button
                onClick={handleBridge}
                disabled={buttonStatus.disabled}
                className={buttonClass}
              >
                {buttonStatus.text}
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

export default BridgeHome;
