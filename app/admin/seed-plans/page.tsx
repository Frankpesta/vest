"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Loader2, CheckCircle } from "lucide-react"

export default function SeedPlansPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)
  
  const seedPlans = useMutation(api.investmentPlans.seedPlans)

  const handleSeedPlans = async () => {
    setIsSeeding(true)
    try {
      const result = await seedPlans({})
      toast.success(`Successfully seeded ${result.insertedCount} investment plans!`)
      setSeeded(true)
    } catch (error) {
      console.error("Error seeding plans:", error)
      toast.error("Failed to seed investment plans")
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Seed Investment Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
            This will populate the investment plans table with sample data for all categories.
          </p>
          
          <Button
            onClick={handleSeedPlans}
            disabled={isSeeding || seeded}
            className="w-full"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Plans...
              </>
            ) : seeded ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Plans Seeded
              </>
            ) : (
              "Seed Investment Plans"
            )}
          </Button>
          
          {seeded && (
            <p className="text-sm text-green-600 text-center">
              Investment plans have been successfully seeded! You can now view them in the dashboard.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
