import { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, formatUnits } from "viem";

import { tokenContract, PresaleContract } from "../lib/config";
import {
  getPresaleStatus,
  getTimeUntilStart,
  getTimeUntilEnd,
  // formatPresaleDate,
  PresaleStatus,
  // PRESALE_START_TIME,
  // PRESALE_END_TIME,
  type TimeRemaining,
} from "../lib/utils";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Clock,
  TrendingUp,
  ChevronDown,
  Zap,
  Settings,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import logo from "@/assets/logo_falwsb.png";

export default function PresaleInterface() {
  const [ethValue, setEthValue] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [showTxHash, setShowTxHash] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { address, isConnected } = useAccount();
  const {
    writeContract,
    data: txHash,
    isPending,
    error: contractError,
  } = useWriteContract();
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Real countdown state and status
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [currentPresaleStatus, setCurrentPresaleStatus] =
    useState<PresaleStatus>(getPresaleStatus());

  // Real countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const status = getPresaleStatus();
      setCurrentPresaleStatus(status);

      if (status === PresaleStatus.NOT_STARTED) {
        setTimeLeft(getTimeUntilStart());
      } else if (status === PresaleStatus.ACTIVE) {
        setTimeLeft(getTimeUntilEnd());
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set error from contract error and auto-dismiss after 8 seconds
  useEffect(() => {
    if (contractError) {
      setError(
        contractError.message || "Transaction failed. Please try again."
      );
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [contractError]);

  // Auto-dismiss error messages after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Contract reads
  const { data: tokenDecimals } = useReadContract({
    address: tokenContract.address as `0x${string}`,
    abi: tokenContract.abi,
    functionName: "decimals",
  });

  // const { data: tokenSymbol } = useReadContract({
  //   address: tokenContract.address as `0x${string}`,
  //   abi: tokenContract.abi,
  //   functionName: "symbol",
  // });

  const tokenSymbol = "$FARMR";
  const saleAllocation = 6000000;

  const { data: rawTokenBalance, refetch: refetchTokenBalance } =
    useReadContract({
      address: tokenContract.address as `0x${string}`,
      abi: tokenContract.abi,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
    });

  const { data: rate } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "rate",
  });

  const { data: weiRaised, refetch: refetchWeiRaised } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "weiRaised",
  });

  const { data: presaleStatus } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "getPreSaleStatus",
  });

  const { data: owner } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "owner",
  });

  const { data: softCap } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "softCap",
  });

  const { data: hardCap } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "hardCap",
  });

  const { data: tokensSold, refetch: refetchTokensSold } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "tokensSold",
  });

  const { data: minBuy } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "costToEnter",
  });

  const { data: maxBuy } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "maxCostToEnter",
  });

  // Show transaction hash when it becomes available and auto-dismiss
  useEffect(() => {
    if (txHash) {
      setShowTxHash(txHash as string);
      const timer = setTimeout(() => {
        setShowTxHash(null);
      }, 8000); // Auto-dismiss after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [txHash]);

  // Clear error when transaction succeeds and set auto-dismiss for success
  useEffect(() => {
    if (txSuccess) {
      setError(null);
      setEthValue("0"); // Clear the input
      setShowTxHash(null); // Hide transaction hash when success occurs
      setShowSuccess(true); // Show success message

      // Refetch all relevant data
      refetchTokenBalance();
      refetchWeiRaised();
      refetchTokensSold();

      // Auto-dismiss success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [txSuccess, refetchTokenBalance, refetchWeiRaised, refetchTokensSold]);

  const formattedTokenBalance = useMemo(() => {
    if (rawTokenBalance == null || tokenDecimals == null) return "0";
    try {
      return parseFloat(
        formatUnits(rawTokenBalance as bigint, Number(tokenDecimals))
      ).toLocaleString();
    } catch {
      return "0";
    }
  }, [rawTokenBalance, tokenDecimals]);

  const computedTokenOutput = useMemo(() => {
    // Return loading indicator or 0 if essential data isn't available
    if (!rate || !ethValue || ethValue === "0" || ethValue === "") {
      return "0";
    }

    try {
      // Parse ETH amount
      const ethAmount = parseFloat(ethValue);
      if (isNaN(ethAmount) || ethAmount <= 0) return "0";

      // Convert rate from contract (divide by 100) and parse as number for easier calculation
      const rateNumber = Number(rate) / 100;
      if (rateNumber <= 0) return "0";

      // Calculate tokens: ETH amount * rate
      const tokenAmount = ethAmount * rateNumber;

      // Format the result
      if (tokenAmount >= 1) {
        return Math.floor(tokenAmount).toLocaleString();
      } else if (tokenAmount >= 0.01) {
        return tokenAmount.toFixed(2);
      } else {
        return tokenAmount.toFixed(6);
      }
    } catch (error) {
      console.error("Error calculating token output:", error);
      return "0";
    }
  }, [rate, ethValue, tokenDecimals]);

  // Helper function to format tokens from wei to actual count
  const formattedTokensSold = useMemo(() => {
    if (!tokensSold || !tokenDecimals) return "0";
    const tokensSoldActual =
      Number(tokensSold as bigint) / Math.pow(10, Number(tokenDecimals));
    return Math.floor(tokensSoldActual).toLocaleString();
  }, [tokensSold, tokenDecimals]);

  const progressPercentage = useMemo(() => {
    if (!tokensSold || !tokenDecimals) return 0;

    // Convert tokensSold from wei to actual tokens
    const tokensSoldActual =
      Number(tokensSold as bigint) / Math.pow(10, Number(tokenDecimals));

    // Calculate percentage
    const pct = (tokensSoldActual * 100) / saleAllocation;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }, [tokensSold, saleAllocation, tokenDecimals]);

  const handleMax = () => {
    if (maxBuy) {
      setEthValue(Number(formatEther(maxBuy as bigint)).toString());
    }
  };

  const handleBuy = () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    // Clear previous errors
    setError(null);

    // Validate input
    if (!ethValue || ethValue === "0") {
      setError("Please enter an amount to purchase");
      return;
    }

    // Check if presale is active
    if (currentPresaleStatus === PresaleStatus.NOT_STARTED) {
      setError("Presale has not started yet");
      return;
    }

    if (currentPresaleStatus === PresaleStatus.ENDED) {
      setError("Presale has ended. Token purchases are no longer available.");
      return;
    }

    if (!presaleStatus) {
      setError("Presale is not currently active");
      return;
    }

    try {
      const value = parseEther(ethValue);

      // Validate min/max buy amounts
      if (minBuy && value < (minBuy as bigint)) {
        setError(
          `Minimum purchase amount is ${Number(
            formatEther(minBuy as bigint)
          )} BLOCX`
        );
        return;
      }

      if (maxBuy && value > (maxBuy as bigint)) {
        setError(
          `Maximum purchase amount is ${Number(
            formatEther(maxBuy as bigint)
          )} BLOCX`
        );
        return;
      }

      // Check if hard cap would be exceeded
      if (
        hardCap &&
        weiRaised &&
        (weiRaised as bigint) + value > (hardCap as bigint)
      ) {
        setError(
          "This purchase would exceed the hard cap. Please reduce the amount."
        );
        return;
      }

      writeContract({
        address: PresaleContract.address as `0x${string}`,
        abi: PresaleContract.abi,
        functionName: "buyTokens",
        args: [address],
        value,
        gas: 300000n, // Add explicit gas limit
      });
    } catch (err) {
      setError("Invalid amount entered. Please check your input.");
      console.error("Transaction error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-light-blue font-baloo">
      {/* Header */}
      <header className="border-b bg-dark-blue backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between min-h-[48px]">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img
                src={logo}
                alt="FarmrSwap"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-md"
              />
              <h1 className="text-lg sm:text-xl font-bold text-muted-blue font-fredoka">
                Farmrswap
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {address &&
                owner &&
                address.toLowerCase() === (owner as string).toLowerCase() && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 sm:gap-2 text-muted-blue hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                      Admin
                    </span>
                  </Link>
                )}
              <div className="scale-90 sm:scale-100">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50 shadow-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {showTxHash && !error && (
          <Alert
            className="mb-4 shadow-lg"
            style={{ backgroundColor: "#F1F1F1" }}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs text-dark-blue-green">
              Transaction: {showTxHash.substring(0, 10)}...
            </AlertDescription>
          </Alert>
        )}

        {showSuccess && (
          <Alert
            className="mb-4 border-bright-blue shadow-lg"
            style={{ backgroundColor: "#F1F1F1" }}
          >
            <AlertCircle className="h-4 w-4 text-bright-blue" />
            <AlertDescription className="text-dark-blue-green">
              Success! Tokens purchased.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 bg-[#F1F1F1] text-dark-blue-green border-dark-blue-green"
          >
            <Zap className="w-3 h-3 mr-1" />
            {currentPresaleStatus === PresaleStatus.NOT_STARTED
              ? "Presale Coming Soon"
              : currentPresaleStatus === PresaleStatus.ACTIVE
              ? "Presale Live Now"
              : "Presale Ended"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-dark-blue-green mb-4 font-fredoka">
            Farmr<span className="text-[#19A24C]">swap</span>
            <br />
            <span className="text-dark-blue-green bg-clip-text">
              Token Presale
            </span>
          </h1>
          <p className="text-lg text-dark-blue-green max-w-2xl mx-auto">
            Secure your tokens at the best price before the next stage begins.
          </p>

          {/* Presale Schedule */}
          {/* <div className="mt-6 space-y-2">
            {currentPresaleStatus === PresaleStatus.NOT_STARTED && (
              <p className="text-sm text-dark-blue-green">
                <strong>Presale Starts:</strong>{" "}
                {formatPresaleDate(PRESALE_START_TIME)}
              </p>
            )}
            <p className="text-sm text-dark-blue-green">
              <strong>
                Presale{" "}
                {currentPresaleStatus === PresaleStatus.ENDED
                  ? "Ended"
                  : "Ends"}
                :
              </strong>{" "}
              {formatPresaleDate(PRESALE_END_TIME)}
            </p>
          </div> */}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Right Column - User Balance */}
          <div className="space-y-6 lg:order-1 order-1">
            {/* User Token Balance Card */}
            <Card className="bg-dark-blue border-muted-blue">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">
                  Your Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {formattedTokenBalance} {tokenSymbol ?? "TOKEN"}
                </p>
                <p className="text-sm text-muted-blue mt-1">
                  Wallet:{" "}
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "Not connected"}
                </p>
              </CardContent>
            </Card>

            {/* Features Card - Hidden on mobile/tablet, shown on desktop in right column */}
            <Card className="bg-dark-blue border-muted-blue hidden lg:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">
                  Why Buy Now?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-muted-blue">
                    Lowest price before listing
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-muted-blue">
                    5% bonus tokens this stage
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-muted-blue">
                    Automatic distribution
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-sm text-muted-blue">
                    Verified smart contract
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Main Purchase Card */}
          <Card className="lg:col-span-1 lg:order-2 order-2 border-2 border-bright-blue shadow-xl bg-dark-blue">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center gap-2 text-bright-blue text-sm font-semibold mb-3">
                <Clock className="w-4 h-4" />
                {currentPresaleStatus === PresaleStatus.NOT_STARTED
                  ? "TIME UNTIL START"
                  : currentPresaleStatus === PresaleStatus.ACTIVE
                  ? "TIME REMAINING"
                  : "PRESALE ENDED"}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-light-gray rounded-lg p-3">
                  <div className="text-2xl font-bold text-dark-blue-green">
                    {timeLeft.days.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-black mt-1">DAYS</div>
                </div>
                <div className="bg-light-gray rounded-lg p-3">
                  <div className="text-2xl font-bold text-dark-blue-green">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-black mt-1">HOURS</div>
                </div>
                <div className="bg-light-gray rounded-lg p-3">
                  <div className="text-2xl font-bold text-dark-blue-green">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-black mt-1">MINS</div>
                </div>
                <div className="bg-light-gray rounded-lg p-3">
                  <div className="text-2xl font-bold text-dark-blue-green">
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-black mt-1">SECS</div>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#F1F1F1]">
                    Tokens Sold
                  </span>
                  <span className="text-sm font-medium text-[#F1F1F1]">
                    {formattedTokensSold}/ {saleAllocation.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className="h-3 mb-2 progress-bar"
                />
                <div className="text-center">
                  <span className="text-lg font-bold text-[#F1F1F1]">
                    {progressPercentage}% Complete
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block text-white">
                  network
                </Label>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 bg-light-gray hover:bg-muted-blue border-muted-blue"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Ξ</span>
                    </div>
                    <span className="font-medium text-black">
                      Blocx Mainnet
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm mb-2 block text-white">
                    You Pay (BLOCX)
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={ethValue}
                      onChange={(e) => setEthValue(e.target.value)}
                      placeholder="0.00"
                      className="h-12 text-center font-semibold text-lg bg-light-gray text-dark-blue-green border-muted-blue pr-16"
                    />
                    <Button
                      type="button"
                      onClick={handleMax}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs bg-[#2463EB] hover:bg-dark-blue-green text-white font-medium"
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-2 block text-white">
                    You Receive ({tokenSymbol ?? "TOKEN"})
                  </Label>
                  <Input
                    type="text"
                    value={computedTokenOutput}
                    readOnly
                    placeholder={
                      rate ? "Enter BLOCX amount" : "Loading rate..."
                    }
                    className="h-12 text-center font-semibold text-lg bg-light-gray text-dark-blue-green border-muted-blue"
                  />
                </div>
              </div>

              {/* Buy Button */}
              <Button
                onClick={handleBuy}
                disabled={
                  !isConnected ||
                  isPending ||
                  !ethValue ||
                  ethValue === "0" ||
                  currentPresaleStatus === PresaleStatus.NOT_STARTED ||
                  currentPresaleStatus === PresaleStatus.ENDED
                }
                className="w-full h-12 bg-[#19A24C] hover:bg-[#2463EB] text-white font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending
                  ? "Processing..."
                  : currentPresaleStatus === PresaleStatus.NOT_STARTED
                  ? "Presale Not Started"
                  : currentPresaleStatus === PresaleStatus.ENDED
                  ? "Presale Ended"
                  : "Buy Tokens"}
              </Button>
            </CardContent>
          </Card>

          {/* Left Column - Info Cards */}
          <div className="space-y-6 lg:order-3 order-3">
            {/* Sale Information */}
            <Card className="bg-dark-blue border-muted-blue">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <TrendingUp className="w-4 h-4 text-bright-blue" />
                  Sale Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">Rate</span>
                    <span className="font-semibold text-white">
                      {rate
                        ? `${(Number(rate) / 100).toLocaleString()} ${
                            tokenSymbol ?? "TOKEN"
                          } / BLOCX`
                        : "Loading..."}
                    </span>
                  </div>
                  <Separator className="bg-muted-blue" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Raised (BLOCX)
                    </span>
                    <span className="font-semibold text-muted-blue-alt">
                      {weiRaised
                        ? `${Number(
                            formatEther(weiRaised as bigint)
                          ).toLocaleString()}`
                        : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Soft Cap (BLOCX)
                    </span>
                    <span className="font-semibold text-white">
                      {softCap
                        ? Number(
                            formatEther(softCap as bigint)
                          ).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Hard Cap (BLOCX)
                    </span>
                    <span className="font-semibold text-white">
                      {hardCap
                        ? Number(
                            formatEther(hardCap as bigint)
                          ).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">Tokens Sold</span>
                    <span className="font-semibold text-white">
                      {formattedTokensSold}
                    </span>
                  </div> */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Min Buy (BLOCX)
                    </span>
                    <span className="font-semibold text-white">
                      {minBuy
                        ? Number(formatEther(minBuy as bigint)).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Max Buy (BLOCX)
                    </span>
                    <span className="font-semibold text-white">
                      {maxBuy
                        ? Number(formatEther(maxBuy as bigint)).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Card - Mobile/Tablet only, appears last */}
        <div className="lg:hidden mt-8 grid lg:grid-cols-3 gap-8 max-w-6xl ">
          <Card className="bg-dark-blue border-muted-blue">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Why Buy Now?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-muted-blue">
                  Lowest price before listing
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-muted-blue">
                  15% token discount this stage
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-muted-blue">
                  Automatic distribution
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-bright-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-muted-blue">
                  Verified smart contract
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
