"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, DollarSign, Clock, TrendingUp, LogOut, BarChart3, Users, MapPin, Package, History } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Link from "next/link"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }

    // Simulate loading dashboard data
    setTimeout(() => setLoading(false), 1000)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("auth-token")
    router.push("/login")
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
              {/* Added simulation history button */}
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
          {/* Added simulation history quick action */}
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
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$45,231</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">87.5%</div>
              <p className="text-xs text-muted-foreground">+2.3% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">24</div>
              <p className="text-xs text-muted-foreground">12 on-time, 2 delayed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>On-time vs Late Deliveries</CardTitle>
              <CardDescription>Current month performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "On-time", value: 85, fill: "#10b981" },
                      { name: "Late", value: 15, fill: "#ef4444" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: "On-time", value: 85, fill: "#10b981" },
                      { name: "Late", value: 15, fill: "#ef4444" },
                    ].map((entry, index) => (
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
              <CardTitle>Fuel Cost Breakdown</CardTitle>
              <CardDescription>Monthly fuel expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { month: "Jan", cost: 2400 },
                    { month: "Feb", cost: 2100 },
                    { month: "Mar", cost: 2800 },
                    { month: "Apr", cost: 2200 },
                    { month: "May", cost: 2600 },
                    { month: "Jun", cost: 2300 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cost" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
