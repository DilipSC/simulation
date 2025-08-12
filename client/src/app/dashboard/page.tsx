"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, DollarSign, Clock, TrendingUp, LogOut, BarChart3, Users, MapPin, Package, History, AlertCircle, Database } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Link from "next/link"

interface DashboardData {
  totalDrivers: number
  totalRoutes: number
  totalOrders: number
  recentSimulations: Array<{
    totalProfit: number
    efficiencyScore: number
    onTimeDeliveries: number
    lateDeliveries: number
  }>
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalDrivers: 0,
    totalRoutes: 0,
    totalOrders: 0,
    recentSimulations: []
  })
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load dashboard data
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      
      // Load counts
      const [driversResponse, routesResponse, ordersResponse, historyResponse] = await Promise.all([
        fetch("/api/drivers", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/routes", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/simulation/history", { headers: { Authorization: `Bearer ${token}` } })
      ])

      const drivers = await driversResponse.json()
      const routes = await routesResponse.json()
      const orders = await ordersResponse.json()
      const history = await historyResponse.json()

      // Calculate recent simulation averages (last 5 runs)
      const recentSimulations = history.slice(0, 5).map((sim: any) => ({
        totalProfit: sim.totalProfit,
        efficiencyScore: sim.efficiencyScore,
        onTimeDeliveries: sim.onTimeDeliveries,
        lateDeliveries: sim.lateDeliveries
      }))

      setDashboardData({
        totalDrivers: drivers.length,
        totalRoutes: routes.length,
        totalOrders: orders.length,
        recentSimulations
      })
      
      setIsDatabaseConnected(true)
      setError("")
    } catch (err: any) {
      console.error("Dashboard data error:", err)
      setError("Database connection failed. Please check your .env file and database setup.")
      setIsDatabaseConnected(false)
      
      // Set empty data when database connection fails
      setDashboardData({
        totalDrivers: 0,
        totalRoutes: 0,
        totalOrders: 0,
        recentSimulations: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth-token")
    router.push("/login")
  }

  // Calculate averages from recent simulations
  const avgProfit = dashboardData.recentSimulations.length > 0 
    ? dashboardData.recentSimulations.reduce((sum, sim) => sum + sim.totalProfit, 0) / dashboardData.recentSimulations.length
    : 0

  const avgEfficiency = dashboardData.recentSimulations.length > 0
    ? dashboardData.recentSimulations.reduce((sum, sim) => sum + sim.efficiencyScore, 0) / dashboardData.recentSimulations.length
    : 0

  const totalDeliveries = dashboardData.recentSimulations.reduce((sum, sim) => sum + sim.onTimeDeliveries + sim.lateDeliveries, 0)
  const onTimeDeliveries = dashboardData.recentSimulations.reduce((sum, sim) => sum + sim.onTimeDeliveries, 0)
  const lateDeliveries = dashboardData.recentSimulations.reduce((sum, sim) => sum + sim.lateDeliveries, 0)

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
              <Truck className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">GreenCart Logistics</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Link href="/simulation" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Run Simulation
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                <Link href="/history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  View History
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Monitor your delivery operations and key performance indicators</p>
        </div>

        {/* Database Connection Alert */}
        {!isDatabaseConnected && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 text-yellow-800">
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Database Connection Issue:</strong> Unable to load data from database. Please ensure your .env file contains a valid DATABASE_URL and run the database setup commands.
            </AlertDescription>
          </Alert>
        )}

        {error && isDatabaseConnected && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button asChild variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
            <Link href="/drivers" className="flex flex-col items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              <span>Manage Drivers</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
            <Link href="/routes" className="flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              <span>Manage Routes</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
            <Link href="/orders" className="flex flex-col items-center gap-2">
              <Package className="h-6 w-6 text-orange-600" />
              <span>Manage Orders</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-white hover:bg-gray-50">
            <Link href="/history" className="flex flex-col items-center gap-2">
              <History className="h-6 w-6 text-purple-600" />
              <span>View History</span>
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${avgProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {isDatabaseConnected ? "Based on recent simulations" : "No data available"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{avgEfficiency.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {isDatabaseConnected ? "Based on recent simulations" : "No data available"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalDeliveries}</div>
              <p className="text-xs text-muted-foreground">{onTimeDeliveries} on-time, {lateDeliveries} delayed</p>
            </CardContent>
          </Card>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardData.totalDrivers}</div>
              <p className="text-xs text-muted-foreground">
                {isDatabaseConnected ? "Total drivers in system" : "No data available"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Routes</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardData.totalRoutes}</div>
              <p className="text-xs text-muted-foreground">
                {isDatabaseConnected ? "Total routes configured" : "No data available"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardData.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {isDatabaseConnected ? "Total orders in system" : "No data available"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>On-time vs Late Deliveries</CardTitle>
              <CardDescription>
                {isDatabaseConnected ? "Recent simulation performance" : "No data available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalDeliveries > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "On-time", value: onTimeDeliveries, fill: "#10b981" },
                        { name: "Late", value: lateDeliveries, fill: "#ef4444" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "On-time", value: onTimeDeliveries, fill: "#10b981" },
                        { name: "Late", value: lateDeliveries, fill: "#ef4444" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No simulation data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
              <CardDescription>
                {isDatabaseConnected ? "Recent simulation profits" : "No data available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentSimulations.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dashboardData.recentSimulations.map((sim, index) => ({
                      run: `Run ${index + 1}`,
                      profit: sim.totalProfit,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="run" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Profit']} />
                    <Bar dataKey="profit" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No simulation data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        {!isDatabaseConnected && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Setup Required
              </CardTitle>
              <CardDescription>
                To see real data, you need to set up your database connection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Create .env file</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Create a file named <code className="bg-gray-100 px-1 rounded">.env</code> in the client directory with:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
CORS_ORIGIN="http://localhost:3000"`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Run database setup</h4>
                  <div className="space-y-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run db:generate</code>
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run db:push</code>
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run db:seed</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Restart the application</h4>
                  <p className="text-sm text-gray-600">
                    After setting up the database, restart your development server to see real data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
