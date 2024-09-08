"use client";

import Image from "next/image";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBridge } from "@/context/BridgeContext";

const SelectNetworkContent = () => {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);
  const { networks, fromNetwork, toNetwork, setFromNetwork, setToNetwork } = useBridge();

  useEffect(() => {
    setType(new URLSearchParams(window.location.search).get("type"));
  }, []);

  const handleNetworkSelect = (networkId: string) => {
    if (type === "from") {
      setFromNetwork(networkId);
    } else if (type === "to") {
      setToNetwork(networkId);
    }
    router.push("/");
  };

  if (type === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <span className="font-bold text-white text-center mb-7">Choose blockchain network</span>

      <div className="w-full flex flex-col flex-grow gap-4 overflow-y-auto">
        <span className="text-white">Chain</span>

        <div className="flex flex-wrap gap-3">
          {networks.map((network) => (
            <div
              key={network.id}
              className={`p-2 flex flex-col items-center gap-2 rounded border cursor-pointer
                ${(type === "from" ? fromNetwork : toNetwork) === network.id
                  ? "border-[#6AEFFF] bg-[#1A1A1A]"
                  : "border-[#3E4347]"
                }`}
              onClick={() => handleNetworkSelect(network.id)}
            >
              <Image
                src={`/${network.id.toLowerCase()}.svg`}
                alt={network.id}
                width={24}
                height={24}
              />
              <span
                className={`font-bold text-center ${
                  (type === "from" ? fromNetwork : toNetwork) === network.id
                    ? "text-white"
                    : "text-[#9A9A9A]"
                }`}
              >
                {network.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SelectNetwork = () => {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex flex-col bg-[#000000]">
      <nav className="bg-[#000000] text-white h-16 border-b border-b-[#3E4347] container mx-auto flex items-center px-4 relative">
        <div
          className="absolute left-4 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image src="/back.svg" alt="back" width={13} height={22} />
        </div>
        <span className="text-[#A6A9B8] font-bold text-xl flex-grow text-center">
          Bridge Assets
        </span>
      </nav>

      <div className="flex-grow flex justify-center">
        <div className="w-full lg:w-[360px] h-[80vh] mx-4 my-4 lg:my-8 px-5 py-3 flex flex-col rounded-3xl border border-[#3E4347] relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/wave.png"
              alt="wave background"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
            <div className="absolute w-[59px] h-[223px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial-glow from-[#6AEFFF33] to-[#6AEFFF] opacity-90 blur-3xl"></div>
          </div>
          <div className="relative z-10 flex-grow flex flex-col">
            <Suspense fallback={<div>Loading...</div>}>
              <SelectNetworkContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectNetwork;