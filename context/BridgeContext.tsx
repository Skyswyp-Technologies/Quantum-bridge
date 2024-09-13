import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import Usdt from "./../public/usdt.svg";
import Arb from "./../public/arb.svg";
import Eth from "./../public/eth.svg"; // Add this import
import Celo from "./../public/celo.svg";
import Op from "./../public/op.svg";
import Base from "./../public/base.svg";
import Lisk from "./../public/lisk.svg";

import { bridgeWrapper } from "@/helpers/helpers";
import { SupportedChain } from "@/helpers/inteface/interface";

interface Token {
  id: string;
  name: string;
  icon: any; // You might want to use a more specific type for the icon
  address: string;
  symbol: string;
  destinationID: string;
  originChain: SupportedChain;
  sourceChainAddress: string;
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
  setGasPrice: (gasPrice: string) => void;
  gasPrice: string;
  setHash: (txHash: string) => void;
  txHash: string;
  setDestinationID: (tokenSymbol: string) => void;
  destinationID: string;
  setSourceContractAddress: (sourceContractAddress: string) => void;
  sourceContractAddress: string;
  setTokenSymbol: (tokenSymbol: string) => void;
  tokenSymbol: string;
  setTokenAddress:(tokenAddress: string)=> void;
  tokenAddress: string
  setOriginalChain: (originChain: SupportedChain | null) => void;
  originalChain: SupportedChain | null;
  userAddress: string;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  modalType: "from" | "to";
  setModalType: (type: "from" | "to") => void;
  networks: Network[];
  tokens: Token[];
  getTokenInfo: (
    tokenId: string
  ) => {
    address: string;
    symbol: string;
    destinationID: string;
    originChain: SupportedChain;
    sourceChainAddress: string;
  } | null;
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
  const [gasPrice, setGasPrice] = useState("");
  const [txHash, setHash] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [destinationID, setDestinationID] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [originalChain, setOriginalChain] = useState<SupportedChain | null>(
    null
  );
  const [sourceContractAddress, setSourceContractAddress] = useState("");

  const networks: Network[] = [
    { id: "ETH", icon: Eth, name: "Ethereum" },
    { id: "ARB", icon: Arb, name: "Arbitrum" },
    { id: "CELO", icon: Celo, name: "Celo" },
    { id: "OP", icon: Op, name: "Optimism" },
    { id: "BASE", icon: Base, name: "Base" },
    { id: "LISK", icon: Lisk, name: "Lisk" },
  ];

  const tokens: Token[] = [
    {
      id: "USDT-ETH",
      name: "Tether",
      icon: Usdt,
      address: "0x84cba2A35398B42127B3148744DB3Cd30981fCDf",
      symbol: "USDT",
      destinationID: "40161",
      originChain: "eth-sepolia",
      sourceChainAddress: "0x67e0B3f4069e59812EecC65DF127811A43AF5Eb9",
    },
    {
      id: "ETH-SEPOLIA",
      name: "Ethereum",
      icon: Eth,
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      destinationID: "40161",
      originChain: "eth-sepolia",
      sourceChainAddress: "0x67e0B3f4069e59812EecC65DF127811A43AF5Eb9",
    },

    {
      id: "USDT-ARB",
      name: "Tether",
      icon: Usdt,
      address: "0x43535C041AF9d270Bd7aaA9ce5313d960BBEABAD",
      symbol: "USDT",
      destinationID: "40231",
      originChain: "arbitrum-sepolia",
      sourceChainAddress: "0x74FCAE483Cd97791078B8E6073757e04356C20bd",
    },
    {
      id: "ETH-ARB",
      name: "Arbitrum",
      icon: Eth,
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      destinationID: "40231",
      originChain: "arbitrum-sepolia",
      sourceChainAddress: "0x74FCAE483Cd97791078B8E6073757e04356C20bd",
    },

    {
      id: "ETH-BASE",
      name: "Base",
      icon: Eth,
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      destinationID: "40245",
      originChain: "base-sepolia",
      sourceChainAddress: "0xf762f004a30CB141d139C900f2Aa3631Db7FD2E7",
    },
    {
      id: "USDT-BASE",
      name: "Tether",
      icon: Eth,
      address: "0x2816a02000B9845C464796b8c36B2D5D199525d5",
      symbol: "USDT",
      destinationID: "40245",
      originChain: "base-sepolia",
      sourceChainAddress: "0xf762f004a30CB141d139C900f2Aa3631Db7FD2E7",
    },
  ];

  const handleUserTokenBalance = async () => {

    try {
      

      const info = getTokenInfo(fromToken);
      if (userAddress && info) {
        const walletAddress = userAddress;
        const tokenAddress = info.address;
        const baseChain = info.originChain;

        const bal = await bridgeWrapper.getUSDTBalance(
          walletAddress,
          tokenAddress,
          baseChain
        );

        setSourceContractAddress(info.sourceChainAddress);
        setOriginalChain(baseChain);
        setTokenSymbol(info.symbol);
        setDestinationID(info.destinationID);
        setTokenBalance(bal.balance);
        setTokenAddress(tokenAddress);
        return bal;
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  };

  const handleprepareBridgeUserInfo = async () => {
    try {
      
      const simulationAmount = amount.toString();
      const token = tokenAddress;
      const receiverAddress = recipientAddress;
      const destID = "40245";
      const contractAddress = sourceContractAddress;
      const baseChain = originalChain;

      if (receiverAddress && baseChain) {
        const simInfo = await bridgeWrapper.prepareBridgeInfo(
          contractAddress,
          simulationAmount,
          token,
          receiverAddress,
          destID,
          baseChain
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
      const {
        address,
        symbol,
        destinationID,
        originChain,
        sourceChainAddress,
      } = token;
      return {
        address,
        symbol,
        destinationID,
        originChain,
        sourceChainAddress,
      };
    }
    return null;
  };

  const getGasPrice = async () => {
    try {
      if (!originalChain) {
        throw new Error("No chain selected");
      }

      const gasPriceResult = await bridgeWrapper.getGasPrice(originalChain);

      if (gasPriceResult) {
        setGasPrice(gasPriceResult.usdt);
      }
    } catch (error) {
      console.error("Error fetching gas price:", error);
      throw error;
    }
  };

  useEffect(() => {
    getGasPrice();
    handleUserTokenBalance();
    handleprepareBridgeUserInfo();
    getTokenInfo(fromToken);
  }, [
    toToken,
    tokenSymbol,
    destinationID,
    tokenAddress,
    originalChain,
    sourceContractAddress,
    recipientAddress,
    userAddress,
    setTokenBalance,
    setPayload,
    setOptions,
    setNativeFee,
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
        gasPrice,
        setGasPrice,
        setHash,
        txHash,
        destinationID,
        setDestinationID,
        tokenSymbol,
        setTokenSymbol,
        originalChain,
        setOriginalChain,
        sourceContractAddress,
        setSourceContractAddress,
        tokenAddress, 
        setTokenAddress
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
