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
  customerName: string
  customerAddress: string
  customerPhone: string
  items: string
  totalValue: number
  priority: "low" | "medium" | "high"
  status: "pending" | "assigned" | "in-transit" | "delivered" | "cancelled"
  orderDate: string
  deliveryDate?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    items: "",
    totalValue: 0,
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as "pending" | "assigned" | "in-transit" | "delivered" | "cancelled",
    deliveryDate: "",
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load orders data
    loadOrders()
  }, [router])

  const loadOrders = async () => {
    try {
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: "1",
          customerName: "Alice Johnson",
          customerAddress: "123 Main St, Downtown",
          customerPhone: "+1-555-0201",
          items: "Groceries, Electronics",
          totalValue: 245.99,
          priority: "high",
          status: "in-transit",
          orderDate: "2024-01-15",
          deliveryDate: "2024-01-16",
        },
        {
          id: "2",
          customerName: "Bob Smith",
          customerAddress: "456 Oak Ave, Suburbs",
          customerPhone: "+1-555-0202",
          items: "Clothing, Books",
          totalValue: 89.5,
          priority: "medium",
          status: "assigned",
          orderDate: "2024-01-15",
          deliveryDate: "2024-01-17",
        },
        {
          id: "3",
          customerName: "Carol Davis",
          customerAddress: "789 Pine Rd, Uptown",
          customerPhone: "+1-555-0203",
          items: "Home Appliances",
          totalValue: 599.99,
          priority: "low",
          status: "pending",
          orderDate: "2024-01-14",
        },
      ]
      setOrders(mockOrders)
    } catch (err) {
      setError("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (editingOrder) {
        // Update existing order
        const updatedOrder = {
          ...editingOrder,
          ...formData,
          orderDate: editingOrder.orderDate,
        }
        setOrders(orders.map((o) => (o.id === editingOrder.id ? updatedOrder : o)))
      } else {
        // Create new order
        const newOrder: Order = {
          id: Date.now().toString(),
          ...formData,
          orderDate: new Date().toISOString().split("T")[0],
        }
        setOrders([...orders, newOrder])
      }

      // Reset form
      setFormData({
        customerName: "",
        customerAddress: "",
        customerPhone: "",
        items: "",
        totalValue: 0,
        priority: "medium",
        status: "pending",
        deliveryDate: "",
      })
      setEditingOrder(null)
      setIsDialogOpen(false)
    } catch (err) {
      setError("Failed to save order")
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      customerPhone: order.customerPhone,
      items: order.items,
      totalValue: order.totalValue,
      priority: order.priority,
      status: order.status,
      deliveryDate: order.deliveryDate || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter((o) => o.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerAddress: "",
      customerPhone: "",
      items: "",
      totalValue: 0,
      priority: "medium",
      status: "pending",
      deliveryDate: "",
    })
    setEditingOrder(null)
    setError("")
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
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingOrder ? "Edit Order" : "Add New Order"}</DialogTitle>
                  <DialogDescription>
                    {editingOrder ? "Update order information" : "Enter the details for the new order"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
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
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="items">Items</Label>
                      <Input
                        id="items"
                        value={formData.items}
                        onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                        placeholder="e.g., Groceries, Electronics"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalValue">Total Value ($)</Label>
                      <Input
                        id="totalValue"
                        type="number"
                        step="0.01"
                        value={formData.totalValue}
                        onChange={(e) =>
                          setFormData({ ...formData, totalValue: Number.parseFloat(e.target.value) || 0 })
                        }
                        required
                      />
                    </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">Delivery Date</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      />
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.customerAddress}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.totalValue.toFixed(2)}</TableCell>
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
                    <TableCell>{order.orderDate}</TableCell>
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
