import { SimulationEngine, SimulationParams, SimulationResult } from '../lib/simulation-engine'

// Mock Prisma
jest.mock('../lib/db', () => ({
  prisma: {
    driver: {
      findMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    route: {
      findMany: jest.fn(),
    },
    simulationResult: {
      create: jest.fn(),
    },
  },
}))

describe('SimulationEngine', () => {
  let engine: SimulationEngine
  let mockPrisma: any

  beforeEach(() => {
    engine = new SimulationEngine()
    mockPrisma = require('../lib/db').prisma
    
    // Reset mocks
    jest.clearAllMocks()
  })

  describe('runSimulation', () => {
    const validParams: SimulationParams = {
      numDrivers: 3,
      startTime: '08:00',
      maxHoursPerDay: 8
    }

    const mockDrivers = [
      { id: '1', name: 'Driver 1', isActive: true },
      { id: '2', name: 'Driver 2', isActive: true },
      { id: '3', name: 'Driver 3', isActive: true },
      { id: '4', name: 'Driver 4', isActive: true }
    ]

    const mockOrders = [
      { id: '1', orderValue: 1000, priority: 'normal', routeId: 'route1' },
      { id: '2', orderValue: 2000, priority: 'high', routeId: 'route2' },
      { id: '3', orderValue: 500, priority: 'low', routeId: 'route3' }
    ]

    const mockRoutes = [
      { id: 'route1', estimatedTime: 60, distance: 20, fuelCost: 0.15 },
      { id: 'route2', estimatedTime: 90, distance: 30, fuelCost: 0.18 },
      { id: 'route3', estimatedTime: 45, distance: 15, fuelCost: 0.12 }
    ]

    beforeEach(() => {
      mockPrisma.driver.findMany.mockResolvedValue(mockDrivers)
      mockPrisma.order.findMany.mockResolvedValue(mockOrders)
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)
      mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sim1' })
    })

    it('should run simulation successfully with valid parameters', async () => {
      const result = await engine.runSimulation(validParams)

      expect(result).toBeDefined()
      expect(result.totalProfit).toBeGreaterThan(0)
      expect(result.efficiencyScore).toBeGreaterThanOrEqual(0)
      expect(result.efficiencyScore).toBeLessThanOrEqual(100)
      expect(result.onTimeDeliveries).toBeGreaterThanOrEqual(0)
      expect(result.lateDeliveries).toBeGreaterThanOrEqual(0)
      expect(result.totalFuelCost).toBeGreaterThan(0)
      expect(result.driverUtilization).toHaveLength(3)
      expect(result.hourlyPerformance).toHaveLength(12)
    })

    it('should throw error for invalid number of drivers', async () => {
      const invalidParams = { ...validParams, numDrivers: 0 }

      await expect(engine.runSimulation(invalidParams)).rejects.toThrow('Invalid simulation parameters')
    })

    it('should throw error for invalid max hours', async () => {
      const invalidParams = { ...validParams, maxHoursPerDay: 0 }

      await expect(engine.runSimulation(invalidParams)).rejects.toThrow('Invalid simulation parameters')
    })

    it('should throw error when requesting more drivers than available', async () => {
      const invalidParams = { ...validParams, numDrivers: 10 }

      await expect(engine.runSimulation(invalidParams)).rejects.toThrow('Only 4 drivers available, but 10 requested')
    })

    it('should handle empty orders gracefully', async () => {
      mockPrisma.order.findMany.mockResolvedValue([])

      const result = await engine.runSimulation(validParams)

      expect(result.totalProfit).toBe(0)
      expect(result.onTimeDeliveries).toBe(0)
      expect(result.lateDeliveries).toBe(0)
      expect(result.totalFuelCost).toBe(0)
    })

    it('should handle empty routes gracefully', async () => {
      mockPrisma.route.findMany.mockResolvedValue([])

      const result = await engine.runSimulation(validParams)

      expect(result.totalProfit).toBe(0)
      expect(result.onTimeDeliveries).toBe(0)
      expect(result.lateDeliveries).toBe(0)
      expect(result.totalFuelCost).toBe(0)
    })
  })

  describe('delivery creation', () => {
    it('should calculate late delivery penalty correctly', async () => {
      const mockOrders = [
        { id: '1', orderValue: 1000, priority: 'normal', routeId: 'route1' }
      ]
      const mockRoutes = [
        { id: 'route1', estimatedTime: 150, distance: 20, fuelCost: 0.15 } // 2.5 hours (late)
      ]

      mockPrisma.driver.findMany.mockResolvedValue([{ id: '1', isActive: true }])
      mockPrisma.order.findMany.mockResolvedValue(mockOrders)
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)
      mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sim1' })

      const result = await engine.runSimulation({
        numDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 8
      })

      // Base profit: 1000 * 0.15 = 150
      // Late penalty: 1000 * 0.1 = 100
      // Expected profit: 150 - 100 = 50
      expect(result.totalProfit).toBe(50)
      expect(result.lateDeliveries).toBe(1)
    })

    it('should apply high-value bonus correctly', async () => {
      const mockOrders = [
        { id: '1', orderValue: 1500, priority: 'normal', routeId: 'route1' } // Over $1000
      ]
      const mockRoutes = [
        { id: 'route1', estimatedTime: 60, distance: 20, fuelCost: 0.15 }
      ]

      mockPrisma.driver.findMany.mockResolvedValue([{ id: '1', isActive: true }])
      mockPrisma.order.findMany.mockResolvedValue(mockOrders)
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)
      mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sim1' })

      const result = await engine.runSimulation({
        numDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 8
      })

      // Base profit: 1500 * 0.15 = 225
      // High-value bonus: 1500 * 0.05 = 75
      // Expected profit: 225 + 75 = 300
      expect(result.totalProfit).toBe(300)
    })

    it('should apply priority bonuses correctly', async () => {
      const mockOrders = [
        { id: '1', orderValue: 1000, priority: 'urgent', routeId: 'route1' },
        { id: '2', orderValue: 1000, priority: 'high', routeId: 'route2' },
        { id: '3', orderValue: 1000, priority: 'normal', routeId: 'route3' }
      ]
      const mockRoutes = [
        { id: 'route1', estimatedTime: 60, distance: 20, fuelCost: 0.15 },
        { id: 'route2', estimatedTime: 60, distance: 20, fuelCost: 0.15 },
        { id: 'route3', estimatedTime: 60, distance: 20, fuelCost: 0.15 }
      ]

      mockPrisma.driver.findMany.mockResolvedValue([{ id: '1', isActive: true }])
      mockPrisma.order.findMany.mockResolvedValue(mockOrders)
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)
      mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sim1' })

      const result = await engine.runSimulation({
        numDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 8
      })

      // Base profit: 1000 * 0.15 * 3 = 450
      // Urgent bonus: 1000 * 0.03 = 30
      // High bonus: 1000 * 0.02 = 20
      // Expected profit: 450 + 30 + 20 = 500
      expect(result.totalProfit).toBe(500)
    })
  })

  describe('driver assignment', () => {
    it('should respect driver fatigue rule', async () => {
      const mockOrders = [
        { id: '1', orderValue: 1000, priority: 'normal', routeId: 'route1' },
        { id: '2', orderValue: 1000, priority: 'normal', routeId: 'route2' }
      ]
      const mockRoutes = [
        { id: 'route1', estimatedTime: 480, distance: 20, fuelCost: 0.15 }, // 8 hours
        { id: 'route2', estimatedTime: 60, distance: 20, fuelCost: 0.15 }   // 1 hour
      ]

      mockPrisma.driver.findMany.mockResolvedValue([{ id: '1', isActive: true }])
      mockPrisma.order.findMany.mockResolvedValue(mockOrders)
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)
      mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sim1' })

      const result = await engine.runSimulation({
        numDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 8
      })

      // First delivery should be assigned (8 hours)
      // Second delivery should not be assigned (would exceed 8 hours)
      expect(result.efficiencyScore).toBeLessThan(100) // Penalty for unassigned delivery
    })
  })

  describe('efficiency calculation', () => {
    it('should calculate efficiency score correctly', async () => {
      const mockOrders = [
        { id: '1', orderValue: 1000, priority: 'normal', routeId: 'route1' }
      ]
      const mockRoutes = [
        { id: 'route1', estimatedTime: 60, distance: 20, fuelCost: 0.15 }
      ]

      mockPrisma.driver.findMany.mockResolvedValue([{ id: '1', isActive: true }])
      mockPrisma.order.findMany.mockResolvedValue(mockOrders)
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)
      mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sim1' })

      const result = await engine.runSimulation({
        numDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 8
      })

      // Base efficiency: 100
      // No penalties or bonuses in this case
      expect(result.efficiencyScore).toBe(100)
    })

    it('should apply penalties for late deliveries', async () => {
      const mockOrders = [
        { id: '1', orderValue: 1000, priority: 'normal', routeId: 'route1' }
      ]
      const mockRoutes = [
        { id: 'route1', estimatedTime: 150, distance: 20, fuelCost: 0.15 } // Late delivery
      ]

      mockPrisma.driver.findMany.mockResolvedValue([{ id: '1', isActive: true }])
      mockPrisma.order.findMany.mockResolvedValue(mockOrders)
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes)
      mockPrisma.simulationResult.create.mockResolvedValue({ id: 'sim1' })

      const result = await engine.runSimulation({
        numDrivers: 1,
        startTime: '08:00',
        maxHoursPerDay: 8
      })

      // Base efficiency: 100
      // Late delivery penalty: 20% (1/1 * 20)
      // Expected efficiency: 100 - 20 = 80
      expect(result.efficiencyScore).toBe(80)
    })
  })
}) 