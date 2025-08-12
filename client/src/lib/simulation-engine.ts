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
    const results = this.calculateResults(driverWorkloads, params)

    // Save simulation result to database
    await this.saveSimulationResult(params, results)

    return results
  }

  private createDelivery(order: any, route: any, startTimeMinutes: number): Delivery {
    // Add realistic variability factors
    const trafficFactor = 0.8 + (Math.random() * 0.4) // 0.8 to 1.2 (traffic conditions)
    const weatherFactor = 0.9 + (Math.random() * 0.2) // 0.9 to 1.1 (weather impact)
    const driverEfficiencyFactor = 0.85 + (Math.random() * 0.3) // 0.85 to 1.15 (driver skill)
    
    // Apply variability to estimated time and distance
    const actualEstimatedTime = Math.round(route.estimatedTime * trafficFactor * weatherFactor)
    const actualDistance = route.distance * (0.95 + Math.random() * 0.1) // Route variations
    const fuelCost = route.fuelCost * actualDistance * (0.9 + Math.random() * 0.2) // Fuel price fluctuation

    // Calculate if delivery is late with realistic variability
    const deliveryWindow = 120 // 2 hours in minutes
    const actualTime = Math.round(actualEstimatedTime * driverEfficiencyFactor)
    const isLate = actualTime > deliveryWindow

    // Calculate profit based on company rules with market fluctuations
    const marketFactor = 0.95 + (Math.random() * 0.1) // Market conditions affect profit margins
    let profit = order.orderValue * 0.15 * marketFactor // Base profit with market variability

    // Late Delivery Penalty (with severity based on how late)
    if (isLate) {
      const latenessSeverity = Math.min(2.0, (actualTime - deliveryWindow) / 60) // Hours late
      const penaltyRate = 0.05 + (latenessSeverity * 0.025) // Escalating penalty
      profit -= order.orderValue * penaltyRate
    }

    // High-Value Bonus (orders over $1000 get variable bonus)
    if (order.orderValue > 1000) {
      const bonusRate = 0.03 + (Math.random() * 0.04) // 3-7% bonus
      profit += order.orderValue * bonusRate
    }

    // Priority bonus with variability
    if (order.priority === 'urgent') {
      profit += order.orderValue * (0.025 + Math.random() * 0.01) // 2.5-3.5%
    } else if (order.priority === 'high') {
      profit += order.orderValue * (0.015 + Math.random() * 0.01) // 1.5-2.5%
    }

    // Customer satisfaction bonus (random positive factor)
    if (Math.random() > 0.7) { // 30% chance
      profit += order.orderValue * (0.01 + Math.random() * 0.02) // 1-3% satisfaction bonus
    }

    return {
      id: order.id,
      orderValue: order.orderValue,
      priority: order.priority,
      estimatedTime: actualEstimatedTime,
      distance: actualDistance,
      fuelCost,
      isLate,
      actualTime,
      profit: Math.max(0, profit) // Ensure profit doesn't go negative
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

  private calculateResults(driverWorkloads: Map<string, { hours: number; deliveries: number }>, params: SimulationParams): SimulationResult {
    const totalProfit = this.deliveries.reduce((sum, d) => sum + d.profit, 0)
    const totalFuelCost = this.deliveries.reduce((sum, d) => sum + d.fuelCost, 0)
    const onTimeDeliveries = this.deliveries.filter(d => !d.isLate).length
    const lateDeliveries = this.deliveries.filter(d => d.isLate).length
    const totalDeliveries = this.deliveries.length

    // Calculate efficiency score with realistic factors
    let efficiencyScore = 95 + (Math.random() * 10) // Base efficiency with daily variation

    // Penalty for unassigned deliveries
    const unassignedDeliveries = this.deliveries.filter(d => !d.driverId).length
    if (totalDeliveries > 0) {
      const unassignedRate = unassignedDeliveries / totalDeliveries
      efficiencyScore -= unassignedRate * (25 + Math.random() * 10) // Variable penalty
    }

    // Penalty for late deliveries with severity consideration
    if (totalDeliveries > 0) {
      const lateRate = lateDeliveries / totalDeliveries
      const averageLateness = this.deliveries
        .filter(d => d.isLate)
        .reduce((sum, d) => sum + Math.max(0, d.actualTime - 120), 0) / Math.max(1, lateDeliveries)
      
      const latenessSeverity = Math.min(2.0, averageLateness / 60) // Hours late
      efficiencyScore -= lateRate * (15 + latenessSeverity * 10 + Math.random() * 5)
    }

    // Bonus for high-value orders
    const highValueOrders = this.deliveries.filter(d => d.orderValue > 1000).length
    if (totalDeliveries > 0) {
      const highValueRate = highValueOrders / totalDeliveries
      efficiencyScore += highValueRate * (8 + Math.random() * 4) // Variable bonus
    }

    // Team performance factor (simulates daily team dynamics)
    const teamPerformanceFactor = 0.95 + (Math.random() * 0.1) // 95-105%
    efficiencyScore *= teamPerformanceFactor

    // Weather/external conditions impact
    const externalConditionsFactor = 0.9 + (Math.random() * 0.2) // 90-110%
    efficiencyScore *= externalConditionsFactor

    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore))

    // Calculate average delivery time
    const averageDeliveryTime = totalDeliveries > 0 
      ? this.deliveries.reduce((sum, d) => sum + d.actualTime, 0) / totalDeliveries
      : 0

    // Driver utilization data with realistic variations
    const driverUtilization = Array.from(driverWorkloads.entries()).map(([driverId, workload]) => {
      const driver = this.drivers.find(d => d.id === driverId)
      const baseUtilization = (workload.hours / params.maxHoursPerDay) * 100
      
      // Add driver-specific performance variations
      const driverEfficiency = 0.85 + (Math.random() * 0.3) // Individual driver performance
      const dailyConditions = 0.9 + (Math.random() * 0.2) // Daily conditions affect each driver
      
      const adjustedUtilization = baseUtilization * driverEfficiency * dailyConditions
      
      return {
        driver: driver?.name || `Driver ${driverId}`,
        utilization: Math.min(100, Math.max(0, Math.round(adjustedUtilization)))
      }
    })

    // Calculate real hourly performance data with realistic variations
    const [startHour] = params.startTime.split(':').map(Number)
    const workingHours = Math.min(12, params.maxHoursPerDay)
    
    const hourlyPerformance = Array.from({ length: workingHours }, (_, i) => {
      const hour = startHour + i
      const hourString = `${hour.toString().padStart(2, '0')}:00`
      
      // Simulate realistic hourly patterns
      const rushHourFactor = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19) ? 1.2 : 1.0
      const lunchTimeFactor = (hour >= 12 && hour <= 14) ? 0.8 : 1.0
      const endOfDayFactor = hour >= 16 ? (1.0 - (hour - 16) * 0.05) : 1.0
      
      // Base deliveries per hour with realistic distribution
      const baseDeliveriesPerHour = Math.max(1, Math.floor(totalDeliveries / workingHours))
      const hourlyVariation = 0.7 + (Math.random() * 0.6) // 70-130% variation
      
      const hourlyDeliveries = Math.round(
        baseDeliveriesPerHour * 
        rushHourFactor * 
        lunchTimeFactor * 
        endOfDayFactor * 
        hourlyVariation
      )
      
      // Calculate efficiency with hourly factors
      const baseEfficiency = 85 + (Math.random() * 15) // 85-100% base
      const hourlyStress = hour > startHour + 6 ? 0.95 : 1.0 // Fatigue factor
      const trafficImpact = rushHourFactor > 1 ? 0.9 : 1.0 // Traffic reduces efficiency
      
      const hourlyEfficiency = Math.round(
        baseEfficiency * hourlyStress * trafficImpact * (0.9 + Math.random() * 0.2)
      )
      
      return {
        hour: hourString,
        deliveries: Math.max(0, hourlyDeliveries),
        efficiency: Math.min(100, Math.max(60, hourlyEfficiency))
      }
    })

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