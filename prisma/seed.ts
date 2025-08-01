import { PrismaClient, UserRole, PipelinePhase, ContractLength, BillingCadence, PricingModel, ProductUsageAPI } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for all users (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create subscription plans first
  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'enterprise-plan' },
    update: {},
    create: {
      id: 'enterprise-plan',
      name: 'Enterprise',
      pricingModel: PricingModel.CONSUMPTION,
      contractLength: ContractLength.YEAR,
      billingCadence: BillingCadence.MONTHLY,
      setupFee: 1000,
      prepaymentPercentage: 0,
      capAmount: 50000,
      overageCost: 100,
      creditsPerPeriod: 10000, // 10,000 credits per month
      pricePerCredit: 0.20, // $0.20 per credit
      productUsageAPI: ProductUsageAPI.NEXUS_BASE
    }
  })

  // Create test organization
  const testOrg = await prisma.organization.upsert({
    where: { id: 'test-org-1' },
    update: {},
    create: {
      id: 'test-org-1',
      name: 'Acme Corporation',
      url: 'https://acme.com',
      contractStartDate: new Date('2024-01-01'),
      contractEndDate: new Date('2025-05-01'), // Contract renewal date matching the UI
      pipelinePhase: PipelinePhase.TESTING_STARTED,
      subscriptionPlanId: enterprisePlan.id
    }
  })

  // Create department
  const engineeringDept = await prisma.department.upsert({
    where: { id: 'eng-dept-1' },
    update: {},
    create: {
      id: 'eng-dept-1',
      name: 'Engineering',
      organizationId: testOrg.id
    }
  })

  // Create Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@usebraintrust.com' },
    update: {},
    create: {
      id: 'admin-user-1',
      email: 'admin@usebraintrust.com',
      name: 'Admin User',
      phone: '+1-555-0100',
      role: UserRole.ADMIN,
      // Admin doesn't belong to an organization
      organizationId: null,
      departmentId: null,
      billingAccess: false,
      adminAccess: false,
      password: hashedPassword
    }
  })

  // Create SE user
  const seUser = await prisma.user.upsert({
    where: { email: 'se@usebraintrust.com' },
    update: {},
    create: {
      id: 'se-user-1',
      email: 'se@usebraintrust.com',
      name: 'Solutions Engineer',
      phone: '+1-555-0200',
      role: UserRole.SE,
      organizationId: null, // SEs don't belong to a single org
      departmentId: null,
      hourlyRateCost: 75,
      hourlyRateBillable: 150,
      billingAccess: false,
      adminAccess: false,
      password: hashedPassword
    }
  })

  // Create Client user
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@acme.com' },
    update: {},
    create: {
      id: 'client-user-1',
      email: 'client@acme.com',
      name: 'John Client',
      phone: '+1-555-0300',
      role: UserRole.CLIENT,
      organizationId: testOrg.id,
      departmentId: engineeringDept.id,
      billingAccess: true,
      adminAccess: true, // Can manage other users in their org
      notificationPreferences: {
        email: true,
        sms: false
      },
      password: hashedPassword
    }
  })

  // Assign SE to the test organization
  await prisma.organization.update({
    where: { id: testOrg.id },
    data: {
      assignedSEs: {
        connect: { id: seUser.id }
      }
    }
  })

  // Create some sample workflows
  const workflow1 = await prisma.workflow.create({
    data: {
      id: 'workflow-1',
      name: 'Invoice Processing Automation',
      description: 'Automatically process incoming invoices and route for approval',
      isActive: true,
      nodeCount: 8,
      timeSavedPerExecution: 45, // 45 minutes
      moneySavedPerExecution: 112.50, // $112.50 based on 45min * $150/hr
      organizationId: testOrg.id,
      departmentId: engineeringDept.id
    }
  })

  const workflow2 = await prisma.workflow.create({
    data: {
      id: 'workflow-2',
      name: 'Employee Onboarding',
      description: 'Automate new employee setup across multiple systems',
      isActive: true,
      nodeCount: 12,
      timeSavedPerExecution: 120, // 2 hours
      moneySavedPerExecution: 300, // $300 based on 2hrs * $150/hr
      organizationId: testOrg.id,
      departmentId: engineeringDept.id
    }
  })

  // Create some sample executions
  await prisma.execution.createMany({
    data: [
      {
        workflowId: workflow1.id,
        status: 'SUCCESS',
        executionDetails: { processedInvoices: 5, totalAmount: 12500 },
        startedAt: new Date('2024-01-15T09:00:00Z'),
        completedAt: new Date('2024-01-15T09:45:00Z')
      },
      {
        workflowId: workflow1.id,
        status: 'SUCCESS',
        executionDetails: { processedInvoices: 3, totalAmount: 8900 },
        startedAt: new Date('2024-01-16T10:15:00Z'),
        completedAt: new Date('2024-01-16T11:00:00Z')
      },
      {
        workflowId: workflow2.id,
        status: 'SUCCESS',
        executionDetails: { newEmployees: 2, systemsConfigured: 8 },
        startedAt: new Date('2024-01-17T14:00:00Z'),
        completedAt: new Date('2024-01-17T16:00:00Z')
      }
    ]
  })

  // Create pipeline phase logs
  await prisma.pipelinePhaseLog.createMany({
    data: [
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.DISCOVERY_SURVEY,
        completedAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.DISCOVERY_DEEP_DIVE,
        completedAt: new Date('2024-01-05T15:30:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.ADA_PROPOSAL_SENT,
        completedAt: new Date('2024-01-10T09:00:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.ADA_PROPOSAL_REVIEW,
        completedAt: new Date('2024-01-15T16:00:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.ADA_CONTRACT_SENT,
        completedAt: new Date('2024-01-20T11:00:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.ADA_CONTRACT_SIGNED,
        completedAt: new Date('2024-01-25T14:30:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.CREDENTIALS_COLLECTED,
        completedAt: new Date('2024-02-01T10:00:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.FACTORY_BUILD,
        completedAt: new Date('2024-02-15T17:00:00Z')
      },
      {
        organizationId: testOrg.id,
        phase: PipelinePhase.TEST_PLAN_GENERATED,
        completedAt: new Date('2024-02-20T09:30:00Z')
      }
      // TESTING_STARTED is current phase (no completedAt)
    ]
  })

  // Create sample document links
  await prisma.documentLink.createMany({
    data: [
      {
        organizationId: testOrg.id,
        type: 'CONTRACT',
        url: 'https://documents.acme.com/contract-2024.pdf'
      },
      {
        organizationId: testOrg.id,
        type: 'ADA_PROPOSAL',
        url: 'https://documents.acme.com/ada-proposal.pdf'
      },
      {
        organizationId: testOrg.id,
        type: 'PROCESS_DOC',
        url: 'https://documents.acme.com/process-documentation.pdf'
      }
    ]
  })

  // Create billing-related data
  console.log('💳 Creating billing data...')

  // Create payment method data
  await prisma.paymentMethodData.upsert({
    where: { organizationId: testOrg.id },
    update: {},
    create: {
      organizationId: testOrg.id,
      isPrimary: true,
      cardLast4: '4242',
      cardBrand: 'Visa',
      cardExpMonth: 12,
      cardExpYear: 2025,
      stripePaymentMethodId: 'pm_test_1234567890'
    }
  })

  // Create usage tracking data for the last 6 months
  const currentDate = new Date()
  const usageData = []
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    // Simulate growing usage over time
    const baseApiCalls = 200000 + (i * 25000)
    const baseStorage = 1000 + (i * 50) // GB
    const baseUsers = 100 + (i * 5)
    
    usageData.push({
      organizationId: testOrg.id,
      month,
      year,
      apiCalls: baseApiCalls + Math.floor(Math.random() * 50000),
      storageUsedGB: baseStorage + Math.floor(Math.random() * 200),
      activeUsers: baseUsers + Math.floor(Math.random() * 20),
      workflowExecutions: 150 + Math.floor(Math.random() * 100)
    })
  }

  await prisma.usageTracking.createMany({
    data: usageData,
    skipDuplicates: true
  })

  // Create SE hours tracking data for the last 6 months
  const seHoursData = []
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    // Simulate varying SE hours usage
    const allocatedHours = 20 // Standard allocation
    const usedHours = 10 + Math.random() * 15 // Random between 10-25 hours
    
    seHoursData.push({
      organizationId: testOrg.id,
      month,
      year,
      allocatedHours,
      usedHours: Math.min(usedHours, allocatedHours) // Can't use more than allocated
    })
  }

  await prisma.sEHoursTracking.createMany({
    data: seHoursData,
    skipDuplicates: true
  })

  // Create sample invoices
  const invoiceData = []
  
  for (let i = 5; i >= 0; i--) {
    const invoiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const dueDate = new Date(invoiceDate.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days later
    
    // Base amount plus usage-based charges
    const baseAmount = 2000 // $2000 monthly fee
    const usageCharges = Math.floor(Math.random() * 500) // Random usage charges
    const totalAmount = baseAmount + usageCharges
    
    invoiceData.push({
      organizationId: testOrg.id,
      invoiceDate,
      dueDate,
      amount: totalAmount,
      paymentMethod: 'STRIPE',
      status: i === 0 ? 'PENDING' : 'PAID', // Current month pending, others paid
      stripeInvoiceId: `in_test_${Math.random().toString(36).substr(2, 9)}`
    })
  }

  await prisma.invoice.createMany({
    data: invoiceData,
    skipDuplicates: true
  })

  // Create some sample credits applied by admin
  await prisma.credit.createMany({
    data: [
      {
        organizationId: testOrg.id,
        amount: 500,
        reason: 'Welcome bonus for new customer',
        appliedBy: adminUser.id,
        appliedAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        organizationId: testOrg.id,
        amount: 250,
        reason: 'Service disruption compensation',
        appliedBy: adminUser.id,
        appliedAt: new Date('2024-02-15T14:30:00Z')
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Seed completed successfully!')
  console.log('👤 Created users:')
  console.log(`   Admin: ${adminUser.email}`)
  console.log(`   SE: ${seUser.email}`)
  console.log(`   Client: ${clientUser.email}`)
  console.log(`🏢 Created organization: ${testOrg.name}`)
  console.log(`🏭 Created workflows: ${workflow1.name}, ${workflow2.name}`)
  console.log(`💳 Created billing data: payment method, usage tracking, invoices, and credits`)
  console.log(`📊 Created ${usageData.length} months of usage data`)
  console.log(`⏰ Created ${seHoursData.length} months of SE hours tracking`)
  console.log(`🧾 Created ${invoiceData.length} sample invoices`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 