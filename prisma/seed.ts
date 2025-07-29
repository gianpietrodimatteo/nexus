import { PrismaClient, UserRole, PipelinePhase, ContractLength, BillingCadence, PricingModel, ProductUsageAPI } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for all users (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create subscription plans first
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'basic-plan' },
    update: {},
    create: {
      id: 'basic-plan',
      name: 'Basic Plan',
      pricingModel: PricingModel.CONSUMPTION,
      contractLength: ContractLength.MONTH,
      billingCadence: BillingCadence.MONTHLY,
      setupFee: 500,
      prepaymentPercentage: 0,
      capAmount: 10000,
      overageCost: 50,
      creditsPerPeriod: 100,
      pricePerCredit: 25,
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
      contractEndDate: new Date('2024-12-31'),
      pipelinePhase: PipelinePhase.TESTING_STARTED,
      subscriptionPlanId: basicPlan.id
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

  console.log('✅ Seed completed successfully!')
  console.log('👤 Created users:')
  console.log(`   Admin: ${adminUser.email}`)
  console.log(`   SE: ${seUser.email}`)
  console.log(`   Client: ${clientUser.email}`)
  console.log(`🏢 Created organization: ${testOrg.name}`)
  console.log(`🏭 Created workflows: ${workflow1.name}, ${workflow2.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 