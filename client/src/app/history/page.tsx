"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, History, Search, Eye, Calendar, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SimulationHistory {
  id: string
  timestamp: string
  numDrivers: number
  startTime: string
  maxHoursPerDay: number
  totalProfit: number
  efficiencyScore: number
  onTimeDeliveries: number
  lateDeliveries: number
  totalFuelCost: number
  averageDeliveryTime: number
  driverUtilization: number
  hourlyPerformance: number
}

export default function SimulationHistoryPage() {
  const [history, setHistory] = useState<SimulationHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<SimulationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRun, setSelectedRun] = useState<SimulationHistory | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load simulation history
    loadHistory()
  }, [router])

  useEffect(() => {
    // Filter history based on search term
    if (!Array.isArray(history)) {
      setFilteredHistory([])
      return
    }

    if (searchTerm) {
      const filtered = history.filter(
        (run) =>
          run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          run.timestamp.includes(searchTerm) ||
          run.numDrivers.toString().includes(searchTerm),
      )
      setFilteredHistory(filtered)
    } else {
      setFilteredHistory(history)
    }
  }, [searchTerm, history])

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/simulation/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load simulation history")
      }

      const data = await response.json()
      
      // Ensure data is an array
      const historyArray = Array.isArray(data) ? data : []
      setHistory(historyArray)
      setFilteredHistory(historyArray)
    } catch (err: any) {
      console.error("History loading error:", err)
      setError(err.message || "Failed to load simulation history")
      // Set empty arrays on error
      setHistory([])
      setFilteredHistory([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
              <History className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Simulation History</h1>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/simulation">Run New Simulation</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Simulation History</h2>
              <p className="text-gray-600">View and analyze past simulation runs and their results</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search simulations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(history) ? history.length : 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Runs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(history) ? history.filter((run) => run.efficiencyScore > 0).length : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(history) && history.length > 0 ? Math.max(...history.map((run) => run.efficiencyScore)) : 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(history) && history.length > 0 ? `$${Math.max(...history.map((run) => run.totalProfit)).toLocaleString()}` : "$0"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Runs</CardTitle>
            <CardDescription>Detailed history of all simulation runs with parameters and results</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Parameters</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Fuel Cost</TableHead>
                  <TableHead>Driver Util.</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-mono text-sm">{run.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(run.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{run.numDrivers} drivers</div>
                        <div className="text-gray-500">
                          {run.startTime}, {run.maxHoursPerDay}h max
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${run.totalProfit.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getEfficiencyColor(run.efficiencyScore)}`}>
                        {run.efficiencyScore}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-green-600">{run.onTimeDeliveries} on-time</div>
                        <div className="text-red-600">{run.lateDeliveries} late</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${run.totalFuelCost.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{run.driverUtilization}%</div>
                        <div className="text-gray-500">{run.hourlyPerformance}/h</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRun(run)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No simulations found matching your search." : "No simulation history available."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed View Modal */}
        {selectedRun && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Simulation Details</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedRun(null)}>
                    Close
                  </Button>
                </div>
                <CardDescription>Run ID: {selectedRun.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Parameters</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Drivers:</span> {selectedRun.numDrivers}
                    </div>
                    <div>
                      <span className="text-gray-500">Start Time:</span> {selectedRun.startTime}
                    </div>
                    <div>
                      <span className="text-gray-500">Max Hours:</span> {selectedRun.maxHoursPerDay}
                    </div>
                    <div>
                      <span className="text-gray-500">Timestamp:</span> {formatDate(selectedRun.timestamp)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Results</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Profit:</span>{" "}
                      <span className="font-medium text-green-600">
                        ${selectedRun.totalProfit.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Efficiency Score:</span>{" "}
                      <span className={`font-medium ${getEfficiencyColor(selectedRun.efficiencyScore)}`}>
                        {selectedRun.efficiencyScore}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">On-time Deliveries:</span>{" "}
                      <span className="font-medium text-green-600">{selectedRun.onTimeDeliveries}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Late Deliveries:</span>{" "}
                      <span className="font-medium text-red-600">{selectedRun.lateDeliveries}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fuel Cost:</span>{" "}
                      <span className="font-medium">${selectedRun.totalFuelCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Delivery Time:</span>{" "}
                      <span className="font-medium">{selectedRun.averageDeliveryTime} min</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Driver Utilization:</span>{" "}
                      <span className="font-medium">{selectedRun.driverUtilization}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hourly Performance:</span>{" "}
                      <span className="font-medium">{selectedRun.hourlyPerformance}/h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
