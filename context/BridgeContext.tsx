import React, { createContext, useState, useContext, ReactNode } from 'react';
import Usdt from "./../public/usdt.svg";

interface Token {
  id: string;
  name: string;
  icon: any; // You might want to use a more specific type for the icon
}

interface Network {
  id: string;
  name: string;
}

interface BridgeContextType {
  fromNetwork: string;
  setFromNetwork: (network: string) => void;
  toNetwork: string;
  setToNetwork: (network: string) => void;
  fromToken: string;
  setFromToken: (token: string) => void;
  toToken: string;
  setToToken: (token: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  modalType: "from" | "to";
  setModalType: (type: "from" | "to") => void;
  networks: Network[];
  tokens: Token[];
}

const BridgeContext = createContext<BridgeContextType | undefined>(undefined);

export const BridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fromNetwork, setFromNetwork] = useState("ETH");
  const [toNetwork, setToNetwork] = useState("ARB");
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"from" | "to">("from");

  const networks: Network[] = [
    { id: "ETH", name: "Ethereum" },
    { id: "ARB", name: "Arbitrum" },
    // Add more networks as needed
  ];

  const tokens: Token[] = [
    { id: "USDT", name: "Tether", icon: Usdt },
    { id: "ETH", name: "Ethereum", icon: Usdt }, // Replace with actual ETH icon
    // Add more tokens as needed
  ];

  return (
    <BridgeContext.Provider value={{
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
    }}>
      {children}
    </BridgeContext.Provider>
  );
};

export const useBridge = () => {
  const context = useContext(BridgeContext);
  if (context === undefined) {
    throw new Error('useBridge must be used within a BridgeProvider');
  }
  return context;
};