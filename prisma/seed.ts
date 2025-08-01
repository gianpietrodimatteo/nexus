import { PrismaClient, UserRole, PipelinePhase, ContractLength, BillingCadence, PricingModel, ProductUsageAPI } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for all users (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create subscription plans to match Figma design
  const enterpriseProPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'enterprise-pro-plan' },
    update: {},
    create: {
      id: 'enterprise-pro-plan',
      name: 'Enterprise Pro',
      pricingModel: PricingModel.TIERED,
      contractLength: ContractLength.YEAR,
      billingCadence: BillingCadence.MONTHLY,
      setupFee: 5000,
      prepaymentPercentage: 25,
      capAmount: 100000,
      overageCost: 150,
      creditsPerPeriod: 10000,
      pricePerCredit: 0.20,
      productUsageAPI: ProductUsageAPI.NEXUS_BASE
    }
  })

  const businessPlusPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'business-plus-plan' },
    update: {},
    create: {
      id: 'business-plus-plan',
      name: 'Business Plus',
      pricingModel: PricingModel.FIXED,
      contractLength: ContractLength.QUARTER, // Note: Figma shows "6 months" but QUARTER = 3 months
      billingCadence: BillingCadence.QUARTERLY,
      setupFee: 2500,
      prepaymentPercentage: 15,
      capAmount: 50000,
      overageCost: 125,
      creditsPerPeriod: 5000,
      pricePerCredit: 0.15,
      productUsageAPI: ProductUsageAPI.NEXUS_BASE
    }
  })

  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'starter-plan' },
    update: {},
    create: {
      id: 'starter-plan',
      name: 'Starter',
      pricingModel: PricingModel.USAGE,
      contractLength: ContractLength.QUARTER,
      billingCadence: BillingCadence.MONTHLY,
      setupFee: 1000,
      prepaymentPercentage: 10,
      capAmount: 25000,
      overageCost: 100,
      creditsPerPeriod: 2500,
      pricePerCredit: 0.10,
      productUsageAPI: ProductUsageAPI.NEXUS_BASE
    }
  })

  // Create a few well-connected organizations per plan
  
  // Enterprise Pro plan organizations (3 realistic clients)
  const acmeCorp = await prisma.organization.upsert({
    where: { id: 'acme-corp' },
    update: {},
    create: {
      id: 'acme-corp',
      name: 'Acme Corporation',
      url: 'https://acme.com',
      contractStartDate: new Date('2024-01-01'),
      contractEndDate: new Date('2025-05-01'),
      pipelinePhase: PipelinePhase.TESTING_STARTED,
      subscriptionPlanId: enterpriseProPlan.id
    }
  })

  const techCorp = await prisma.organization.upsert({
    where: { id: 'tech-corp' },
    update: {},
    create: {
      id: 'tech-corp',
      name: 'TechCorp Industries',
      url: 'https://techcorp.com',
      contractStartDate: new Date('2024-02-15'),
      contractEndDate: new Date('2025-02-15'),
      pipelinePhase: PipelinePhase.PRODUCTION_DEPLOY,
      subscriptionPlanId: enterpriseProPlan.id
    }
  })

  const globalSys = await prisma.organization.upsert({
    where: { id: 'global-systems' },
    update: {},
    create: {
      id: 'global-systems',
      name: 'Global Systems Ltd',
      url: 'https://globalsystems.com',
      contractStartDate: new Date('2023-11-01'),
      contractEndDate: new Date('2024-11-01'),
      pipelinePhase: PipelinePhase.TESTING_STARTED,
      subscriptionPlanId: enterpriseProPlan.id
    }
  })

  // Business Plus plan organizations (2 realistic clients)
  const midTechSolutions = await prisma.organization.upsert({
    where: { id: 'midtech-solutions' },
    update: {},
    create: {
      id: 'midtech-solutions',
      name: 'MidTech Solutions',
      url: 'https://midtechsolutions.com',
      contractStartDate: new Date('2024-03-01'),
      contractEndDate: new Date('2024-09-01'),
      pipelinePhase: PipelinePhase.PRODUCTION_DEPLOY,
      subscriptionPlanId: businessPlusPlan.id
    }
  })

  const quickStart = await prisma.organization.upsert({
    where: { id: 'quickstart-inc' },
    update: {},
    create: {
      id: 'quickstart-inc',
      name: 'QuickStart Inc',
      url: 'https://quickstart.com',
      contractStartDate: new Date('2024-04-01'),
      contractEndDate: new Date('2024-10-01'),
      pipelinePhase: PipelinePhase.FACTORY_BUILD,
      subscriptionPlanId: businessPlusPlan.id
    }
  })

  // Starter plan organizations (2 realistic clients)
  const smallBiz = await prisma.organization.upsert({
    where: { id: 'small-biz' },
    update: {},
    create: {
      id: 'small-biz',
      name: 'SmallBiz Co',
      url: 'https://smallbiz.com',
      contractStartDate: new Date('2024-05-01'),
      contractEndDate: new Date('2024-08-01'),
      pipelinePhase: PipelinePhase.DISCOVERY_DEEP_DIVE,
      subscriptionPlanId: starterPlan.id
    }
  })

  const startupOne = await prisma.organization.upsert({
    where: { id: 'startup-one' },
    update: {},
    create: {
      id: 'startup-one',
      name: 'Startup One',
      url: 'https://startupone.com',
      contractStartDate: new Date('2024-06-01'),
      contractEndDate: new Date('2024-09-01'),
      pipelinePhase: PipelinePhase.ADA_PROPOSAL_SENT,
      subscriptionPlanId: starterPlan.id
    }
  })

  // Use Acme Corp as the main test org
  const testOrg = acmeCorp

  // Store all orgs for later reference
  const allOrgs = [acmeCorp, techCorp, globalSys, midTechSolutions, quickStart, smallBiz, startupOne]

  // Create departments for multiple organizations
  const acmeEngDept = await prisma.department.upsert({
    where: { id: 'acme-eng-dept' },
    update: {},
    create: {
      id: 'acme-eng-dept',
      name: 'Engineering',
      organizationId: acmeCorp.id
    }
  })

  const acmeMarketingDept = await prisma.department.upsert({
    where: { id: 'acme-marketing-dept' },
    update: {},
    create: {
      id: 'acme-marketing-dept',
      name: 'Marketing',
      organizationId: acmeCorp.id
    }
  })

  const techCorpItDept = await prisma.department.upsert({
    where: { id: 'techcorp-it-dept' },
    update: {},
    create: {
      id: 'techcorp-it-dept',
      name: 'IT Operations',
      organizationId: techCorp.id
    }
  })

  const midTechDevDept = await prisma.department.upsert({
    where: { id: 'midtech-dev-dept' },
    update: {},
    create: {
      id: 'midtech-dev-dept',
      name: 'Development',
      organizationId: midTechSolutions.id
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

  // Create Client users across different organizations
  const acmeClientUser = await prisma.user.upsert({
    where: { email: 'john.doe@acme.com' },
    update: {},
    create: {
      id: 'acme-client-user-1',
      email: 'john.doe@acme.com',
      name: 'John Doe',
      phone: '+1-555-0300',
      role: UserRole.CLIENT,
      organizationId: acmeCorp.id,
      departmentId: acmeEngDept.id,
      billingAccess: true,
      adminAccess: true,
      notificationPreferences: {
        email: true,
        sms: false
      },
      password: hashedPassword
    }
  })

  const acmeMarketingUser = await prisma.user.upsert({
    where: { email: 'sarah.marketing@acme.com' },
    update: {},
    create: {
      id: 'acme-marketing-user-1',
      email: 'sarah.marketing@acme.com',
      name: 'Sarah Williams',
      phone: '+1-555-0301',
      role: UserRole.CLIENT,
      organizationId: acmeCorp.id,
      departmentId: acmeMarketingDept.id,
      billingAccess: false,
      adminAccess: false,
      notificationPreferences: {
        email: true,
        sms: true
      },
      password: hashedPassword
    }
  })

  const techCorpUser = await prisma.user.upsert({
    where: { email: 'mike.tech@techcorp.com' },
    update: {},
    create: {
      id: 'techcorp-user-1',
      email: 'mike.tech@techcorp.com',
      name: 'Mike Thompson',
      phone: '+1-555-0400',
      role: UserRole.CLIENT,
      organizationId: techCorp.id,
      departmentId: techCorpItDept.id,
      billingAccess: true,
      adminAccess: true,
      notificationPreferences: {
        email: true,
        sms: false
      },
      password: hashedPassword
    }
  })

  const midTechUser = await prisma.user.upsert({
    where: { email: 'lisa.dev@midtechsolutions.com' },
    update: {},
    create: {
      id: 'midtech-user-1',
      email: 'lisa.dev@midtechsolutions.com',
      name: 'Lisa Chen',
      phone: '+1-555-0500',
      role: UserRole.CLIENT,
      organizationId: midTechSolutions.id,
      departmentId: midTechDevDept.id,
      billingAccess: false,
      adminAccess: false,
      notificationPreferences: {
        email: true,
        sms: false
      },
      password: hashedPassword
    }
  })

  // Use the first client user as the main reference
  const clientUser = acmeClientUser

  // Assign SE to multiple organizations
  await prisma.organization.updateMany({
    where: { 
      id: { 
        in: [acmeCorp.id, techCorp.id, globalSys.id, midTechSolutions.id] 
      } 
    },
    data: {}
  })

  // Connect SE to organizations using the relation
  await prisma.user.update({
    where: { id: seUser.id },
    data: {
      assignedOrganizations: {
        connect: [
          { id: acmeCorp.id },
          { id: techCorp.id },
          { id: globalSys.id },
          { id: midTechSolutions.id }
        ]
      }
    }
  })

  // Create sample workflows across different organizations
  const acmeInvoiceWorkflow = await prisma.workflow.create({
    data: {
      id: 'acme-invoice-workflow',
      name: 'Invoice Processing Automation',
      description: 'Automatically process incoming invoices and route for approval',
      isActive: true,
      nodeCount: 8,
      timeSavedPerExecution: 45, // 45 minutes
      moneySavedPerExecution: 112.50, // $112.50 based on 45min * $150/hr
      organizationId: acmeCorp.id,
      departmentId: acmeEngDept.id
    }
  })

  const acmeMarketingWorkflow = await prisma.workflow.create({
    data: {
      id: 'acme-marketing-workflow',
      name: 'Lead Generation Automation',
      description: 'Automate lead qualification and routing',
      isActive: true,
      nodeCount: 6,
      timeSavedPerExecution: 30,
      moneySavedPerExecution: 75,
      organizationId: acmeCorp.id,
      departmentId: acmeMarketingDept.id
    }
  })

  const techCorpWorkflow = await prisma.workflow.create({
    data: {
      id: 'techcorp-deployment-workflow',
      name: 'Automated Deployment Pipeline',
      description: 'Automate code deployment across environments',
      isActive: true,
      nodeCount: 15,
      timeSavedPerExecution: 90,
      moneySavedPerExecution: 225,
      organizationId: techCorp.id,
      departmentId: techCorpItDept.id
    }
  })

  const midTechWorkflow = await prisma.workflow.create({
    data: {
      id: 'midtech-testing-workflow',
      name: 'QA Testing Automation',
      description: 'Automate regression testing suite',
      isActive: true,
      nodeCount: 10,
      timeSavedPerExecution: 60,
      moneySavedPerExecution: 150,
      organizationId: midTechSolutions.id,
      departmentId: midTechDevDept.id
    }
  })

  // Keep the references for the existing code
  const workflow1 = acmeInvoiceWorkflow
  const workflow2 = acmeMarketingWorkflow

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
      paymentMethod: 'STRIPE' as const,
      status: (i === 0 ? 'PENDING' : 'PAID') as const, // Current month pending, others paid
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

  // Create sample exceptions
  console.log('⚠️ Creating exception data...')
  
  const exceptionData = [
    {
      type: 'AUTHENTICATION',
      severity: 'HIGH',
      status: 'NEW',
      remedy: null,
      workflowId: acmeInvoiceWorkflow.id,
      organizationId: acmeCorp.id,
      departmentId: acmeEngDept.id,
      reportedAt: new Date('2024-01-20T10:30:00Z'),
    },
    {
      type: 'DATA_PROCESS',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      remedy: 'Investigating data source connection timeout',
      workflowId: acmeInvoiceWorkflow.id,
      organizationId: acmeCorp.id,
      departmentId: acmeEngDept.id,
      reportedAt: new Date('2024-01-18T14:15:00Z'),
    },
    {
      type: 'WORKFLOW_LOGIC',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      remedy: 'Updated conditional logic to handle edge case',
      workflowId: acmeMarketingWorkflow.id,
      organizationId: acmeCorp.id,
      departmentId: acmeMarketingDept.id,
      reportedAt: new Date('2024-01-15T09:45:00Z'),
      resolvedAt: new Date('2024-01-16T11:20:00Z'),
    },
    {
      type: 'INTEGRATION',
      severity: 'LOW',
      status: 'IGNORED',
      remedy: 'Third-party API rate limit - acceptable performance impact',
      workflowId: techCorpWorkflow.id,
      organizationId: techCorp.id,
      departmentId: techCorpItDept.id,
      reportedAt: new Date('2024-01-12T16:00:00Z'),
    },
    {
      type: 'BROWSER_AUTOMATION',
      severity: 'HIGH',
      status: 'RESOLVED',
      remedy: 'Updated selector due to UI changes on target site',
      workflowId: midTechWorkflow.id,
      organizationId: midTechSolutions.id,
      departmentId: midTechDevDept.id,
      reportedAt: new Date('2024-01-10T08:30:00Z'),
      resolvedAt: new Date('2024-01-11T13:45:00Z'),
    },
    {
      type: 'AUTHENTICATION',
      severity: 'CRITICAL',
      status: 'NEW',
      remedy: null,
      workflowId: techCorpWorkflow.id,
      organizationId: techCorp.id,
      departmentId: techCorpItDept.id,
      reportedAt: new Date('2024-01-22T11:15:00Z'),
    },
  ]

  const createdExceptions = await prisma.exception.createMany({
    data: exceptionData,
    skipDuplicates: true
  })

  // Create some exception notifications for the exceptions
  const exceptions = await prisma.exception.findMany({
    where: {
      organizationId: { in: [acmeCorp.id, techCorp.id, midTechSolutions.id] }
    },
    take: 3, // Just create notifications for first few exceptions
  })

  const notificationData = []
  for (const exception of exceptions) {
    // Notify SE user via email
    notificationData.push({
      method: 'EMAIL',
      recipient: seUser.email,
      sentAt: new Date(exception.reportedAt.getTime() + 5 * 60 * 1000), // 5 minutes after exception
      success: true,
      error: null,
      exceptionId: exception.id,
      userId: seUser.id,
    })

    // Notify organization admin via email if it's Acme Corp
    if (exception.organizationId === acmeCorp.id) {
      notificationData.push({
        method: 'EMAIL',
        recipient: acmeClientUser.email,
        sentAt: new Date(exception.reportedAt.getTime() + 10 * 60 * 1000), // 10 minutes after
        success: true,
        error: null,
        exceptionId: exception.id,
        userId: acmeClientUser.id,
      })
    }
  }

  await prisma.exceptionNotification.createMany({
    data: notificationData,
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
  console.log(`⚠️ Created ${exceptionData.length} sample exceptions with ${notificationData.length} notifications`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 