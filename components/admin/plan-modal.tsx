"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  plan?: any
}

export function PlanModal({ isOpen, onClose, plan }: PlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tier: "",
    price: "",
    priceUSD: "",
    apy: "",
    minAPY: 0,
    maxAPY: 0,
    minInvestment: 0,
    maxInvestment: 0,
    duration: 0,
    riskLevel: "",
    features: [] as string[],
    popular: false,
    isActive: true,
  })
  const [newFeature, setNewFeature] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mutations
  const createPlan = useMutation(api.investmentPlans.createPlan)
  const updatePlan = useMutation(api.investmentPlans.updatePlan)

  // Initialize form data when plan changes
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        description: plan.description || "",
        category: plan.category || "",
        tier: plan.tier || "",
        price: plan.price || "",
        priceUSD: plan.priceUSD || "",
        apy: plan.apy || "",
        minAPY: plan.minAPY || 0,
        maxAPY: plan.maxAPY || 0,
        minInvestment: plan.minInvestment || 0,
        maxInvestment: plan.maxInvestment || 0,
        duration: plan.duration || 0,
        riskLevel: plan.riskLevel || "",
        features: plan.features || [],
        popular: plan.popular || false,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      })
    } else {
      // Reset form for new plan
      setFormData({
        name: "",
        description: "",
        category: "",
        tier: "",
        price: "",
        priceUSD: "",
        apy: "",
        minAPY: 0,
        maxAPY: 0,
        minInvestment: 0,
        maxInvestment: 0,
        duration: 0,
        riskLevel: "",
        features: [],
        popular: false,
        isActive: true,
      })
    }
  }, [plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.description || !formData.category || !formData.tier) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.minInvestment >= formData.maxInvestment) {
      toast.error("Minimum investment must be less than maximum investment")
      return
    }

    if (formData.minAPY >= formData.maxAPY) {
      toast.error("Minimum APY must be less than maximum APY")
      return
    }

    setIsSubmitting(true)
    try {
      if (plan) {
        // Update existing plan
        await updatePlan({
          planId: plan._id,
          ...formData,
        })
        toast.success("Plan updated successfully!")
      } else {
        // Create new plan
        await createPlan(formData)
        toast.success("Plan created successfully!")
      }
      onClose()
    } catch (error) {
      toast.error(plan ? "Failed to update plan" : "Failed to create plan")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      })
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const categories = [
    { value: "crypto", label: "Crypto" },
    { value: "real-estate", label: "Real Estate" },
    { value: "reits", label: "REITs" },
    { value: "forex", label: "Forex" },
    { value: "retirement", label: "Retirement" },
    { value: "children", label: "Children" },
  ]

  const tiers = [
    { value: "starter", label: "Starter" },
    { value: "professional", label: "Professional" },
    { value: "enterprise", label: "Enterprise" },
  ]

  const riskLevels = [
    { value: "low", label: "Low" },
    { value: "low-medium", label: "Low-Medium" },
    { value: "medium", label: "Medium" },
    { value: "medium-high", label: "Medium-High" },
    { value: "high", label: "High" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {plan ? "Edit Investment Plan" : "Create New Investment Plan"}
          </DialogTitle>
          <DialogDescription>
            {plan ? "Update the investment plan details below." : "Fill in the details to create a new investment plan."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Crypto Starter Plan"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the investment plan..."
              rows={3}
              required
            />
          </div>

          {/* Pricing and Investment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tier">Tier *</Label>
              <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price (Crypto)</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 0.1 ETH"
              />
            </div>
            <div>
              <Label htmlFor="priceUSD">Price (USD)</Label>
              <Input
                id="priceUSD"
                value={formData.priceUSD}
                onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                placeholder="e.g., $170"
              />
            </div>
          </div>

          {/* APY and Investment Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="apy">APY Range</Label>
              <Input
                id="apy"
                value={formData.apy}
                onChange={(e) => setFormData({ ...formData, apy: e.target.value })}
                placeholder="e.g., 12-18%"
              />
            </div>
            <div>
              <Label htmlFor="minAPY">Minimum APY (%)</Label>
              <Input
                id="minAPY"
                type="number"
                value={formData.minAPY}
                onChange={(e) => setFormData({ ...formData, minAPY: parseFloat(e.target.value) || 0 })}
                placeholder="12"
              />
            </div>
            <div>
              <Label htmlFor="maxAPY">Maximum APY (%)</Label>
              <Input
                id="maxAPY"
                type="number"
                value={formData.maxAPY}
                onChange={(e) => setFormData({ ...formData, maxAPY: parseFloat(e.target.value) || 0 })}
                placeholder="18"
              />
            </div>
          </div>

          {/* Investment Limits and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minInvestment">Minimum Investment ($)</Label>
              <Input
                id="minInvestment"
                type="number"
                value={formData.minInvestment}
                onChange={(e) => setFormData({ ...formData, minInvestment: parseFloat(e.target.value) || 0 })}
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="maxInvestment">Maximum Investment ($)</Label>
              <Input
                id="maxInvestment"
                type="number"
                value={formData.maxInvestment}
                onChange={(e) => setFormData({ ...formData, maxInvestment: parseFloat(e.target.value) || 0 })}
                placeholder="10000"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                placeholder="30"
              />
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select value={formData.riskLevel} onValueChange={(value) => setFormData({ ...formData, riskLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map((risk) => (
                  <SelectItem key={risk.value} value={risk.value}>
                    {risk.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <Button type="button" onClick={handleAddFeature} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="popular"
                checked={formData.popular}
                onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
              />
              <Label htmlFor="popular">Popular Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {plan ? "Updating..." : "Creating..."}
                </>
              ) : (
                plan ? "Update Plan" : "Create Plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

