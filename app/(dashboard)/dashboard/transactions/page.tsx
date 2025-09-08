"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, ArrowUpRight, ArrowDownLeft, TrendingUp, Calendar, ExternalLink, Eye, Loader2 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Fetch transactions from backend
  const transactions = useQuery(api.transactions.getUserTransactions, { limit: 100 })
  const withdrawalRequests = useQuery(api.withdrawalRequests.getUserWithdrawalRequests, {})

  // Combine transactions and withdrawal requests
  const allTransactions = [
    ...(transactions || []).map(tx => ({
      ...tx,
      id: tx._id,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      date: new Date(tx.createdAt).toISOString(),
      txHash: tx.txHash,
      description: tx.type === "deposit" ? "Deposit" : 
                   tx.type === "withdrawal" ? "Withdrawal" :
                   tx.type === "investment" ? "Investment" :
                   tx.type === "return" ? "Investment Return" : tx.type,
    })),
    ...(withdrawalRequests || []).map(req => ({
      ...req,
      id: req._id,
      type: "withdrawal",
      amount: req.amount,
      currency: req.currency,
      status: req.status,
      date: new Date(req.createdAt).toISOString(),
      txHash: req.transactionHash,
      description: `Withdrawal from ${req.balanceType} balance`,
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTransactions = allTransactions.filter((transaction) => {
    const description = transaction.description || transaction.type
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || transaction.type === selectedType
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "investment":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      default:
        return <TrendingUp className="h-4 w-4 text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Approved</Badge>
      case "processing":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Processing</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const exportTransactions = () => {
    // CSV export functionality
    const csvContent = [
      ["Date", "Type", "Description", "Amount", "Status"],
      ...filteredTransactions.map((tx) => [tx.date, tx.type, (tx as any).planName || tx.type, tx.amount, tx.status]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Transaction History</h1>
            <p className="text-slate-600 dark:text-slate-300">View and manage all your investment transactions</p>
          </div>
          <Button onClick={exportTransactions} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="investment">Investments</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">
                  ${allTransactions
                    .filter(tx => tx.type === "deposit" && tx.status === "completed")
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">
                  ${allTransactions
                    .filter(tx => tx.type === "withdrawal" && (tx.status === "completed" || tx.status === "processing"))
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Investments</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${allTransactions
                    .filter(tx => tx.type === "investment" && tx.status === "completed")
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Net Position</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${(allTransactions
                    .filter(tx => tx.type === "deposit" && tx.status === "completed")
                    .reduce((sum, tx) => sum + tx.amount, 0) -
                    allTransactions
                      .filter(tx => tx.type === "withdrawal" && (tx.status === "completed" || tx.status === "processing"))
                      .reduce((sum, tx) => sum + tx.amount, 0))
                    .toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {!transactions && !withdrawalRequests ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-600 dark:text-slate-300">Loading transactions...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-slate-500 dark:text-slate-400">
                            No transactions found
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{(transaction as any).planName || transaction.type}</p>
                          {(transaction as any).hash && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{(transaction as any).hash}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            transaction.type === "deposit"
                              ? "text-green-600"
                              : transaction.type === "withdrawal"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        >
                          {transaction.type === "withdrawal" ? "-" : "+"}${transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(transaction as any).hash && (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
