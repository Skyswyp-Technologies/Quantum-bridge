import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import Usdt from "./../public/usdt.svg";
import Eth from "./../public/eth.svg";  // Add this import
import Arb from "./../public/arb.svg"; 
import { bridgeWrapper } from "@/helpers/helpers";

interface Token {
  id: string;
  name: string;
  icon: any; // You might want to use a more specific type for the icon
  address: string;
  symbol: string;
  destinationID: string;
}

interface Network {
  id: string;
  name: string;
  icon: any;
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
  amount: number;
  setAmount: (amount: number) => void;
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
  getTokenInfo: (
    tokenId: string
  ) => { address: string; symbol: string; destinationID: string } | null;
}

const BridgeContext = createContext<BridgeContextType | undefined>(undefined);

export const BridgeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [fromNetwork, setFromNetwork] = useState("ETH");
  const [toNetwork, setToNetwork] = useState("ARB");
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState<number>(0);
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
    { id: "ETH", icon: Eth, name: "Ethereum" },
    { id: "ARB", icon: Arb, name: "Arbitrum" },
  ];

  const tokens: Token[] = [
    {
      id: "USDT-ETH",
      name: "Tether",
      icon: Usdt,
      address: "0x84cba2A35398B42127B3148744DB3Cd30981fCDf",
      symbol: "USDT",
      destinationID: "40231",
      // destinationChain: ""
    },
    {
      id: "ETH-MAINNET",
      name: "Ethereum",
      icon: Eth,
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      destinationID: "40231",
    }, // Replace with actual ETH icon
    // Add more tokens as needed

    {
      id: "USDT-ARB",
      name: "Tether",
      icon: Usdt,
      address: "0x43535C041AF9d270Bd7aaA9ce5313d960BBEABAD",
      symbol: "USDT",
      destinationID: "40233",
    },
    {
      id: "ETH-ARB",
      name: "Arbitrum",
      icon: Eth,
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      destinationID: "40234",
    },
  ];

  const handleUserTokenBalance = async () => {
    try {
      const info = getTokenInfo(fromToken);
      if (userAddress && info) {
        const walletAddress = userAddress;
        const tokenAddress = info.address;


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

      if (receiverAddress) {
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

  const getTokenInfo = (tokenId: string) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (token) {
      const { address, symbol, destinationID } = token;
      return { address, symbol, destinationID };
    }
    return null;
  };
  useEffect(() => {
    handleUserTokenBalance();
    handleprepareBridgeUserInfo();
    getTokenInfo(fromToken);
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
        getTokenInfo,
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
