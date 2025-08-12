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
  difficulty: "easy" | "medium" | "hard"
  status: "active" | "inactive"
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    startLocation: "",
    endLocation: "",
    distance: 0,
    estimatedTime: 0,
    difficulty: "medium" as "easy" | "medium" | "hard",
    status: "active" as "active" | "inactive",
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
      // Mock data - replace with actual API call
      const mockRoutes: Route[] = [
        {
          id: "1",
          name: "Downtown Express",
          startLocation: "Warehouse A",
          endLocation: "Downtown District",
          distance: 15.2,
          estimatedTime: 45,
          difficulty: "medium",
          status: "active",
        },
        {
          id: "2",
          name: "Suburban Loop",
          startLocation: "Warehouse B",
          endLocation: "Suburban Area",
          distance: 28.7,
          estimatedTime: 75,
          difficulty: "easy",
          status: "active",
        },
        {
          id: "3",
          name: "Mountain Route",
          startLocation: "Warehouse A",
          endLocation: "Mountain View",
          distance: 42.1,
          estimatedTime: 120,
          difficulty: "hard",
          status: "inactive",
        },
      ]
      setRoutes(mockRoutes)
    } catch (err) {
      setError("Failed to load routes")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (editingRoute) {
        // Update existing route
        const updatedRoute = { ...editingRoute, ...formData }
        setRoutes(routes.map((r) => (r.id === editingRoute.id ? updatedRoute : r)))
      } else {
        // Create new route
        const newRoute: Route = {
          id: Date.now().toString(),
          ...formData,
        }
        setRoutes([...routes, newRoute])
      }

      // Reset form
      setFormData({
        name: "",
        startLocation: "",
        endLocation: "",
        distance: 0,
        estimatedTime: 0,
        difficulty: "medium",
        status: "active",
      })
      setEditingRoute(null)
      setIsDialogOpen(false)
    } catch (err) {
      setError("Failed to save route")
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
      difficulty: route.difficulty,
      status: route.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this route?")) {
      setRoutes(routes.filter((r) => r.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      startLocation: "",
      endLocation: "",
      distance: 0,
      estimatedTime: 0,
      difficulty: "medium",
      status: "active",
    })
    setEditingRoute(null)
    setError("")
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
              <DialogContent className="sm:max-w-[425px]">
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
                    <div className="space-y-2">
                      <Label htmlFor="distance">Distance (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        step="0.1"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: Number.parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                      <Input
                        id="estimatedTime"
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) =>
                          setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) || 0 })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) =>
                          setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
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
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          route.difficulty === "easy"
                            ? "bg-green-100 text-green-800"
                            : route.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {route.difficulty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          route.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {route.status}
                      </span>
                    </TableCell>
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
