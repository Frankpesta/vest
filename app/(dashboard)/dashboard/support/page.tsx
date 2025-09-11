"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  Download,
  Send,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"

const faqCategories = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        question: "How do I create an account?",
        answer: "To create an account, click the 'Sign Up' button on our homepage, fill in your details, verify your email, and connect your crypto wallet. The process takes just a few minutes."
      },
      {
        question: "What cryptocurrencies do you support?",
        answer: "We support Bitcoin (BTC), Ethereum (ETH), USD Coin (USDC), and Binance Coin (BNB). More cryptocurrencies will be added based on user demand."
      },
      {
        question: "Is there a minimum investment amount?",
        answer: "Yes, minimum investment amounts vary by plan. Most plans start from 0.01 ETH or equivalent. Check individual investment plans for specific requirements."
      },
      {
        question: "How secure is my investment?",
        answer: "We use industry-standard security measures including cold storage, multi-signature wallets, and regular security audits. Your funds are protected by advanced encryption and insurance coverage."
      }
    ]
  },
  {
    category: "Investments",
    icon: FileText,
    questions: [
      {
        question: "How do I invest in a plan?",
        answer: "Browse available investment plans, select one that matches your risk tolerance, enter your investment amount, and confirm the transaction using your connected wallet."
      },
      {
        question: "When will I see returns?",
        answer: "Returns are calculated daily and displayed in your portfolio. Actual payouts depend on the specific plan terms - some pay daily, weekly, or monthly."
      },
      {
        question: "Can I withdraw my investment early?",
        answer: "Early withdrawal policies vary by plan. Some plans allow early withdrawal with a penalty, while others have lock-up periods. Check plan details before investing."
      },
      {
        question: "What happens if an investment fails?",
        answer: "We have risk management protocols in place. In rare cases of failure, we have insurance coverage and will work to recover funds. Contact support for specific cases."
      }
    ]
  },
  {
    category: "Transactions",
    icon: MessageCircle,
    questions: [
      {
        question: "How long do deposits take?",
        answer: "Deposits typically take 3-15 network confirmations, which usually takes 10-30 minutes for most cryptocurrencies. Bitcoin may take longer due to network congestion."
      },
      {
        question: "Why is my withdrawal pending?",
        answer: "Withdrawals are processed within 24 hours for security reasons. Large amounts may require additional verification. You'll receive email updates on the status."
      },
      {
        question: "What are the withdrawal fees?",
        answer: "Withdrawal fees are based on network costs and vary by cryptocurrency. ETH withdrawals typically cost 0.001-0.005 ETH, while Bitcoin fees depend on network congestion."
      },
      {
        question: "Can I cancel a transaction?",
        answer: "Once a transaction is submitted to the blockchain, it cannot be cancelled. However, you can contact support if you sent funds to the wrong address."
      }
    ]
  },
  {
    category: "Account & Security",
    icon: AlertCircle,
    questions: [
      {
        question: "How do I change my password?",
        answer: "Go to Settings > Security > Change Password. Enter your current password and new password. We recommend using a strong, unique password."
      },
      {
        question: "What is two-factor authentication?",
        answer: "2FA adds an extra security layer by requiring a second verification step (usually via SMS or authenticator app) when logging in or making transactions."
      },
      {
        question: "I forgot my password. What should I do?",
        answer: "Click 'Forgot Password' on the login page, enter your email, and follow the reset instructions. If you have 2FA enabled, you'll need access to your 2FA device."
      },
      {
        question: "How do I update my personal information?",
        answer: "Go to Profile > Personal Information and update your details. Some changes may require verification. Contact support if you need help with verification."
      }
    ]
  }
]

// Remove mock data - will use real data from backend

const helpResources = [
  {
    title: "User Guide",
    description: "Complete guide to using our platform",
    type: "Documentation",
    icon: BookOpen,
    url: "#",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    type: "Video",
    icon: Video,
    url: "#",
  },
  {
    title: "API Documentation",
    description: "Developer resources and API docs",
    type: "Technical",
    icon: FileText,
    url: "#",
  },
  {
    title: "Security Best Practices",
    description: "How to keep your account secure",
    type: "Security",
    icon: AlertCircle,
    url: "#",
  },
]

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "normal",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch support tickets from backend
  const supportTickets = useQuery(api.supportTickets.getUserSupportTickets, {})
  
  // Mutations
  const createTicket = useMutation(api.supportTickets.createSupportTicket)

  const filteredFAQs = faqCategories.flatMap(category => 
    category.questions.filter(question => 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createTicket({
        subject: ticketForm.subject,
        category: ticketForm.category as any,
        priority: ticketForm.priority as any,
        description: ticketForm.description,
      })
      
      toast.success(`Support ticket #${result.ticketNumber} submitted successfully!`)
      setTicketForm({ subject: "", category: "", priority: "medium", description: "" })
    } catch (error) {
      toast.error("Failed to submit support ticket")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Open</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">In Progress</Badge>
      case "waiting_for_user":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Waiting for User</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Urgent</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Support Center</h1>
            <p className="text-slate-600 dark:text-slate-300">Get help with your investments and account</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" />
              Support Online
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Live Chat</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Chat with our support team in real-time
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Send us an email and we'll respond within 24 hours
            </p>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Phone Support</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Call us for urgent matters
            </p>
            <Button variant="outline" className="w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {searchTerm ? (
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Search Results ({filteredFAQs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <div key={index} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">{faq.question}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {faqCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <category.icon className="mr-2 h-5 w-5" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <MessageCircle className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              {supportTickets === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-600 dark:text-slate-300">Loading tickets...</span>
                </div>
              ) : supportTickets && supportTickets.length > 0 ? (
                <div className="space-y-0">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{ticket.subject}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            #{ticket.ticketNumber} • {ticket.category} • {formatTimestamp(ticket.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300">No support tickets yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Create your first support ticket to get help</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="transaction">Transaction</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpResources.map((resource, index) => (
              <Card key={index} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <resource.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{resource.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{resource.type}</Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
