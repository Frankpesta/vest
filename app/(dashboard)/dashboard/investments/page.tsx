"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { TrendingUp, Search, Filter, Star, Coins, Building, DollarSign, Globe, Loader2 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"
import { InvestmentModal } from "@/components/investment/investment-modal"
import { toast } from "sonner"

export default function InvestmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false)
  const { connection } = useWalletStore()

  // Convex queries
  const investmentPlans = useQuery(api.investmentPlans.getActivePlans)
  const userInvestments = useQuery(api.investments.getUserInvestments)

  const isConnected = connection?.isConnected || false
  const balance = connection?.balance || 0

  const filteredInvestments = investmentPlans?.filter((investment) => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || investment.category === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  const handleInvestClick = (plan: any) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    setSelectedInvestment(plan)
    setIsInvestmentModalOpen(true)
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
          {investmentPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvestments.map((investment) => (
                <Card key={investment._id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{investment.name}</CardTitle>
                      {getCategoryIcon(investment.category)}
                    </div>
                    <Badge className="w-fit bg-white/90 text-slate-800">
                      {investment.category.replace("-", " ").toUpperCase()}
                    </Badge>
                    {investment.popular && (
                      <Badge className="w-fit bg-yellow-100 text-yellow-800">
                        <Star className="mr-1 h-3 w-3" />
                        Popular
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">{investment.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Expected APY</p>
                        <p className="font-semibold text-green-600">{investment.apy}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Min Investment</p>
                        <p className="font-semibold text-slate-900 dark:text-white">${investment.minInvestment}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Risk Level</p>
                        <Badge
                          variant="outline"
                          className={
                            investment.riskLevel === "low"
                              ? "text-green-700 border-green-200"
                              : investment.riskLevel === "medium"
                                ? "text-yellow-700 border-yellow-200"
                                : "text-red-700 border-red-200"
                          }
                        >
                          {investment.riskLevel.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Duration</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{investment.duration} days</p>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleInvestClick(investment)}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Invest Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-600 dark:text-slate-300">Loading investment plans...</span>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Investment Modal */}
      {selectedInvestment && (
        <InvestmentModal
          isOpen={isInvestmentModalOpen}
          onClose={() => {
            setIsInvestmentModalOpen(false)
            setSelectedInvestment(null)
          }}
          plan={selectedInvestment}
        />
      )}
    </div>
  )
}
