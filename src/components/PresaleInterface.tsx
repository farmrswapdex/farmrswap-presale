import { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, formatUnits } from "viem";

import { tokenContract, PresaleContract } from "../lib/config";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  TrendingUp,
  Settings,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import logo from "@/assets/logo_falwsb.png";
import bigjuicy from "@/assets/bigjuicy.png";

export default function PresaleInterface() {
  const [error, setError] = useState<string | null>(null);
  const [showTxHash, setShowTxHash] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { address } = useAccount();
  const { data: txHash, error: contractError } = useWriteContract();
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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

  const { data: rawTokenBalance, refetch: refetchTokenBalance } =
    useReadContract({
      address: tokenContract.address as `0x${string}`,
      abi: tokenContract.abi,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
    });

  const { data: weiRaised, refetch: refetchWeiRaised } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "weiRaised",
  });

  const { data: owner } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "owner",
  });

  const { data: hardCap } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "hardCap",
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
      setShowTxHash(null); // Hide transaction hash when success occurs
      setShowSuccess(true); // Show success message

      // Refetch all relevant data
      refetchTokenBalance();
      refetchWeiRaised();

      // Auto-dismiss success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [txSuccess, refetchTokenBalance, refetchWeiRaised]);

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
        <div className="mb-12 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-4xl md:text-6xl font-bold text-dark-blue-green mb-4 font-fredoka">
                Farmr<span className="text-[#19A24C]">swap</span>
                <br />
                <span className="text-dark-blue-green bg-clip-text">
                  Token Presale
                </span>
              </h1>
              <p className="text-lg text-dark-blue-green">
                Secure your tokens at the best price before the next stage
                begins.
              </p>
            </div>
            <img
              src={bigjuicy}
              alt="Farmr Token"
              className="hidden lg:block w-64 h-64 xl:w-72 xl:h-72 object-contain flex-shrink-0"
            />
          </div>

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
                    10% token price discount this stage
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
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Main Purchase Card */}
          <Card className="lg:col-span-1 lg:order-2 order-2 border-2 border-bright-blue shadow-xl bg-dark-blue">
            <CardContent className="pt-6">
              <div className="text-center">
                <span className="text-lg font-bold text-bright-blue">
                  Blocx Presale Complete! 🎉
                </span>
              </div>
              {/* Progress Section */}
              <div className="mb-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#F1F1F1]">
                    BLOCX Raised
                  </span>
                  <span className="text-sm font-medium text-[#F1F1F1]">
                    {hardCap && weiRaised
                      ? `${(
                          Number(formatEther(weiRaised as bigint)) / 1000000
                        ).toFixed(1)}M / ${(
                          Number(formatEther(hardCap as bigint)) / 1000000
                        ).toFixed(1)}M`
                      : "Loading..."}
                  </span>
                </div>
                <Progress value={100} className="h-3 mb-2 progress-bar" />
              </div>

              <Separator className="bg-muted-blue my-6" />

              {/* USDC Sale Notice */}
              <div className="text-center mb-6">
                <p className="text-lg text-white mb-3">
                  <strong>Missed out on the Blocx presale?</strong>
                </p>
                <p className="text-muted-blue mb-4">
                  You can still purchase $FARMR tokens with USDC on ETH Mainnet
                </p>
                <a
                  href="https://tally.so/r/mO2kB7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-bright-blue hover:bg-[#19A24C] text-white font-semibold rounded-lg transition-colors"
                >
                  Buy with USDC
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <Separator className="bg-muted-blue my-6" />

              {/* Links Section */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-center mb-4">
                  Join Our Community
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <a
                    href="https://farmrswap.gitbook.io/docs/roadmap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-light-gray hover:bg-muted-blue text-dark-blue-green font-medium rounded-lg transition-colors"
                  >
                    📋 Roadmap
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="https://t.me/farmrswap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-light-gray hover:bg-muted-blue text-dark-blue-green font-medium rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Telegram (FARMRs)
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="https://x.com/farmrswap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-light-gray hover:bg-muted-blue text-dark-blue-green font-medium rounded-lg transition-colors"
                  >
                    𝕏 Twitter/X
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
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
                      1.95 {tokenSymbol ?? "TOKEN"} / BLOCX
                    </span>
                  </div>
                  <Separator className="bg-muted-blue" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Raised (BLOCX)
                    </span>
                    <span className="font-semibold text-white">3,000,000</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Hard Cap (BLOCX)
                    </span>
                    <span className="font-semibold text-white">3,000,000</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Min Buy (BLOCX)
                    </span>
                    <span className="font-semibold text-white">10,000</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-blue">
                      Max Buy (BLOCX)
                    </span>
                    <span className="font-semibold text-white">500,000</span>
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
                  10% token price discount this stage
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-blue border-t border-muted-blue mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="FarmrSwap" className="w-8 h-8 rounded-lg" />
              <p className="text-muted-blue text-sm">
                © 2025 Farmrswap. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://farmrswap.gitbook.io/docs/roadmap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-blue hover:text-white text-sm transition-colors"
              >
                Roadmap
              </a>
              <a
                href="https://t.me/farmrswap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-blue hover:text-white text-sm transition-colors"
              >
                Telegram
              </a>
              <a
                href="https://x.com/farmrswap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-blue hover:text-white text-sm transition-colors"
              >
                Twitter/X
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
