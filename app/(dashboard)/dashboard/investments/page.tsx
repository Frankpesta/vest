"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TrendingUp, Search, Filter, Star, Coins, Building, DollarSign, Globe } from "lucide-react"
import Image from "next/image"
import { mockInvestmentPlans } from "@/mocks/data"
import { useWalletStore } from "@/lib/store"
import { toast } from "sonner"

export default function InvestmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const { isConnected, balance } = useWalletStore()

  const filteredInvestments = mockInvestmentPlans.map(plan => ({
    ...plan,
    apy: plan.expectedReturn.replace('%', '').split('-')[1] || '12',
    minInvestment: plan.minInvestment,
    riskLevel: plan.riskLevel.charAt(0).toUpperCase() + plan.riskLevel.slice(1),
    featured: Math.random() > 0.7
  })).filter((investment) => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || investment.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleInvest = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!investmentAmount || Number.parseFloat(investmentAmount) <= 0) {
      toast.error("Please enter a valid investment amount")
      return
    }

    if (Number.parseFloat(investmentAmount) > balance) {
      toast.error("Insufficient wallet balance")
      return
    }

    // Mock investment transaction
    toast.success(`Successfully invested ${investmentAmount} ETH in ${selectedInvestment?.name}`)
    setSelectedInvestment(null)
    setInvestmentAmount("")
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "crypto":
        return <Coins className="h-5 w-5" />
      case "real-estate":
        return <Building className="h-5 w-5" />
      case "reits":
        return <DollarSign className="h-5 w-5" />
      case "forex":
        return <Globe className="h-5 w-5" />
      default:
        return <TrendingUp className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Investment Opportunities</h1>
            <p className="text-slate-600 dark:text-slate-300">Discover and invest in various asset classes</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
              {isConnected ? `${balance.toFixed(4)} ETH Available` : "Wallet Disconnected"}
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="crypto">Cryptocurrency</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
              <SelectItem value="reits">REITs</SelectItem>
              <SelectItem value="forex">Forex</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Investment Categories */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
          <TabsTrigger value="reits">REITs</TabsTrigger>
          <TabsTrigger value="forex">Forex</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestments.map((investment) => (
              <Card key={investment.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={investment.image || "/placeholder.svg"}
                    alt={investment.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-slate-800">
                    {investment.category.replace("-", " ").toUpperCase()}
                  </Badge>
                  {investment.featured && (
                    <Badge className="absolute top-4 right-4 bg-yellow-100 text-yellow-800">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{investment.name}</CardTitle>
                    {getCategoryIcon(investment.category)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">{investment.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Expected APY</p>
                      <p className="font-semibold text-green-600">{investment.apy}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Min Investment</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{investment.minInvestment} ETH</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Risk Level</p>
                      <Badge
                        variant="outline"
                        className={
                          investment.riskLevel === "Low"
                            ? "text-green-700 border-green-200"
                            : investment.riskLevel === "Medium"
                              ? "text-yellow-700 border-yellow-200"
                              : "text-red-700 border-red-200"
                        }
                      >
                        {investment.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Duration</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{investment.duration}</p>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedInvestment(investment)}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Invest Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Invest in {selectedInvestment?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Expected APY</Label>
                            <p className="font-semibold text-green-600">{selectedInvestment?.apy}%</p>
                          </div>
                          <div>
                            <Label>Risk Level</Label>
                            <p className="font-semibold">{selectedInvestment?.riskLevel}</p>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="amount">Investment Amount (ETH)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            min={selectedInvestment?.minInvestment}
                            step="0.01"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Min: {selectedInvestment?.minInvestment} ETH | Available: {balance.toFixed(4)} ETH
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedInvestment(null)}
                          >
                            Cancel
                          </Button>
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleInvest}>
                            Confirm Investment
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
