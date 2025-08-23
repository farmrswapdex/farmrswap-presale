import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  ArrowLeft,
  Play,
  Pause,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Wallet,
} from "lucide-react";
import logo from "@/assets/logo_falwsb.png";
import { PresaleContract } from "../lib/config";
import { parseEther, formatEther } from "viem";

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  // State for initialiser inputs
  const [initRate, setInitRate] = useState("");
  const [entranceFee, setEntranceFee] = useState("");
  const [maxBuy, setMaxBuy] = useState("");
  const [softCapInput, setSoftCapInput] = useState("");
  const [hardCapInput, setHardCapInput] = useState("");

  // State for other function inputs
  const [newEntranceFee, setNewEntranceFee] = useState("");
  const [newMaxBuy, setNewMaxBuy] = useState("");
  const [finalizeAddress, setFinalizeAddress] = useState("");

  // Alert states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Contract reads
  const { data: owner } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "owner",
  });

  const { data: presaleStatus, refetch: refetchPresaleStatus } =
    useReadContract({
      address: PresaleContract.address as `0x${string}`,
      abi: PresaleContract.abi,
      functionName: "getPreSaleStatus",
    });

  const { data: weiRaised, refetch: refetchWeiRaised } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "weiRaised",
  });

  const { data: currentRate } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "rate",
  });

  const { data: currentMinBuy } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "costToEnter",
  });

  const { data: currentMaxBuy } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "maxCostToEnter",
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

  const { data: finalizeSaleStatus } = useReadContract({
    address: PresaleContract.address as `0x${string}`,
    abi: PresaleContract.abi,
    functionName: "getFinalizeSale",
  });

  // Write contract hook
  const {
    writeContract,
    data: writeTxHash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: writeTxHash,
  });

  // Handle transaction success
  useEffect(() => {
    if (txSuccess) {
      setSuccess("Transaction completed successfully!");
      setTxHash(null);
      // Refetch relevant data
      refetchPresaleStatus();
      refetchWeiRaised();
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [txSuccess, refetchPresaleStatus, refetchWeiRaised]);

  // Handle transaction hash
  useEffect(() => {
    if (writeTxHash) {
      setTxHash(writeTxHash);
      setError(null);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setTxHash(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [writeTxHash]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed");
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [writeError]);

  // Function handlers
  const handleInitialiser = () => {
    if (
      !initRate ||
      !entranceFee ||
      !maxBuy ||
      !softCapInput ||
      !hardCapInput
    ) {
      setError("Please fill in all initialiser fields");
      return;
    }

    try {
      // Use the rate exactly as entered - no decimal conversion needed
      const rateForContract = BigInt(initRate);

      writeContract({
        address: PresaleContract.address as `0x${string}`,
        abi: PresaleContract.abi,
        functionName: "initialiser",
        args: [
          rateForContract,
          parseEther(entranceFee),
          parseEther(maxBuy),
          parseEther(softCapInput),
          parseEther(hardCapInput),
        ],
      });
    } catch (err) {
      setError("Invalid input values");
    }
  };

  const handleSetEntranceFee = () => {
    if (!newEntranceFee) {
      setError("Please enter a new entrance fee");
      return;
    }

    try {
      writeContract({
        address: PresaleContract.address as `0x${string}`,
        abi: PresaleContract.abi,
        functionName: "setEntranceFee",
        args: [parseEther(newEntranceFee)],
      });
    } catch (err) {
      setError("Invalid entrance fee");
    }
  };

  const handleSetMaxBuy = () => {
    if (!newMaxBuy) {
      setError("Please enter a new max buy amount");
      return;
    }

    try {
      writeContract({
        address: PresaleContract.address as `0x${string}`,
        abi: PresaleContract.abi,
        functionName: "setMaxBUY",
        args: [parseEther(newMaxBuy)],
      });
    } catch (err) {
      setError("Invalid max buy amount");
    }
  };

  const handleOpenSale = () => {
    writeContract({
      address: PresaleContract.address as `0x${string}`,
      abi: PresaleContract.abi,
      functionName: "openSale",
    });
  };

  const handleCloseSale = () => {
    writeContract({
      address: PresaleContract.address as `0x${string}`,
      abi: PresaleContract.abi,
      functionName: "closeSale",
    });
  };

  const handleFinalizeSale = () => {
    if (!finalizeAddress) {
      setError("Please enter an address to finalize sale to");
      return;
    }

    try {
      writeContract({
        address: PresaleContract.address as `0x${string}`,
        abi: PresaleContract.abi,
        functionName: "finalizeSale",
        args: [finalizeAddress as `0x${string}`],
      });
    } catch (err) {
      setError("Invalid address");
    }
  };

  // Check if user is owner
  const isOwner =
    isConnected &&
    address &&
    owner &&
    address.toLowerCase() === (owner as string).toLowerCase();

  // Redirect if not the owner
  if (isConnected && !isOwner) {
    return (
      <div className="min-h-screen bg-light-blue font-baloo flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-blue-green mb-4">
            Access Denied
          </h1>
          <p className="text-dark-blue-green mb-6">
            You are not authorized to access this page.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-dark-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Presale
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-blue font-baloo">
      {/* Header */}
      <header className="border-b bg-dark-blue backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="FarmrSwap"
                className="w-10 h-10 rounded-lg shadow-md"
              />
              <h1 className="text-xl font-bold text-muted-blue font-fredoka">
                Farmrswap Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-blue hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Presale</span>
              </Link>
              <ConnectButton />
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

        {txHash && (
          <Alert className="mb-4 shadow-lg bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <AlertDescription className="text-xs text-blue-800">
              Transaction: {txHash.substring(0, 10)}...{txHash.slice(-8)}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-400 bg-green-50 shadow-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-dark-blue-green text-2xl font-bold mb-4">
            <Settings className="w-6 h-6" />
            Admin Panel
          </div>
          <p className="text-dark-blue-green">
            Manage your presale contract settings and functions.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Status Overview */}
          <Card className="lg:col-span-3 bg-dark-blue border-muted-blue">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-bright-blue" />
                Presale Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-muted-blue text-sm">Status</p>
                  <Badge
                    className={presaleStatus ? "bg-green-600" : "bg-red-600"}
                  >
                    {presaleStatus ? "LIVE" : "PAUSED"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-blue text-sm">Wei Raised</p>
                  <p className="text-white font-bold">
                    {weiRaised ? formatEther(weiRaised as bigint) : "0"} ETH
                  </p>
                </div>
                <div>
                  <p className="text-muted-blue text-sm">Current Rate</p>
                  <p className="text-white font-bold">
                    {currentRate
                      ? (Number(currentRate) / 100).toLocaleString()
                      : "0"}{" "}
                    $FARMR/ETH
                  </p>
                </div>
                <div>
                  <p className="text-muted-blue text-sm">Finalized</p>
                  <Badge
                    className={
                      finalizeSaleStatus ? "bg-green-600" : "bg-yellow-600"
                    }
                  >
                    {finalizeSaleStatus ? "YES" : "NO"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Initialiser Card */}
          <Card className="lg:col-span-2 bg-dark-blue border-muted-blue">
            <CardHeader>
              <CardTitle className="text-white">Initialize Presale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-blue text-sm">
                    Rate (tokens per ETH)
                  </Label>
                  <Input
                    type="number"
                    value={initRate}
                    onChange={(e) => setInitRate(e.target.value)}
                    placeholder="1000"
                    className="bg-light-gray text-dark-blue-green"
                  />
                </div>
                <div>
                  <Label className="text-muted-blue text-sm">
                    Entrance Fee (ETH)
                  </Label>
                  <Input
                    type="number"
                    value={entranceFee}
                    onChange={(e) => setEntranceFee(e.target.value)}
                    placeholder="0.01"
                    className="bg-light-gray text-dark-blue-green"
                  />
                </div>
                <div>
                  <Label className="text-muted-blue text-sm">
                    Max Buy (ETH)
                  </Label>
                  <Input
                    type="number"
                    value={maxBuy}
                    onChange={(e) => setMaxBuy(e.target.value)}
                    placeholder="1"
                    className="bg-light-gray text-dark-blue-green"
                  />
                </div>
                <div>
                  <Label className="text-muted-blue text-sm">
                    Soft Cap (ETH)
                  </Label>
                  <Input
                    type="number"
                    value={softCapInput}
                    onChange={(e) => setSoftCapInput(e.target.value)}
                    placeholder="10"
                    className="bg-light-gray text-dark-blue-green"
                  />
                </div>
                <div>
                  <Label className="text-muted-blue text-sm">
                    Hard Cap (ETH)
                  </Label>
                  <Input
                    type="number"
                    value={hardCapInput}
                    onChange={(e) => setHardCapInput(e.target.value)}
                    placeholder="50"
                    className="bg-light-gray text-dark-blue-green"
                  />
                </div>
              </div>
              <Button
                onClick={handleInitialiser}
                disabled={isPending}
                className="w-full bg-bright-blue hover:bg-[#19A24C] text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Initialize Contract"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sale Control */}
          <Card className="bg-dark-blue border-muted-blue">
            <CardHeader>
              <CardTitle className="text-white">Sale Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleOpenSale}
                  disabled={isPending || presaleStatus}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Open Sale
                </Button>
                <Button
                  onClick={handleCloseSale}
                  disabled={isPending || !presaleStatus}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Close Sale
                </Button>
              </div>
              <Separator className="bg-muted-blue" />
              <div className="space-y-2">
                <p className="text-muted-blue text-sm">Current Caps</p>
                <div className="space-y-1">
                  <p className="text-white text-sm">
                    Soft: {softCap ? formatEther(softCap as bigint) : "0"} ETH
                  </p>
                  <p className="text-white text-sm">
                    Hard: {hardCap ? formatEther(hardCap as bigint) : "0"} ETH
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Settings */}
          <Card className="bg-dark-blue border-muted-blue">
            <CardHeader>
              <CardTitle className="text-white">Update Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-blue text-sm">
                  New Entrance Fee (ETH)
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    value={newEntranceFee}
                    onChange={(e) => setNewEntranceFee(e.target.value)}
                    placeholder={
                      currentMinBuy
                        ? formatEther(currentMinBuy as bigint)
                        : "0.01"
                    }
                    className="bg-light-gray text-dark-blue-green"
                  />
                  <Button
                    onClick={handleSetEntranceFee}
                    disabled={isPending}
                    className="bg-[#19A24C] hover:bg-bright-blue text-white"
                  >
                    Set
                  </Button>
                </div>
                <p className="text-xs text-muted-blue mt-1">
                  Current:{" "}
                  {currentMinBuy ? formatEther(currentMinBuy as bigint) : "0"}{" "}
                  ETH
                </p>
              </div>

              <div>
                <Label className="text-muted-blue text-sm">
                  New Max Buy (ETH)
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    value={newMaxBuy}
                    onChange={(e) => setNewMaxBuy(e.target.value)}
                    placeholder={
                      currentMaxBuy ? formatEther(currentMaxBuy as bigint) : "1"
                    }
                    className="bg-light-gray text-dark-blue-green"
                  />
                  <Button
                    onClick={handleSetMaxBuy}
                    disabled={isPending}
                    className="bg-[#19A24C] hover:bg-bright-blue text-white"
                  >
                    Set
                  </Button>
                </div>
                <p className="text-xs text-muted-blue mt-1">
                  Current:{" "}
                  {currentMaxBuy ? formatEther(currentMaxBuy as bigint) : "0"}{" "}
                  ETH
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Finalize Sale */}
          <Card className="bg-dark-blue border-muted-blue">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Finalize Sale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-900/20 border-yellow-600/50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-200 text-xs">
                  This will withdraw all unsold tokens to the specified address.
                </AlertDescription>
              </Alert>
              <div>
                <Label className="text-muted-blue text-sm">
                  Withdrawal Address
                </Label>
                <Input
                  type="text"
                  value={finalizeAddress}
                  onChange={(e) => setFinalizeAddress(e.target.value)}
                  placeholder="0x..."
                  className="bg-light-gray text-dark-blue-green mt-1"
                />
              </div>
              <Button
                onClick={handleFinalizeSale}
                disabled={isPending || !finalizeAddress}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Finalize & Withdraw
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
