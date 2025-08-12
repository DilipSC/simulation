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
import { Plus, Edit, Trash2, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  licenseNumber: string
  vehicleType: string
  maxHoursPerDay: number
  hourlyRate: number
  isActive: boolean
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    vehicleType: "",
    maxHoursPerDay: 8,
    hourlyRate: 25,
    isActive: true,
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load drivers data
    loadDrivers()
  }, [router])

  const loadDrivers = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/drivers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load drivers")
      }

      const data = await response.json()
      setDrivers(data)
    } catch (err: any) {
      setError(err.message || "Failed to load drivers")
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
      const url = editingDriver ? `/api/drivers/${editingDriver.id}` : "/api/drivers"
      const method = editingDriver ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save driver")
      }

      const savedDriver = await response.json()
      
      if (editingDriver) {
        setDrivers(drivers.map((d) => (d.id === editingDriver.id ? savedDriver : d)))
        setSuccess("Driver updated successfully!")
      } else {
        setDrivers([...drivers, savedDriver])
        setSuccess("Driver added successfully!")
      }

      // Reset form
      setFormData({ name: "", email: "", phone: "", licenseNumber: "", vehicleType: "", maxHoursPerDay: 8, hourlyRate: 25, isActive: true })
      setEditingDriver(null)
      setIsDialogOpen(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save driver")
    }
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      vehicleType: driver.vehicleType,
      maxHoursPerDay: driver.maxHoursPerDay,
      hourlyRate: driver.hourlyRate,
      isActive: driver.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      try {
        const token = localStorage.getItem("auth-token")
        const response = await fetch(`/api/drivers/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete driver")
        }

        setDrivers(drivers.filter((d) => d.id !== id))
        setSuccess("Driver deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } catch (err: any) {
        setError(err.message || "Failed to delete driver")
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", licenseNumber: "", vehicleType: "", maxHoursPerDay: 8, hourlyRate: 25, isActive: true })
    setEditingDriver(null)
    setError("")
    setSuccess("")
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
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Driver Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Drivers</h2>
              <p className="text-gray-600">Manage your delivery drivers and their information</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                  <DialogDescription>
                    {editingDriver ? "Update driver information" : "Enter the details for the new driver"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <Input
                        id="vehicleType"
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        placeholder="e.g., Van, Truck, Car"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxHoursPerDay">Max Hours/Day</Label>
                        <Input
                          id="maxHoursPerDay"
                          type="number"
                          min="1"
                          max="24"
                          value={formData.maxHoursPerDay}
                          onChange={(e) => setFormData({ ...formData, maxHoursPerDay: Number.parseInt(e.target.value) || 8 })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: Number.parseFloat(e.target.value) || 25 })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isActive">Status</Label>
                      <select
                        id="isActive"
                        value={formData.isActive.toString()}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
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
                      {editingDriver ? "Update Driver" : "Add Driver"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Drivers</CardTitle>
            <CardDescription>A list of all drivers in your fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Max Hours</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.phone}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>{driver.vehicleType}</TableCell>
                    <TableCell>{driver.maxHoursPerDay}h</TableCell>
                    <TableCell>${driver.hourlyRate}/h</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(driver)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(driver.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {drivers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No drivers found. Add your first driver to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
