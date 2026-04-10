import { PrismaClient, UserRole, EmploymentType, ManagementType, PlanStatus, AgreementStatus, FundingCategory, ShiftStatus, ShiftType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper: a date this week at a specific hour in Brisbane time
function thisWeek(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  const currentDow = d.getDay(); // 0 = Sun
  const mondayOffset = currentDow === 0 ? -6 : 1 - currentDow;
  d.setDate(d.getDate() + mondayOffset + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log('Seeding demo data...');

  // Find the first organisation (the one you registered via the UI)
  const org = await prisma.organisation.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });

  if (!org) {
    console.error('No organisation found. Register an account first via the UI, then re-run this seed.');
    process.exit(1);
  }

  console.log(`Seeding into organisation: ${org.name} (${org.id})`);

  // ------------------------------------------------------------
  // 1. Support workers (3)
  // ------------------------------------------------------------
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const workers = await Promise.all([
    prisma.user.upsert({
      where: { organisationId_email: { organisationId: org.id, email: 'sarah.nguyen@demo.nutrix.com.au' } },
      update: {},
      create: {
        organisationId: org.id,
        email: 'sarah.nguyen@demo.nutrix.com.au',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Nguyen',
        role: UserRole.SUPPORT_WORKER,
        phone: '+61400000001',
        isActive: true,
        employmentType: EmploymentType.PART_TIME,
        hourlyRate: 38.50,
      },
    }),
    prisma.user.upsert({
      where: { organisationId_email: { organisationId: org.id, email: 'james.okafor@demo.nutrix.com.au' } },
      update: {},
      create: {
        organisationId: org.id,
        email: 'james.okafor@demo.nutrix.com.au',
        passwordHash,
        firstName: 'James',
        lastName: 'Okafor',
        role: UserRole.SUPPORT_WORKER,
        phone: '+61400000002',
        isActive: true,
        employmentType: EmploymentType.CASUAL,
        hourlyRate: 42.00,
      },
    }),
    prisma.user.upsert({
      where: { organisationId_email: { organisationId: org.id, email: 'priya.patel@demo.nutrix.com.au' } },
      update: {},
      create: {
        organisationId: org.id,
        email: 'priya.patel@demo.nutrix.com.au',
        passwordHash,
        firstName: 'Priya',
        lastName: 'Patel',
        role: UserRole.SUPPORT_WORKER,
        phone: '+61400000003',
        isActive: true,
        employmentType: EmploymentType.FULL_TIME,
        hourlyRate: 40.00,
      },
    }),
  ]);

  console.log(`  ✓ ${workers.length} support workers`);

  // ------------------------------------------------------------
  // 2. Participants (3)
  // ------------------------------------------------------------
  const participantsData = [
    { ndisNumber: '430000001', firstName: 'Tom', lastName: 'Walker', dob: '1995-03-14' },
    { ndisNumber: '430000002', firstName: 'Aisha', lastName: 'Rahman', dob: '1988-07-22' },
    { ndisNumber: '430000003', firstName: 'Lucas', lastName: 'Bennett', dob: '2001-11-05' },
  ];

  const participants = await Promise.all(
    participantsData.map((p) =>
      prisma.participant.upsert({
        where: { organisationId_ndisNumber: { organisationId: org.id, ndisNumber: p.ndisNumber } },
        update: {},
        create: {
          organisationId: org.id,
          ndisNumber: p.ndisNumber,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: new Date(p.dob),
          managementType: ManagementType.PLAN_MANAGED,
          email: `${p.firstName.toLowerCase()}@example.com`,
          phone: '+61400000000',
        },
      }),
    ),
  );

  console.log(`  ✓ ${participants.length} participants`);

  // ------------------------------------------------------------
  // 3. NDIS plan + service agreement + 1 line item per participant
  // ------------------------------------------------------------
  const now = new Date();
  const planStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const planEnd = new Date(now.getFullYear() + 1, now.getMonth() - 1, 1);

  const agreementItems: { id: string; participantId: string }[] = [];

  for (const participant of participants) {
    // Only create the plan if one doesn't exist
    let plan = await prisma.ndisPlan.findFirst({
      where: { participantId: participant.id, status: PlanStatus.ACTIVE },
    });

    if (!plan) {
      plan = await prisma.ndisPlan.create({
        data: {
          participantId: participant.id,
          planStartDate: planStart,
          planEndDate: planEnd,
          status: PlanStatus.ACTIVE,
          totalBudget: 85000,
          coreBudget: 60000,
          capacityBuildingBudget: 20000,
          capitalBudget: 5000,
        },
      });
    }

    let agreement = await prisma.serviceAgreement.findFirst({
      where: { participantId: participant.id, status: AgreementStatus.ACTIVE },
      include: { lineItems: true },
    });

    if (!agreement) {
      agreement = await prisma.serviceAgreement.create({
        data: {
          organisationId: org.id,
          participantId: participant.id,
          ndisPlanId: plan.id,
          startDate: planStart,
          endDate: planEnd,
          status: AgreementStatus.ACTIVE,
          signedAt: planStart,
          lineItems: {
            create: {
              supportItemNumber: '01_011_0107_1_1',
              supportItemName: 'Assistance With Self-Care Activities - Standard - Weekday Daytime',
              category: FundingCategory.CORE,
              unitPrice: 65.47,
              allocatedQty: 500,
              allocatedBudget: 32735,
            },
          },
        },
        include: { lineItems: true },
      });
    }

    agreementItems.push({ id: agreement.lineItems[0].id, participantId: participant.id });
  }

  console.log(`  ✓ ${agreementItems.length} service agreement items`);

  // ------------------------------------------------------------
  // 4. Shifts — spread across this week
  // ------------------------------------------------------------
  // Clear any existing demo shifts for idempotency (only the ones we seeded)
  await prisma.shift.deleteMany({
    where: {
      organisationId: org.id,
      notes: { startsWith: '[demo-seed]' },
    },
  });

  const shiftSpecs = [
    // [dayOffset, startHour, endHour, workerIndex, participantIndex]
    [0, 9, 13, 0, 0], // Mon 9-13 Sarah/Tom
    [0, 14, 18, 1, 1], // Mon 14-18 James/Aisha
    [1, 8, 12, 2, 2], // Tue 8-12 Priya/Lucas
    [1, 13, 17, 0, 1], // Tue 13-17 Sarah/Aisha
    [2, 9, 15, 1, 0], // Wed 9-15 James/Tom
    [2, 16, 20, 2, 2], // Wed 16-20 Priya/Lucas
    [3, 7, 11, 0, 2], // Thu 7-11 Sarah/Lucas
    [3, 12, 16, 2, 0], // Thu 12-16 Priya/Tom
    [4, 9, 13, 1, 1], // Fri 9-13 James/Aisha
    [5, 10, 14, 0, 0], // Sat 10-14 Sarah/Tom
  ];

  const shifts = await Promise.all(
    shiftSpecs.map(([dayOffset, startH, endH, workerIdx, participantIdx]) =>
      prisma.shift.create({
        data: {
          organisationId: org.id,
          participantId: participants[participantIdx].id,
          userId: workers[workerIdx].id,
          serviceAgreementItemId: agreementItems[participantIdx].id,
          scheduledStart: thisWeek(dayOffset, startH),
          scheduledEnd: thisWeek(dayOffset, endH),
          status: ShiftStatus.SCHEDULED,
          shiftType: ShiftType.STANDARD,
          breakMinutes: (endH - startH) >= 6 ? 30 : 0,
          notes: '[demo-seed] Sprint 11 demo shift',
        },
      }),
    ),
  );

  console.log(`  ✓ ${shifts.length} shifts`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
