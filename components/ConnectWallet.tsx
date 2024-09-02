import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useDisconnect } from "wagmi";
import Arrow from "./../public/arrow.svg";

const MobConnect: React.FC = () => {
    const { disconnect } = useDisconnect();

    // Create a proper event handler for the disconnect button
    const handleDisconnect = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        disconnect();
    };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="px-2 py-[6px] rounded-full font-semibold text-xs bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-[#ffffff]"
                    onClick={openConnectModal}
                    type="button"
                  >
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              if (chain?.unsupported) {
                return (
                  <button
                    className="px-2 py-[6px] rounded-full text-xs font-semibold bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-[#ffffff]"
                    onClick={openChainModal}
                    type="button"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex gap-3 items-center">
                  <button
                    className="full-width-header font-semibold lg:text-[#fff] text-black dark:text-white hover:text-[#ff4040] dark:lg:text-[#535763] lg:dark:hover:text-white"
                    onClick={openChainModal}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                    type="button"
                  >
                    {chain?.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 15,
                          height: 15,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            width={15}
                            height={15}
                          />
                        )}
                      </div>
                    )}
                    <Image
                      src={Arrow}
                      alt="arrow"
                      width={20}
                      height={20}
                      className="cursor-pointer"
                    />
                  </button>

                  <button
                      onClick={handleDisconnect}  // Use the new handler here
                      type="button"
                      className="px-2 py-[6px] rounded-full text-xs font-semibold bg-gradient-to-r from-[#6AEFFF] to-[#2859A9] text-[#ffffff]"
                    >
                      <span>Disconnect</span>
                    </button>

                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default MobConnect;