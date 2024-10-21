import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import Usdtc from "./../public/usdtc.svg";
import Usdt from "./../public/usdt.svg";
import Quan from "./../public/quan.svg";
import Eth from "./../public/eth.svg";
import Alpha from "./../public/alpha.svg";
import Ksh from "./../public/ksh.svg";
import Base from "./../public/base.svg";
import { toast } from "react-toastify";
import Lisk from "./../public/lisk.svg";

import { bridgeWrapper, lendingPoolWrapper } from "@/helpers/helpers";
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
  toNetwork: string; // Keep this as string if it's not part of SupportedChain
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
  setTokenAddress: (tokenAddress: string) => void;
  tokenAddress: string;
  setOriginalChain: (originChain: SupportedChain | null) => void;
  originalChain: SupportedChain | null;
  userAddress: string;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  modalType: "from" | "to";
  setModalType: (type: "from" | "to") => void;
  networks: Network[];
  tokens: Token[];
  getTokenInfo: (tokenId: string) => {
    address: string;
    symbol: string;
    destinationID: string;
    originChain: SupportedChain;
    sourceChainAddress: string;
  } | null;
  supplyBalance: string;
  setSupplyBalance: React.Dispatch<React.SetStateAction<string>>;
  borrowBalance: string;
  setBorrowBalance: React.Dispatch<React.SetStateAction<string>>;
  creditLimit: string;
  setCreditLimit: React.Dispatch<React.SetStateAction<string>>;
  supplyMarket: string;
  setSupplyMarket: React.Dispatch<React.SetStateAction<string>>;
  loanMarket: string;
  setLoanMarket: React.Dispatch<React.SetStateAction<string>>;
  whitelistedTokens: string[];
  setWhitelistedTokens: React.Dispatch<React.SetStateAction<string[]>>;
  supply: (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => Promise<any>;
  borrow: (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => Promise<any>;
  repay: (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => Promise<any>;
  withdraw: (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => Promise<any>;
  getSuppliedBalance: (
    userAddress: string,
    chain: SupportedChain
  ) => Promise<void>;
  getBorrowedBalance: (
    userAddress: string,
    chain: SupportedChain
  ) => Promise<void>;
  updateCreditLimit: (
    userAddress: string,
    chain: SupportedChain
  ) => Promise<void>;
  updateMarketTotals: (
    tokenAddress: string,
    chain: SupportedChain
  ) => Promise<void>;
  updateWhitelistedTokens: (chain: SupportedChain) => Promise<void>;
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

  const [supplyBalance, setSupplyBalance] = useState("0");
  const [borrowBalance, setBorrowBalance] = useState("0");
  const [creditLimit, setCreditLimit] = useState("0");
  const [supplyMarket, setSupplyMarket] = useState("0");
  const [loanMarket, setLoanMarket] = useState("0");
  const [whitelistedTokens, setWhitelistedTokens] = useState<string[]>([]);

  const networks: { id: SupportedChain; icon: any; name: string }[] = [
    { id: "eth-sepolia", icon: Eth, name: "Ethereum (Sepolia)" },
    // { id: "arbitrum-sepolia", icon: Arb, name: "Arbitrum (Sepolia)" },
    { id: "base-sepolia", icon: Base, name: "Base (Sepolia)" },
    // { id: "CELO", icon: Celo, name: "Celo" },
    // { id: "OP", icon: Op, name: "Optimism" },
    // { id: "LISK", icon: Lisk, name: "Lisk" },
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
      id: "USDTC-BASE",
      name: "Tether",
      icon: Usdtc,
      address: "0x567319975c42BaFdf80B42222340A9Cc8015693e",
      symbol: "USDTC",
      destinationID: "40245",
      originChain: "base-sepolia",
      sourceChainAddress: "0xf762f004a30CB141d139C900f2Aa3631Db7FD2E7",
    },
    {
      id: "ALPHA-BASE",
      name: "Alpha",
      icon: Alpha,
      address: "0x2816a02000B9845C464796b8c36B2D5D199525d5",
      symbol: "ALPHA",
      destinationID: "40245",
      originChain: "base-sepolia",
      sourceChainAddress: "0xf762f004a30CB141d139C900f2Aa3631Db7FD2E7",
    },
    {
      id: "KES-BASE",
      name: "Kenya Shillings",
      icon: Ksh,
      address: "0x348490F429cb31A4E45a2323f359880302227fDA",
      symbol: "Kenya Shillings",
      destinationID: "40245",
      originChain: "base-sepolia",
      sourceChainAddress: "0xf762f004a30CB141d139C900f2Aa3631Db7FD2E7",
    },
    {
      id: "QUANTUM-BASE",
      name: "Quantum Token",
      icon: Quan,
      address: "0x2898dE208BC827089BD41131F09423E554c51a11",
      symbol: "Quantum Token",
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

  const supply = async (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => {
    try {
      const result = await lendingPoolWrapper.supply(
        tokenAddress,
        amount,
        walletClient,
        chain
      );
      setHash(result!.hash);
      return result;
    } catch (error) {
      console.error("Error in supply:", error);
      throw error;
    }
  };

  const borrow = async (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => {
    try {
      const result = await lendingPoolWrapper.borrow(
        tokenAddress,
        amount,
        walletClient,
        chain
      );
      setHash(result!.hash);
      return result;
    } catch (error) {
      console.error("Error in borrow:", error);
      throw error;
    }
  };

  const repay = async (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => {
    try {
      const result = await lendingPoolWrapper.repay(
        tokenAddress,
        amount,
        walletClient,
        chain
      );
      setHash(result!.hash);

      return result;
    } catch (error) {
      console.error("Error in repay:", error);
      throw error;
    }
  };

  const withdraw = async (
    tokenAddress: string,
    amount: string,
    walletClient: any,
    chain: SupportedChain
  ) => {
    try {
      const result = await lendingPoolWrapper.withdraw(
        tokenAddress,
        amount,
        walletClient,
        chain
      );
      setHash(result!.hash);

      return result;
    } catch (error) {
      console.error("Error in withdraw:", error);
      throw error;
    }
  };

  const getSuppliedBalance = async (
    userAddress: string,
    chain: SupportedChain
  ) => {
    try {
      const balance = await lendingPoolWrapper.getSuppliedBalance(
        userAddress,
        chain
      );
      setSupplyBalance(balance);
    } catch (error) {
      console.error("Error in getSuppliedBalance:", error);
      throw error;
    }
  };

  const getBorrowedBalance = async (
    userAddress: string,
    chain: SupportedChain
  ) => {
    try {
      const balance = await lendingPoolWrapper.getBorrowedBalance(
        userAddress,
        chain
      );
      setBorrowBalance(balance);
    } catch (error) {
      console.error("Error in getBorrowedBalance:", error);
      throw error;
    }
  };

  const updateCreditLimit = async (
    userAddress: string,
    chain: SupportedChain
  ) => {
    try {
      const limit = await lendingPoolWrapper.getCreditLimit(userAddress, chain);
      setCreditLimit(limit);
    } catch (error) {
      console.log("Error in updateCreditLimit:", error);
      throw error;
    }
  };

  const updateMarketTotals = async (
    tokenAddress: string,
    chain: SupportedChain
  ) => {
    try {
      const totalSupply = await lendingPoolWrapper.getTotalSupply(
        tokenAddress,
        chain
      );

      if (totalSupply) {
        setSupplyMarket(totalSupply);
        const totalBorrowed = await lendingPoolWrapper.getTotalBorrowed(
          tokenAddress,
          chain
        );

        setLoanMarket(totalBorrowed!);
      }
    } catch (error) {
      console.log("unable to update markets:", error);
      throw error;
    }
  };

  const updateWhitelistedTokens = async (chain: SupportedChain) => {
    try {
      const tokens = await lendingPoolWrapper.getWhitelistedTokens(chain);
      setWhitelistedTokens(tokens);
    } catch (error) {
      console.error("Error in updateWhitelistedTokens:", error);
      throw error;
    }
  };
  useEffect(() => {
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
        whitelistedTokens,
        setWhitelistedTokens,
        updateCreditLimit,
        updateMarketTotals,
        updateWhitelistedTokens,
        supplyBalance,
        setSupplyBalance,
        borrowBalance,
        setBorrowBalance,
        creditLimit,
        setCreditLimit,
        supplyMarket,
        setSupplyMarket,
        loanMarket,
        setLoanMarket,
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
        setTokenAddress,
        supply,
        borrow,
        repay,
        withdraw,
        getSuppliedBalance,
        getBorrowedBalance,
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