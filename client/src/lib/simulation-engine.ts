import { prisma } from './db'

export interface SimulationParams {
  numDrivers: number
  startTime: string // HH:MM format
  maxHoursPerDay: number
}

export interface SimulationResult {
  totalProfit: number
  efficiencyScore: number
  onTimeDeliveries: number
  lateDeliveries: number
  totalFuelCost: number
  averageDeliveryTime: number
  driverUtilization: Array<{ driver: string; utilization: number }>
  hourlyPerformance: Array<{ hour: string; deliveries: number; efficiency: number }>
}

export interface Delivery {
  id: string
  orderValue: number
  priority: string
  estimatedTime: number
  distance: number
  fuelCost: number
  driverId?: string
  isLate: boolean
  actualTime: number
  profit: number
}

export class SimulationEngine {
  private drivers: any[] = []
  private orders: any[] = []
  private routes: any[] = []
  private deliveries: Delivery[] = []

  constructor() {}

  async initialize() {
    // Load data from database
    this.drivers = await prisma.driver.findMany({ where: { isActive: true } })
    this.orders = await prisma.order.findMany({ where: { status: 'pending' } })
    this.routes = await prisma.route.findMany()
  }

  async runSimulation(params: SimulationParams): Promise<SimulationResult> {
    await this.initialize()

    // Validate inputs
    if (params.numDrivers <= 0 || params.maxHoursPerDay <= 0) {
      throw new Error('Invalid simulation parameters')
    }

    if (params.numDrivers > this.drivers.length) {
      throw new Error(`Only ${this.drivers.length} drivers available, but ${params.numDrivers} requested`)
    }

    // Parse start time
    const [startHour, startMinute] = params.startTime.split(':').map(Number)
    const startTimeMinutes = startHour * 60 + startMinute

    // Initialize simulation state
    this.deliveries = []
    const availableDrivers = this.drivers.slice(0, params.numDrivers)
    const driverWorkloads = new Map(availableDrivers.map(d => [d.id, { hours: 0, deliveries: 0 }]))

    // Process orders and create deliveries
    for (const order of this.orders) {
      const route = this.routes.find(r => r.id === order.routeId) || this.routes[0]
      if (!route) continue

      const delivery = this.createDelivery(order, route, startTimeMinutes)
      this.deliveries.push(delivery)
    }

    // Assign deliveries to drivers based on company rules
    this.assignDeliveriesToDrivers(availableDrivers, driverWorkloads, params.maxHoursPerDay)

    // Calculate results
    const results = this.calculateResults(driverWorkloads)

    // Save simulation result to database
    await this.saveSimulationResult(params, results)

    return results
  }

  private createDelivery(order: any, route: any, startTimeMinutes: number): Delivery {
    const estimatedTime = route.estimatedTime
    const distance = route.distance
    const fuelCost = route.fuelCost * distance

    // Calculate if delivery is late (assuming 2-hour window)
    const deliveryWindow = 120 // 2 hours in minutes
    const isLate = estimatedTime > deliveryWindow

    // Calculate profit based on company rules
    let profit = order.orderValue * 0.15 // Base profit 15% of order value

    // Late Delivery Penalty
    if (isLate) {
      profit -= order.orderValue * 0.1 // 10% penalty
    }

    // High-Value Bonus (orders over $1000 get 5% bonus)
    if (order.orderValue > 1000) {
      profit += order.orderValue * 0.05
    }

    // Priority bonus
    if (order.priority === 'urgent') {
      profit += order.orderValue * 0.03
    } else if (order.priority === 'high') {
      profit += order.orderValue * 0.02
    }

    return {
      id: order.id,
      orderValue: order.orderValue,
      priority: order.priority,
      estimatedTime,
      distance,
      fuelCost,
      isLate,
      actualTime: estimatedTime,
      profit
    }
  }

