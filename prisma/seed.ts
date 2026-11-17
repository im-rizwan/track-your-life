import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================================
  // PHASE 1: REFERENCE TABLES (System-wide, no user dependencies)
  // ============================================================================

  console.log('📋 Seeding reference tables...');

  // Prayer Status Options
  const prayerStatuses = await Promise.all([
    prisma.prayerStatus.upsert({
      where: { name: 'PRAYED_ON_TIME' },
      update: {},
      create: {
        name: 'PRAYED_ON_TIME',
        label: 'Prayed on Time',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.prayerStatus.upsert({
      where: { name: 'PRAYED_LATE' },
      update: {},
      create: {
        name: 'PRAYED_LATE',
        label: 'Prayed Late',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.prayerStatus.upsert({
      where: { name: 'QADA' },
      update: {},
      create: {
        name: 'QADA',
        label: 'Qada',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.prayerStatus.upsert({
      where: { name: 'MISSED' },
      update: {},
      create: {
        name: 'MISSED',
        label: 'Missed',
        sortOrder: 4,
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✓ Created ${prayerStatuses.length} prayer statuses`);

  // Quran Activity Types
  const quranActivityTypes = await Promise.all([
    prisma.quranActivityType.upsert({
      where: { name: 'RECITATION' },
      update: {},
      create: {
        name: 'RECITATION',
        label: 'Recitation',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.quranActivityType.upsert({
      where: { name: 'MEMORIZATION' },
      update: {},
      create: {
        name: 'MEMORIZATION',
        label: 'Memorization',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.quranActivityType.upsert({
      where: { name: 'REVISION' },
      update: {},
      create: {
        name: 'REVISION',
        label: 'Revision',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.quranActivityType.upsert({
      where: { name: 'TAFSIR' },
      update: {},
      create: {
        name: 'TAFSIR',
        label: 'Tafsir',
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.quranActivityType.upsert({
      where: { name: 'TRANSLATION' },
      update: {},
      create: {
        name: 'TRANSLATION',
        label: 'Translation',
        sortOrder: 5,
        isActive: true,
      },
    }),
    prisma.quranActivityType.upsert({
      where: { name: 'LISTENING' },
      update: {},
      create: {
        name: 'LISTENING',
        label: 'Listening',
        sortOrder: 6,
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✓ Created ${quranActivityTypes.length} Quran activity types`);

  // Task Priority Levels
  const taskPriorities = await Promise.all([
    prisma.taskPriority.upsert({
      where: { name: 'HIGH' },
      update: {},
      create: {
        name: 'HIGH',
        label: 'High',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.taskPriority.upsert({
      where: { name: 'MEDIUM' },
      update: {},
      create: {
        name: 'MEDIUM',
        label: 'Medium',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.taskPriority.upsert({
      where: { name: 'LOW' },
      update: {},
      create: {
        name: 'LOW',
        label: 'Low',
        sortOrder: 3,
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✓ Created ${taskPriorities.length} task priorities`);

  // Task Status Options
  const taskStatuses = await Promise.all([
    prisma.taskStatus.upsert({
      where: { name: 'NOT_STARTED' },
      update: {},
      create: {
        name: 'NOT_STARTED',
        label: 'Not Started',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.taskStatus.upsert({
      where: { name: 'IN_PROGRESS' },
      update: {},
      create: {
        name: 'IN_PROGRESS',
        label: 'In Progress',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.taskStatus.upsert({
      where: { name: 'COMPLETED' },
      update: {},
      create: {
        name: 'COMPLETED',
        label: 'Completed',
        sortOrder: 3,
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✓ Created ${taskStatuses.length} task statuses`);

  // Fitness Intensity Levels
  const fitnessIntensities = await Promise.all([
    prisma.fitnessIntensity.upsert({
      where: { name: 'LOW' },
      update: {},
      create: {
        name: 'LOW',
        label: 'Low',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.fitnessIntensity.upsert({
      where: { name: 'MEDIUM' },
      update: {},
      create: {
        name: 'MEDIUM',
        label: 'Medium',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.fitnessIntensity.upsert({
      where: { name: 'HIGH' },
      update: {},
      create: {
        name: 'HIGH',
        label: 'High',
        sortOrder: 3,
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✓ Created ${fitnessIntensities.length} fitness intensities`);

  // ============================================================================
  // PHASE 2: DEFAULT CUSTOMIZATION OPTIONS (userId = null, isDefault = true)
  // ============================================================================

  console.log('\n🎨 Seeding default customization options...');

  // Default Prayer Locations
  const defaultPrayerLocationData = [
    { name: 'Masjid', isDefault: true, isActive: true },
    { name: 'Home (Jamaah)', isDefault: true, isActive: true },
    { name: 'Home (Individual)', isDefault: true, isActive: true },
    { name: 'Work', isDefault: true, isActive: true },
  ];

  const defaultPrayerLocations = [];
  for (const location of defaultPrayerLocationData) {
    const existing = await prisma.prayerLocation.findFirst({
      where: { userId: null, name: location.name },
    });
    if (!existing) {
      const created = await prisma.prayerLocation.create({ data: location });
      defaultPrayerLocations.push(created);
    } else {
      defaultPrayerLocations.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultPrayerLocations.length} default prayer locations`);

  // Default Other Prayer Types
  const defaultOtherPrayerTypeData = [
    { name: 'Tahajjud', isDefault: true, requiresRakahCount: true, isActive: true },
    { name: 'Duha', isDefault: true, requiresRakahCount: true, isActive: true },
    { name: 'Witr', isDefault: true, requiresRakahCount: true, isActive: true },
    { name: 'Eid', isDefault: true, requiresRakahCount: false, isActive: true },
  ];

  const defaultOtherPrayerTypes = [];
  for (const prayerType of defaultOtherPrayerTypeData) {
    const existing = await prisma.otherPrayerType.findFirst({
      where: { userId: null, name: prayerType.name },
    });
    if (!existing) {
      const created = await prisma.otherPrayerType.create({ data: prayerType });
      defaultOtherPrayerTypes.push(created);
    } else {
      defaultOtherPrayerTypes.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultOtherPrayerTypes.length} default other prayer types`);

  // Default Dhikr Types
  const defaultDhikrTypeData = [
    { name: 'SubhanAllah', isDefault: true, isActive: true },
    { name: 'Alhamdulillah', isDefault: true, isActive: true },
    { name: 'Allahu Akbar', isDefault: true, isActive: true },
    { name: 'Istighfar', isDefault: true, isActive: true },
  ];

  const defaultDhikrTypes = [];
  for (const dhikr of defaultDhikrTypeData) {
    const existing = await prisma.dhikrType.findFirst({
      where: { userId: null, name: dhikr.name },
    });
    if (!existing) {
      const created = await prisma.dhikrType.create({ data: dhikr });
      defaultDhikrTypes.push(created);
    } else {
      defaultDhikrTypes.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultDhikrTypes.length} default dhikr types`);

  // Default Fasting Types
  const defaultFastingTypeData = [
    { name: 'Ramadan', isDefault: true, isActive: true },
    { name: 'Ayyam Al Bidh', isDefault: true, isActive: true },
    { name: 'Arafah', isDefault: true, isActive: true },
    { name: 'Ashura', isDefault: true, isActive: true },
  ];

  const defaultFastingTypes = [];
  for (const fasting of defaultFastingTypeData) {
    const existing = await prisma.fastingType.findFirst({
      where: { userId: null, name: fasting.name },
    });
    if (!existing) {
      const created = await prisma.fastingType.create({ data: fasting });
      defaultFastingTypes.push(created);
    } else {
      defaultFastingTypes.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultFastingTypes.length} default fasting types`);

  // Default Charity Types
  const defaultCharityTypeData = [
    { name: 'Zakah', isDefault: true, isActive: true },
    { name: 'Sadaqah', isDefault: true, isActive: true },
    { name: 'Sadaqah Jariyah', isDefault: true, isActive: true },
  ];

  const defaultCharityTypes = [];
  for (const charity of defaultCharityTypeData) {
    const existing = await prisma.charityType.findFirst({
      where: { userId: null, name: charity.name },
    });
    if (!existing) {
      const created = await prisma.charityType.create({ data: charity });
      defaultCharityTypes.push(created);
    } else {
      defaultCharityTypes.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultCharityTypes.length} default charity types`);

  // Default Islamic Study Subjects
  const defaultIslamicStudySubjectData = [
    { name: 'Aqeedah', isDefault: true, isActive: true },
    { name: 'Fiqh', isDefault: true, isActive: true },
    { name: 'Hadith Studies', isDefault: true, isActive: true },
    { name: 'Seerah', isDefault: true, isActive: true },
    { name: 'Islamic History', isDefault: true, isActive: true },
  ];

  const defaultIslamicStudySubjects = [];
  for (const subject of defaultIslamicStudySubjectData) {
    const existing = await prisma.islamicStudySubject.findFirst({
      where: { userId: null, name: subject.name },
    });
    if (!existing) {
      const created = await prisma.islamicStudySubject.create({ data: subject });
      defaultIslamicStudySubjects.push(created);
    } else {
      defaultIslamicStudySubjects.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultIslamicStudySubjects.length} default Islamic study subjects`);

  // Default Study Modes
  const defaultStudyModeData = [
    { name: 'Reading Book', isDefault: true, isActive: true },
    { name: 'Online Course', isDefault: true, isActive: true },
    { name: 'Lecture Video', isDefault: true, isActive: true },
    { name: 'One on One with Teacher', isDefault: true, isActive: true },
    { name: 'Podcast', isDefault: true, isActive: true },
  ];

  const defaultStudyModes = [];
  for (const mode of defaultStudyModeData) {
    const existing = await prisma.studyMode.findFirst({
      where: { userId: null, name: mode.name },
    });
    if (!existing) {
      const created = await prisma.studyMode.create({ data: mode });
      defaultStudyModes.push(created);
    } else {
      defaultStudyModes.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultStudyModes.length} default study modes`);

  // Default Fitness Activities
  const defaultFitnessActivityData = [
    { name: 'Running', isDefault: true, isActive: true },
    { name: 'Swimming', isDefault: true, isActive: true },
    { name: 'Horse Riding', isDefault: true, isActive: true },
  ];

  const defaultFitnessActivities = [];
  for (const activity of defaultFitnessActivityData) {
    const existing = await prisma.fitnessActivity.findFirst({
      where: { userId: null, name: activity.name },
    });
    if (!existing) {
      const created = await prisma.fitnessActivity.create({ data: activity });
      defaultFitnessActivities.push(created);
    } else {
      defaultFitnessActivities.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultFitnessActivities.length} default fitness activities`);

  // Default Nutrition Foods
  const defaultNutritionFoodData = [
    { name: 'Dates', isDefault: true, isActive: true },
    { name: 'Olive Oil', isDefault: true, isActive: true },
    { name: 'Honey', isDefault: true, isActive: true },
  ];

  const defaultNutritionFoods = [];
  for (const food of defaultNutritionFoodData) {
    const existing = await prisma.nutritionFood.findFirst({
      where: { userId: null, name: food.name },
    });
    if (!existing) {
      const created = await prisma.nutritionFood.create({ data: food });
      defaultNutritionFoods.push(created);
    } else {
      defaultNutritionFoods.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultNutritionFoods.length} default nutrition foods`);

  // Default Fitrah Practices
  const defaultFitrahPracticeData = [
    { name: 'Miswak', isDefault: true, isActive: true },
    { name: 'Trimming Nails', isDefault: true, isActive: true },
    { name: 'Ghusl', isDefault: true, isActive: true },
  ];

  const defaultFitrahPractices = [];
  for (const practice of defaultFitrahPracticeData) {
    const existing = await prisma.fitrahPractice.findFirst({
      where: { userId: null, name: practice.name },
    });
    if (!existing) {
      const created = await prisma.fitrahPractice.create({ data: practice });
      defaultFitrahPractices.push(created);
    } else {
      defaultFitrahPractices.push(existing);
    }
  }
  console.log(`  ✓ Created ${defaultFitrahPractices.length} default fitrah practices`);

  // ============================================================================
  // PHASE 3: USER ACCOUNTS
  // ============================================================================

  console.log('\n👤 Seeding users...');

  const hashedPassword = await bcrypt.hash('Test@123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'ahmed@muhasabah.app' },
    update: {},
    create: {
      email: 'ahmed@muhasabah.app',
      password: hashedPassword,
      isEmailVerified: true,
      displayName: 'Ahmed Khan',
      age: 28,
      city: 'Jeddah',
      country: 'Saudi Arabia',
      isOnboarded: true,
      isActive: true,
      lastLoginAt: new Date('2026-02-04T10:00:00Z'),
    },
  });
  console.log(`  ✓ Created user: ${user1.email}`);

  const user2 = await prisma.user.upsert({
    where: { email: 'fatima@muhasabah.app' },
    update: {},
    create: {
      email: 'fatima@muhasabah.app',
      password: hashedPassword,
      isEmailVerified: true,
      displayName: 'Fatima Zahra',
      age: 24,
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      isOnboarded: true,
      isActive: true,
      lastLoginAt: new Date('2026-02-03T14:30:00Z'),
    },
  });
  console.log(`  ✓ Created user: ${user2.email}`);

  // ============================================================================
  // PHASE 4: USER-SPECIFIC CONFIGURATION
  // ============================================================================

  console.log('\n⚙️  Seeding user configurations...');

  // Prayer Times Config for User 1 (Automatic)
  await prisma.prayerTimesConfig.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      calculationMode: 'AUTOMATIC',
      apiMethod: 'MWL',
      lastFetchedAt: new Date('2026-02-04T00:00:00Z'),
      fajrAdjustment: 0,
      zuhrAdjustment: 0,
      asrAdjustment: 0,
      maghribAdjustment: 0,
      ishaAdjustment: 5, // 5 minutes delay
    },
  });
  console.log(`  ✓ Created prayer times config for ${user1.displayName} (Automatic)`);

  // Prayer Times Config for User 2 (Manual)
  await prisma.prayerTimesConfig.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      calculationMode: 'MANUAL',
      manualFajr: '05:45',
      manualZuhr: '13:15',
      manualAsr: '16:30',
      manualMaghrib: '19:00',
      manualIsha: '20:15',
      fajrAdjustment: 0,
      zuhrAdjustment: 0,
      asrAdjustment: 0,
      maghribAdjustment: 0,
      ishaAdjustment: 0,
    },
  });
  console.log(`  ✓ Created prayer times config for ${user2.displayName} (Manual)`);

  // ============================================================================
  // PHASE 5: USER CUSTOMIZATIONS
  // ============================================================================

  console.log('\n🎨 Seeding user-specific customizations...');

  // Custom Prayer Location for User 1
  const customLocation = await prisma.prayerLocation.upsert({
    where: { userId_name: { userId: user1.id, name: 'University Prayer Room' } },
    update: {},
    create: {
      userId: user1.id,
      name: 'University Prayer Room',
      isDefault: false,
      isActive: true,
    },
  });
  console.log(`  ✓ Created custom prayer location for ${user1.displayName}`);

  // Custom Dhikr Type for User 2
  const customDhikr = await prisma.dhikrType.upsert({
    where: { userId_name: { userId: user2.id, name: 'Salawat on Prophet' } },
    update: {},
    create: {
      userId: user2.id,
      name: 'Salawat on Prophet',
      isDefault: false,
      isActive: true,
    },
  });
  console.log(`  ✓ Created custom dhikr type for ${user2.displayName}`);

  // Skills for User 1
  const skillTypeScript = await prisma.skill.upsert({
    where: { userId_name: { userId: user1.id, name: 'TypeScript' } },
    update: {},
    create: {
      userId: user1.id,
      name: 'TypeScript',
      isActive: true,
    },
  });

  await prisma.skillTopic.upsert({
    where: { skillId_name: { skillId: skillTypeScript.id, name: 'Advanced Types' } },
    update: {},
    create: { skillId: skillTypeScript.id, name: 'Advanced Types', isPending: false },
  });
  await prisma.skillTopic.upsert({
    where: { skillId_name: { skillId: skillTypeScript.id, name: 'Generics' } },
    update: {},
    create: { skillId: skillTypeScript.id, name: 'Generics', isPending: true },
  });
  console.log(`  ✓ Created skill 'TypeScript' with 2 topics for ${user1.displayName}`);

  // Intentions for User 1
  const intentionFitness = await prisma.intention.upsert({
    where: { userId_name: { userId: user1.id, name: 'Get fit for Hajj' } },
    update: {},
    create: {
      userId: user1.id,
      name: 'Get fit for Hajj',
      isActive: true,
    },
  });
  console.log(`  ✓ Created intention for ${user1.displayName}`);

  // ============================================================================
  // PHASE 6: TRACKING LOGS
  // ============================================================================

  console.log('\n📊 Seeding tracking logs...');

  // Daily Prayer Logs for User 1
  await prisma.dailyPrayerLog.createMany({
    data: [
      {
        userId: user1.id,
        prayerName: 'FAJR',
        prayerStatusId: prayerStatuses[0].id, // PRAYED_ON_TIME
        prayerLocationId: defaultPrayerLocations[0].id, // Masjid
        khushuRating: 4,
        date: new Date('2026-02-04'),
        notes: 'Alhamdulillah, very peaceful prayer',
      },
      {
        userId: user1.id,
        prayerName: 'ZUHR',
        prayerStatusId: prayerStatuses[1].id, // PRAYED_LATE
        prayerLocationId: defaultPrayerLocations[3].id, // Work
        khushuRating: 3,
        date: new Date('2026-02-04'),
        notes: 'Meeting ran late',
      },
      {
        userId: user1.id,
        prayerName: 'ASR',
        prayerStatusId: prayerStatuses[0].id, // PRAYED_ON_TIME
        prayerLocationId: customLocation.id, // Custom location
        khushuRating: 5,
        date: new Date('2026-02-04'),
      },
    ],
  });
  console.log(`  ✓ Created 3 daily prayer logs for ${user1.displayName}`);

  // Other Prayer Log for User 2
  await prisma.otherPrayerLog.create({
    data: {
      userId: user2.id,
      otherPrayerTypeId: defaultOtherPrayerTypes[0].id, // Tahajjud
      rakahs: 8,
      date: new Date('2026-02-04'),
      notes: 'Last third of the night',
    },
  });
  console.log(`  ✓ Created other prayer log for ${user2.displayName}`);

  // Quran Log for User 1
  await prisma.quranLog.createMany({
    data: [
      {
        userId: user1.id,
        surahName: 'Al-Baqarah',
        surahNumber: 2,
        quranActivityTypeId: quranActivityTypes[0].id, // RECITATION
        versesCount: 50,
        juzzNumber: 1,
        date: new Date('2026-02-04'),
        notes: 'After Fajr',
      },
      {
        userId: user2.id,
        surahName: 'Al-Mulk',
        surahNumber: 67,
        quranActivityTypeId: quranActivityTypes[1].id, // MEMORIZATION
        versesCount: 10,
        juzzNumber: 29,
        date: new Date('2026-02-03'),
        notes: 'First 10 verses memorized',
      },
    ],
  });
  console.log(`  ✓ Created 2 Quran logs`);

  // Dhikr Log for User 2
  await prisma.dhikrLog.create({
    data: {
      userId: user2.id,
      dhikrTypeId: customDhikr.id, // Custom Salawat
      count: 100,
      date: new Date('2026-02-04'),
      notes: 'After Maghrib',
    },
  });
  console.log(`  ✓ Created dhikr log for ${user2.displayName}`);

  // Fasting Log for User 1
  await prisma.fastingLog.create({
    data: {
      userId: user1.id,
      fastingTypeId: defaultFastingTypes[1].id, // Ayyam Al Bidh
      date: new Date('2026-02-03'),
      notes: '13th of the month',
    },
  });
  console.log(`  ✓ Created fasting log for ${user1.displayName}`);

  // Charity Log for User 2
  await prisma.charityLog.create({
    data: {
      userId: user2.id,
      charityTypeId: defaultCharityTypes[1].id, // Sadaqah
      date: new Date('2026-02-04'),
      notes: 'Donated to local masjid',
    },
  });
  console.log(`  ✓ Created charity log for ${user2.displayName}`);

  // Islamic Study Log for User 1
  await prisma.islamicStudyLog.create({
    data: {
      userId: user1.id,
      subjectId: defaultIslamicStudySubjects[1].id, // Fiqh
      studyModeId: defaultStudyModes[0].id, // Reading Book
      durationMins: 45,
      date: new Date('2026-02-04'),
      notes: 'Studied purification chapter',
    },
  });
  console.log(`  ✓ Created Islamic study log for ${user1.displayName}`);

  // Skill Progress Log for User 1
  const topicAdvancedTypes = await prisma.skillTopic.findFirst({
    where: {
      skillId: skillTypeScript.id,
      name: 'Advanced Types',
    },
  });

  await prisma.skillProgressLog.create({
    data: {
      userId: user1.id,
      skillId: skillTypeScript.id,
      skillTopicId: topicAdvancedTypes?.id,
      progress: 75,
      date: new Date('2026-02-04'),
      notes: 'Completed union and intersection types',
    },
  });
  console.log(`  ✓ Created skill progress log for ${user1.displayName}`);

  // Fitness Log for User 1
  await prisma.fitnessLog.create({
    data: {
      userId: user1.id,
      fitnessActivityId: defaultFitnessActivities[0].id, // Running
      fitnessIntensityId: fitnessIntensities[1].id, // MEDIUM
      quantity: 30,
      quantityUnit: 'minutes',
      date: new Date('2026-02-04'),
      notes: '5km run',
    },
  });
  console.log(`  ✓ Created fitness log for ${user1.displayName}`);

  // Nutrition Log for User 2
  await prisma.nutritionLog.create({
    data: {
      userId: user2.id,
      nutritionFoodId: defaultNutritionFoods[0].id, // Dates
      quantity: '7 dates',
      date: new Date('2026-02-04'),
      notes: 'For iftar',
    },
  });
  console.log(`  ✓ Created nutrition log for ${user2.displayName}`);

  // Sleep Log for User 1
  await prisma.sleepLog.create({
    data: {
      userId: user1.id,
      bedtime: new Date('2026-02-03T23:00:00Z'),
      wakeupTime: new Date('2026-02-04T05:30:00Z'),
      sleepQuality: 4,
      date: new Date('2026-02-04'),
      notes: 'Good quality sleep',
    },
  });
  console.log(`  ✓ Created sleep log for ${user1.displayName}`);

  // Fitrah Practice Log for User 2 (many-to-many)
  const fitrahLog = await prisma.fitrahPracticeLog.create({
    data: {
      userId: user2.id,
      date: new Date('2026-02-04'),
      notes: 'Friday routine',
    },
  });

  await prisma.fitrahPracticeOnLog.createMany({
    data: [
      {
        logId: fitrahLog.id,
        practiceId: defaultFitrahPractices[0].id, // Miswak
      },
      {
        logId: fitrahLog.id,
        practiceId: defaultFitrahPractices[1].id, // Trimming Nails
      },
    ],
  });
  console.log(`  ✓ Created fitrah practice log with 2 practices for ${user2.displayName}`);

  // Task for User 1 (linked to intention)
  await prisma.task.create({
    data: {
      userId: user1.id,
      intentionId: intentionFitness.id,
      title: 'Complete 30-minute cardio workout',
      taskPriorityId: taskPriorities[0].id, // HIGH
      taskStatusId: taskStatuses[2].id, // COMPLETED
      date: new Date('2026-02-04'),
      notes: 'Part of fitness journey',
    },
  });
  console.log(`  ✓ Created task for ${user1.displayName}`);

  // Intention Log for User 1
  await prisma.intentionLog.create({
    data: {
      userId: user1.id,
      intentionId: intentionFitness.id,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-08-31'),
      date: new Date('2026-02-04'),
      notes: 'Seven-month fitness journey for Hajj preparation',
    },
  });
  console.log(`  ✓ Created intention log for ${user1.displayName}`);

  // ============================================================================
  // PHASE 7: AUDIT LOGS
  // ============================================================================

  console.log('\n📝 Seeding audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        userId: user1.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user1.id,
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
        },
      },
      {
        userId: user1.id,
        action: 'PRAYER_LOGGED',
        entity: 'DailyPrayerLog',
        entityId: 'log-001',
        metadata: {
          prayerName: 'FAJR',
          status: 'PRAYED_ON_TIME',
        },
      },
      {
        userId: user2.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user2.id,
        metadata: {
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0',
        },
      },
    ],
  });
  console.log(`  ✓ Created 3 audit logs`);

  // ============================================================================
  // SEEDING COMPLETE
  // ============================================================================

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  • Reference tables populated with system defaults');
  console.log('  • 2 test users created (password: Test@123)');
  console.log('  • User configurations and customizations added');
  console.log('  • Sample tracking logs across all categories created');
  console.log('  • Audit trail initialized\n');
  console.log('🔐 Test Credentials:');
  console.log('  Email: ahmed@muhasabah.app | Password: Test@123');
  console.log('  Email: fatima@muhasabah.app | Password: Test@123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
