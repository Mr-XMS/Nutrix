import { PrismaClient, FundingCategory, SupportUnit } from '@prisma/client';

const prisma = new PrismaClient();

const EFFECTIVE_FROM = new Date('2025-07-01');

const supportItems = [
  {
    supportItemNumber: '01_011_0107_1_1',
    supportItemName: 'Assistance With Self-Care Activities - Standard - Weekday Daytime',
    registrationGroup: '0107 - Daily Personal Activities',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 67.56,
    priceLimitRemote: 94.58,
    priceLimitVeryRemote: 101.34,
  },
  {
    supportItemNumber: '01_015_0107_1_1',
    supportItemName: 'Assistance With Self-Care Activities - Standard - Weekday Evening',
    registrationGroup: '0107 - Daily Personal Activities',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 74.44,
    priceLimitRemote: 104.22,
    priceLimitVeryRemote: 111.66,
  },
  {
    supportItemNumber: '01_002_0107_1_1',
    supportItemName: 'Assistance With Self-Care Activities - Standard - Weekday Night',
    registrationGroup: '0107 - Daily Personal Activities',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 75.82,
    priceLimitRemote: 106.15,
    priceLimitVeryRemote: 113.73,
  },
  {
    supportItemNumber: '01_013_0107_1_1',
    supportItemName: 'Assistance With Self-Care Activities - Standard - Saturday',
    registrationGroup: '0107 - Daily Personal Activities',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 95.07,
    priceLimitRemote: 133.10,
    priceLimitVeryRemote: 142.61,
  },
  {
    supportItemNumber: '01_014_0107_1_1',
    supportItemName: 'Assistance With Self-Care Activities - Standard - Sunday',
    registrationGroup: '0107 - Daily Personal Activities',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 122.59,
    priceLimitRemote: 171.63,
    priceLimitVeryRemote: 183.89,
  },
  {
    supportItemNumber: '01_010_0107_1_1',
    supportItemName: 'Assistance With Self-Care Activities - Standard - Public Holiday',
    registrationGroup: '0107 - Daily Personal Activities',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 150.10,
    priceLimitRemote: 210.14,
    priceLimitVeryRemote: 225.15,
  },
  {
    supportItemNumber: '01_799_0107_1_1',
    supportItemName: 'Assistance With Self-Care Activities - Night-Time Sleepover',
    registrationGroup: '0107 - Daily Personal Activities',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.EACH,
    priceLimit: 286.56,
    priceLimitRemote: 401.18,
    priceLimitVeryRemote: 429.84,
  },
  {
    supportItemNumber: '04_104_0125_6_1',
    supportItemName: 'Access Community Social And Rec Activ - Standard - Weekday Daytime',
    registrationGroup: '0125 - Participation in Community',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 67.56,
    priceLimitRemote: 94.58,
    priceLimitVeryRemote: 101.34,
  },
  {
    supportItemNumber: '04_103_0125_6_1',
    supportItemName: 'Access Community Social And Rec Activ - Standard - Weekday Evening',
    registrationGroup: '0125 - Participation in Community',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 74.44,
    priceLimitRemote: 104.22,
    priceLimitVeryRemote: 111.66,
  },
  {
    supportItemNumber: '04_102_0125_6_1',
    supportItemName: 'Access Community Social And Rec Activ - Standard - Saturday',
    registrationGroup: '0125 - Participation in Community',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 95.07,
    priceLimitRemote: 133.10,
    priceLimitVeryRemote: 142.61,
  },
  {
    supportItemNumber: '04_101_0125_6_1',
    supportItemName: 'Access Community Social And Rec Activ - Standard - Sunday',
    registrationGroup: '0125 - Participation in Community',
    supportCategory: FundingCategory.CORE,
    unit: SupportUnit.HOUR,
    priceLimit: 122.59,
    priceLimitRemote: 171.63,
    priceLimitVeryRemote: 183.89,
  },
  {
    supportItemNumber: '07_001_0106_8_3',
    supportItemName: 'Support Coordination Level 2: Coordination Of Supports',
    registrationGroup: '0106 - Assistance in Coordinating or Managing Life Stages, Transitions and Supports',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 100.14,
    priceLimitRemote: 140.20,
    priceLimitVeryRemote: 150.21,
  },
  {
    supportItemNumber: '07_004_0132_8_3',
    supportItemName: 'Specialist Support Coordination Level 3',
    registrationGroup: '0132 - Specialist Support Coordination',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 190.54,
    priceLimitRemote: 266.76,
    priceLimitVeryRemote: 285.81,
  },
  {
    supportItemNumber: '15_038_0117_1_3',
    supportItemName: 'Individual Counselling',
    registrationGroup: '0117 - Development of Daily Living and Life Skills',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 156.16,
    priceLimitRemote: 218.62,
    priceLimitVeryRemote: 234.24,
  },
  {
    supportItemNumber: '09_009_0117_6_3',
    supportItemName: 'Life Transition Planning Including Mentoring Peer-Support And Individual Skill Development',
    registrationGroup: '0117 - Development of Daily Living and Life Skills',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 67.56,
    priceLimitRemote: 94.58,
    priceLimitVeryRemote: 101.34,
  },
  {
    supportItemNumber: '15_056_0128_1_3',
    supportItemName: 'Assessment Recommendation Therapy or Training - Physiotherapist',
    registrationGroup: '0128 - Therapeutic Supports',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 224.62,
    priceLimitRemote: 314.47,
    priceLimitVeryRemote: 336.93,
  },
  {
    supportItemNumber: '15_054_0128_1_3',
    supportItemName: 'Assessment Recommendation Therapy or Training - Occupational Therapist',
    registrationGroup: '0128 - Therapeutic Supports',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 224.62,
    priceLimitRemote: 314.47,
    priceLimitVeryRemote: 336.93,
  },
  {
    supportItemNumber: '15_055_0128_1_3',
    supportItemName: 'Assessment Recommendation Therapy or Training - Psychologist',
    registrationGroup: '0128 - Therapeutic Supports',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 234.83,
    priceLimitRemote: 328.76,
    priceLimitVeryRemote: 352.25,
  },
  {
    supportItemNumber: '15_053_0128_1_3',
    supportItemName: 'Assessment Recommendation Therapy or Training - Speech Pathologist',
    registrationGroup: '0128 - Therapeutic Supports',
    supportCategory: FundingCategory.CAPACITY_BUILDING,
    unit: SupportUnit.HOUR,
    priceLimit: 193.99,
    priceLimitRemote: 271.59,
    priceLimitVeryRemote: 290.99,
  },
  {
    supportItemNumber: '05_220232801_0103_1_2',
    supportItemName: 'Assistive Equipment For Recreation - Sports Wheelchair',
    registrationGroup: '0103 - Assistive Products for Personal Care and Safety',
    supportCategory: FundingCategory.CAPITAL,
    unit: SupportUnit.EACH,
    priceLimit: 5500.00,
  },
  {
    supportItemNumber: '05_222100431_0124_1_2',
    supportItemName: 'Hoist - Mobile - Manual',
    registrationGroup: '0124 - Communication and Information Equipment',
    supportCategory: FundingCategory.CAPITAL,
    unit: SupportUnit.EACH,
    priceLimit: 3500.00,
  },
  {
    supportItemNumber: '05_222403191_0103_1_2',
    supportItemName: 'Bed - Standard Adjustable - Single - Manual',
    registrationGroup: '0103 - Assistive Products for Personal Care and Safety',
    supportCategory: FundingCategory.CAPITAL,
    unit: SupportUnit.EACH,
    priceLimit: 2200.00,
  },
];

async function main() {
  console.log('Seeding NDIS Support Catalogue...');

  for (const item of supportItems) {
    await prisma.ndisSupportCatalogue.upsert({
      where: { supportItemNumber: item.supportItemNumber },
      update: {
        supportItemName: item.supportItemName,
        registrationGroup: item.registrationGroup,
        supportCategory: item.supportCategory,
        unit: item.unit,
        priceLimit: item.priceLimit,
        priceLimitRemote: item.priceLimitRemote,
        priceLimitVeryRemote: item.priceLimitVeryRemote,
        effectiveFrom: EFFECTIVE_FROM,
      },
      create: {
        ...item,
        effectiveFrom: EFFECTIVE_FROM,
      },
    });
  }

  console.log(`Seeded ${supportItems.length} support items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
