"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerAddress: string
  orderValue: number
  priority: "low" | "medium" | "high"
  status: "pending" | "assigned" | "in-transit" | "delivered" | "cancelled"
  driverId?: string
  routeId?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerName: "",
    customerAddress: "",
    orderValue: 0,
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as "pending" | "assigned" | "in-transit" | "delivered" | "cancelled",
    driverId: "",
    routeId: "",
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load data
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      
      // Load orders
      const ordersResponse = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!ordersResponse.ok) {
        const errorData = await ordersResponse.json()
        throw new Error(errorData.error || "Failed to load orders")
      }
      const ordersData = await ordersResponse.json()
      setOrders(ordersData)

      // Load drivers for dropdown
      const driversResponse = await fetch("/api/drivers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (driversResponse.ok) {
        const driversData = await driversResponse.json()
        setDrivers(driversData)
      }

      // Load routes for dropdown
      const routesResponse = await fetch("/api/routes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (routesResponse.ok) {
        const routesData = await routesResponse.json()
        setRoutes(routesData)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("auth-token")
      const url = editingOrder ? `/api/orders/${editingOrder.id}` : "/api/orders"
      const method = editingOrder ? "PUT" : "POST"

      // Prepare data for API
      const orderData = {
        ...formData,
        driverId: formData.driverId || null,
        routeId: formData.routeId || null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save order")
      }

      const savedOrder = await response.json()
      
      if (editingOrder) {
        setOrders(orders.map((o) => (o.id === editingOrder.id ? savedOrder : o)))
        setSuccess("Order updated successfully!")
      } else {
        setOrders([...orders, savedOrder])
        setSuccess("Order added successfully!")
      }

      // Reset form
      setFormData({
        orderNumber: "",
        customerName: "",
        customerAddress: "",
        orderValue: 0,
        priority: "medium",
        status: "pending",
        driverId: "",
        routeId: "",
      })
      setEditingOrder(null)
      setIsDialogOpen(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save order")
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      orderValue: order.orderValue,
      priority: order.priority,
      status: order.status,
      driverId: order.driverId || "",
      routeId: order.routeId || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const token = localStorage.getItem("auth-token")
        const response = await fetch(`/api/orders/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete order")
        }

        setOrders(orders.filter((o) => o.id !== id))
        setSuccess("Order deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } catch (err: any) {
        setError(err.message || "Failed to delete order")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      orderNumber: "",
      customerName: "",
      customerAddress: "",
      orderValue: 0,
      priority: "medium",
      status: "pending",
      driverId: "",
      routeId: "",
    })
    setEditingOrder(null)
    setError("")
    setSuccess("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "in-transit":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
              <Package className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Order Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders</h2>
              <p className="text-gray-600">Manage customer orders and delivery assignments</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingOrder ? "Edit Order" : "Add New Order"}</DialogTitle>
                  <DialogDescription>
                    {editingOrder ? "Update order information" : "Enter the details for the new order"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orderNumber">Order Number</Label>
                        <Input
                          id="orderNumber"
                          value={formData.orderNumber}
                          onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderValue">Order Value ($)</Label>
                        <Input
                          id="orderValue"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.orderValue}
                          onChange={(e) =>
                            setFormData({ ...formData, orderValue: Number.parseFloat(e.target.value) || 0 })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Customer Address</Label>
                      <Input
                        id="customerAddress"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <select
                          id="priority"
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="driverId">Assign Driver (Optional)</Label>
                        <select
                          id="driverId"
                          value={formData.driverId}
                          onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">No driver assigned</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} ({driver.vehicleType})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="routeId">Assign Route (Optional)</Label>
                        <select
                          id="routeId"
                          value={formData.routeId}
                          onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">No route assigned</option>
                          {routes.map((route) => (
                            <option key={route.id} value={route.id}>
                              {route.name} ({route.startLocation} → {route.endLocation})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      {editingOrder ? "Update Order" : "Add Order"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>A list of all customer orders in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.customerAddress}</TableCell>
                    <TableCell>${order.orderValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}
                      >
                        {order.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.driverId ? (
                        drivers.find(d => d.id === order.driverId)?.name || "Unknown"
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.routeId ? (
                        routes.find(r => r.id === order.routeId)?.name || "Unknown"
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(order)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found. Add your first order to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
