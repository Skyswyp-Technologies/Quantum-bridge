import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import Usdt from "./../public/usdt.svg";
import { bridgeWrapper } from "@/helpers/helpers";

interface Token {
  id: string;
  name: string;
  icon: any; // You might want to use a more specific type for the icon
  address: string;
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
  setTokenBalance: (tokenBal: string) => void;
  tokenBal: string;
  setUserAddress: (address: string) => void;
  setPayload: (payload: string) => void;
  payload: string;
  setOptions: (options: string) => void;
  options: string;
  setNativeFee: (nativeFee: string) => void;
  nativeFee: string;
  setFeeInUSD: (feeInUSD: string) => void;
  feeInUSD: string;
  userAddress: string;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  modalType: "from" | "to";
  setModalType: (type: "from" | "to") => void;
  networks: Network[];
  tokens: Token[];
}

const BridgeContext = createContext<BridgeContextType | undefined>(undefined);

export const BridgeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [fromNetwork, setFromNetwork] = useState("ETH");
  const [toNetwork, setToNetwork] = useState("ARB");
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"from" | "to">("from");
  const [tokenBal, setTokenBalance] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [payload, setPayload] = useState("");
  const [options, setOptions] = useState("");
  const [nativeFee, setNativeFee] = useState("");
  const [feeInUSD, setFeeInUSD] = useState("");

  const networks: Network[] = [
    { id: "ETH", name: "Ethereum" },
    { id: "ARB", name: "Arbitrum" },
    // Add more networks as needed
  ];

  const tokens: Token[] = [
    {
      id: "USDT-ETH",
      name: "Tether",
      icon: Usdt,
      address: "0x84cba2A35398B42127B3148744DB3Cd30981fCDf",
      // symbol: "USD-ETH",
      // destinationID "40231"
    },
    {
      id: "ETH-MAINNET",
      name: "Ethereum",
      icon: Usdt,
      address: "0x0000000000000000000000000000000000000000",
    }, // Replace with actual ETH icon
    // Add more tokens as needed

    {
      id: "USDT-ARB",
      name: "Tether",
      icon: Usdt,
      address: "0x43535C041AF9d270Bd7aaA9ce5313d960BBEABAD",
    },
    {
      id: "ETH-ARB",
      name: "Arbitrum",
      icon: Usdt,
      address: "0x0000000000000000000000000000000000000000",
    },
  ];

  const handleUserTokenBalance = async () => {
    try {
      if (userAddress) {
        const walletAddress = userAddress;
        const tokenAddress = "0x84cba2A35398B42127B3148744DB3Cd30981fCDf";

        console.log("userAddress", userAddress);
        console.log("tokenAddress", tokenAddress);

        const bal = await bridgeWrapper.getUSDTBalance(
          walletAddress,
          tokenAddress
        );

        setTokenBalance(bal);
        return bal;
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  };

  const handleprepareBridgeUserInfo = async () => {
    try {
      const simulationAmount = amount;
      const tokenAddress = "0x84cba2A35398B42127B3148744DB3Cd30981fCDf";
      const receiverAddress = recipientAddress;
      const destID = "40231";

      if(receiverAddress) {

        const simInfo = await bridgeWrapper.prepareBridgeInfo(
          simulationAmount,
          tokenAddress,
          receiverAddress,
          destID
        );
  
        if (simInfo) {
          setPayload(simInfo.payload);
          setOptions(simInfo.options);
          setNativeFee(simInfo.nativeFee.toString());
          setFeeInUSD(simInfo.feeInUSD.toString());
        }
      }

      
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    handleUserTokenBalance();
    handleprepareBridgeUserInfo();
  }, [
    recipientAddress,
    userAddress,
    setTokenBalance,
    setPayload,
    setOptions,
    setNativeFee,
    setFeeInUSD,
  ]);

  return (
    <BridgeContext.Provider
      value={{
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
        userAddress,
        payload,
        setPayload,
        options,
        setOptions,
        nativeFee,
        setNativeFee,
        feeInUSD,
        setFeeInUSD,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export const useBridge = () => {
  const context = useContext(BridgeContext);
  if (context === undefined) {
    throw new Error("useBridge must be used within a BridgeProvider");
  }
  return context;
};
