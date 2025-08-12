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
import { MapPin, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Route {
  id: string
  name: string
  startLocation: string
  endLocation: string
  distance: number
  estimatedTime: number
  fuelCost: number
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    startLocation: "",
    endLocation: "",
    distance: 0,
    estimatedTime: 0,
    fuelCost: 0,
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
      return
    }

    // Load routes data
    loadRoutes()
  }, [router])

  const loadRoutes = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/routes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load routes")
      }

      const data = await response.json()
      setRoutes(data)
    } catch (err: any) {
      setError(err.message || "Failed to load routes")
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
      const url = editingRoute ? `/api/routes/${editingRoute.id}` : "/api/routes"
      const method = editingRoute ? "PUT" : "POST"

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
        throw new Error(errorData.error || "Failed to save route")
      }

      const savedRoute = await response.json()
      
      if (editingRoute) {
        setRoutes(routes.map((r) => (r.id === editingRoute.id ? savedRoute : r)))
        setSuccess("Route updated successfully!")
      } else {
        setRoutes([...routes, savedRoute])
        setSuccess("Route added successfully!")
      }

      // Reset form
      setFormData({
        name: "",
        startLocation: "",
        endLocation: "",
        distance: 0,
        estimatedTime: 0,
        fuelCost: 0,
      })
      setEditingRoute(null)
      setIsDialogOpen(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save route")
    }
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    setFormData({
      name: route.name,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      distance: route.distance,
      estimatedTime: route.estimatedTime,
      fuelCost: route.fuelCost,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this route?")) {
      try {
        const token = localStorage.getItem("auth-token")
        const response = await fetch(`/api/routes/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete route")
        }

        setRoutes(routes.filter((r) => r.id !== id))
        setSuccess("Route deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } catch (err: any) {
        setError(err.message || "Failed to delete route")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      startLocation: "",
      endLocation: "",
      distance: 0,
      estimatedTime: 0,
      fuelCost: 0,
    })
    setEditingRoute(null)
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
              <MapPin className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Route Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Routes</h2>
              <p className="text-gray-600">Manage delivery routes and their configurations</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Route
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingRoute ? "Edit Route" : "Add New Route"}</DialogTitle>
                  <DialogDescription>
                    {editingRoute ? "Update route information" : "Enter the details for the new route"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Route Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startLocation">Start Location</Label>
                      <Input
                        id="startLocation"
                        value={formData.startLocation}
                        onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endLocation">End Location</Label>
                      <Input
                        id="endLocation"
                        value={formData.endLocation}
                        onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="distance">Distance (km)</Label>
                        <Input
                          id="distance"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.distance}
                          onChange={(e) => setFormData({ ...formData, distance: Number.parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedTime">Est. Time (min)</Label>
                        <Input
                          id="estimatedTime"
                          type="number"
                          min="0"
                          value={formData.estimatedTime}
                          onChange={(e) =>
                            setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) || 0 })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuelCost">Fuel Cost ($)</Label>
                        <Input
                          id="fuelCost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.fuelCost}
                          onChange={(e) =>
                            setFormData({ ...formData, fuelCost: Number.parseFloat(e.target.value) || 0 })
                          }
                          required
                        />
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
                      {editingRoute ? "Update Route" : "Add Route"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Routes</CardTitle>
            <CardDescription>A list of all delivery routes in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Start Location</TableHead>
                  <TableHead>End Location</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Fuel Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>{route.startLocation}</TableCell>
                    <TableCell>{route.endLocation}</TableCell>
                    <TableCell>{route.distance} km</TableCell>
                    <TableCell>{route.estimatedTime} min</TableCell>
                    <TableCell>${route.fuelCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(route)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(route.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {routes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No routes found. Add your first route to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
