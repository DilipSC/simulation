"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, Play, BarChart3, Clock, DollarSign, TrendingUp, ArrowLeft, History } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from "next/link"

interface SimulationResult {
  totalProfit: number
  efficiencyScore: number
  onTimeDeliveries: number
  lateDeliveries: number
  totalFuelCost: number
  averageDeliveryTime: number
  driverUtilization: Array<{ driver: string; utilization: number }>
  hourlyPerformance: Array<{ hour: string; deliveries: number; efficiency: number }>
}

export default function SimulationPage() {
  const [loading, setLoading] = useState(false)
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<SimulationResult | null>(null)
  const router = useRouter()

  // Form state
  const [numDrivers, setNumDrivers] = useState(5)
  const [startTime, setStartTime] = useState("08:00")
  const [maxHours, setMaxHours] = useState(8)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }
  }, [router])

  const runSimulation = async () => {
    setSimulationRunning(true)
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/simulation/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          numDrivers,
          startTime,
          maxHours,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to run simulation")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
      setSimulationRunning(false)
    }
  }

  const deliveryStatusData = result
    ? [
        { name: "On-time", value: result.onTimeDeliveries, fill: "#10b981" },
        { name: "Late", value: result.lateDeliveries, fill: "#ef4444" },
      ]
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </Link>
              <Truck className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Delivery Simulation</h1>
            </div>
            <Button asChild variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              <Link href="/history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                View History
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Run Delivery Simulation</h2>
          <p className="text-gray-600">Configure simulation parameters and analyze delivery performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Simulation Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Simulation Parameters
                </CardTitle>
                <CardDescription>Set the parameters for your delivery simulation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="numDrivers">Number of Drivers</Label>
                  <Input
                    id="numDrivers"
                    type="number"
                    min="1"
                    max="20"
                    value={numDrivers}
                    onChange={(e) => setNumDrivers(Number.parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxHours">Max Hours per Driver/Day</Label>
                  <Input
                    id="maxHours"
                    type="number"
                    min="4"
                    max="12"
                    value={maxHours}
                    onChange={(e) => setMaxHours(Number.parseInt(e.target.value) || 8)}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={runSimulation}
                  disabled={simulationRunning}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {simulationRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading && (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing simulation...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && !loading && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">${result.totalProfit.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{result.efficiencyScore}%</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{result.averageDeliveryTime} min</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Status</CardTitle>
                      <CardDescription>On-time vs Late deliveries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={deliveryStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {deliveryStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Driver Utilization</CardTitle>
                      <CardDescription>Efficiency by driver</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={result.driverUtilization}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="driver" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="utilization" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Performance</CardTitle>
                    <CardDescription>Deliveries and efficiency throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={result.hourlyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="deliveries" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {!result && !loading && (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Configure parameters and run simulation to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