  private assignDeliveriesToDrivers(drivers: any[], driverWorkloads: Map<string, { hours: number; deliveries: number }>, maxHoursPerDay: number) {
    // Sort deliveries by priority and value
    const sortedDeliveries = [...this.deliveries].sort((a, b) => {
      // Priority order: urgent > high > normal > low
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by order value
      return b.orderValue - a.orderValue
    })

    for (const delivery of sortedDeliveries) {
      let assigned = false

      // Find available driver with least workload
      let bestDriver = null
      let minWorkload = Infinity

      for (const driver of drivers) {
        const workload = driverWorkloads.get(driver.id)!
        const estimatedHours = delivery.estimatedTime / 60

        // Check Driver Fatigue Rule
        if (workload.hours + estimatedHours <= maxHoursPerDay) {
          if (workload.deliveries < minWorkload) {
            minWorkload = workload.deliveries
            bestDriver = driver
          }
        }
      }

      if (bestDriver) {
        const workload = driverWorkloads.get(bestDriver.id)!
        workload.hours += delivery.estimatedTime / 60
        workload.deliveries += 1
        delivery.driverId = bestDriver.id
        assigned = true
      }

      if (!assigned) {
        // Mark as unassigned (will affect efficiency score)
        delivery.driverId = undefined
      }
    }
  }

  private calculateResults(driverWorkloads: Map<string, { hours: number; deliveries: number }>): SimulationResult {
    const totalProfit = this.deliveries.reduce((sum, d) => sum + d.profit, 0)
    const totalFuelCost = this.deliveries.reduce((sum, d) => sum + d.fuelCost, 0)
    const onTimeDeliveries = this.deliveries.filter(d => !d.isLate).length
    const lateDeliveries = this.deliveries.filter(d => d.isLate).length
    const totalDeliveries = this.deliveries.length

    // Calculate efficiency score
    let efficiencyScore = 100

    // Penalty for unassigned deliveries
    const unassignedDeliveries = this.deliveries.filter(d => !d.driverId).length
    if (totalDeliveries > 0) {
      efficiencyScore -= (unassignedDeliveries / totalDeliveries) * 30
    }

    // Penalty for late deliveries
    if (totalDeliveries > 0) {
      efficiencyScore -= (lateDeliveries / totalDeliveries) * 20
    }

    // Bonus for high-value orders
    const highValueOrders = this.deliveries.filter(d => d.orderValue > 1000).length
    if (totalDeliveries > 0) {
      efficiencyScore += (highValueOrders / totalDeliveries) * 10
    }

    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore))

    // Calculate average delivery time
    const averageDeliveryTime = totalDeliveries > 0 
      ? this.deliveries.reduce((sum, d) => sum + d.actualTime, 0) / totalDeliveries
      : 0

    // Driver utilization data
    const driverUtilization = Array.from(driverWorkloads.entries()).map(([driverId, workload]) => {
      const driver = this.drivers.find(d => d.id === driverId)
      const utilization = (workload.hours / 8) * 100 // Assuming 8-hour workday
      return {
        driver: driver?.name || `Driver ${driverId}`,
        utilization: Math.min(100, Math.max(0, utilization))
      }
    })

    // Hourly performance data (simplified)
    const hourlyPerformance = Array.from({ length: 12 }, (_, i) => ({
      hour: `${8 + i}:00`,
      deliveries: Math.floor(Math.random() * 5) + 2, // Mock data
      efficiency: Math.floor(Math.random() * 20) + 80 // Mock data
    }))

    return {
      totalProfit,
      efficiencyScore,
      onTimeDeliveries,
      lateDeliveries,
      totalFuelCost,
      averageDeliveryTime,
      driverUtilization,
      hourlyPerformance
    }
  }

  private async saveSimulationResult(params: SimulationParams, results: SimulationResult) {
    try {
      await prisma.simulationResult.create({
        data: {
          numDrivers: params.numDrivers,
          startTime: params.startTime,
          maxHoursPerDay: params.maxHoursPerDay,
          totalProfit: results.totalProfit,
          efficiencyScore: results.efficiencyScore,
          onTimeDeliveries: results.onTimeDeliveries,
          lateDeliveries: results.lateDeliveries,
          totalFuelCost: results.totalFuelCost,
          averageDeliveryTime: results.averageDeliveryTime,
          driverUtilization: results.driverUtilization,
          hourlyPerformance: results.hourlyPerformance
        }
      })
    } catch (error) {
      console.error('Failed to save simulation result:', error)
    }
  }
} 