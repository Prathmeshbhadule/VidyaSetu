import { prisma } from './db/prisma.js';
import argon2 from 'argon2';
import crypto from 'crypto';
import { generateUuidV7 } from '@vidya-setu/shared';
import { logger } from './config/logger.js';

export async function runSeed() {
  logger.info('Starting Vidya Setu Database Seeding...');

  const defaultPasswordHash = await argon2.hash('Admin@1234', { type: argon2.argon2id });
  const teacherPasswordHash = await argon2.hash('Teacher@1234', { type: argon2.argon2id });
  const parentPasswordHash = await argon2.hash('Parent@1234', { type: argon2.argon2id });
  const studentPinHash = await argon2.hash('1234', { type: argon2.argon2id });

  // 1. Create District
  const districtId = '018f679a-0001-7000-8000-000000000001';
  const district = await prisma.district.upsert({
    where: { id: districtId },
    create: {
      id: districtId,
      name: 'Pune Rural District',
      state: 'Maharashtra',
    },
    update: {},
  });
  logger.info(`Seeded District: ${district.name}`);

  // 2. Create 2 Schools
  const school1Id = '018f679a-1111-7000-8000-000000000001';
  const school2Id = '018f679a-2222-7000-8000-000000000002';

  const school1 = await prisma.school.upsert({
    where: { id: school1Id },
    create: {
      id: school1Id,
      districtId: district.id,
      name: 'Zilla Parishad Primary School Khed',
      address: 'Village Khed, Taluka Khed, District Pune',
      registerNo: 'ZP-KHED-0102',
    },
    update: {},
  });

  const school2 = await prisma.school.upsert({
    where: { id: school2Id },
    create: {
      id: school2Id,
      districtId: district.id,
      name: 'Zilla Parishad High School Shirur',
      address: 'Main Road Shirur, District Pune',
      registerNo: 'ZP-SHIRUR-0205',
    },
    update: {},
  });
  logger.info(`Seeded Schools: ${school1.name}, ${school2.name}`);

  // 3. Create Demo Users for every role
  // Content Admin
  const contentAdminUser = await prisma.user.upsert({
    where: { username: 'contentadmin' },
    create: {
      id: '018f679a-ad01-7000-8000-000000000001',
      username: 'contentadmin',
      email: 'contentadmin@vidyasetu.local',
      role: 'CONTENT_ADMIN',
      language: 'en',
      passwordHash: defaultPasswordHash,
      admin: {
        create: {
          scope: 'CONTENT',
        },
      },
    },
    update: {},
  });

  // District Admin
  const districtAdminUser = await prisma.user.upsert({
    where: { username: 'districtadmin' },
    create: {
      id: '018f679a-ad02-7000-8000-000000000002',
      username: 'districtadmin',
      email: 'districtadmin@vidyasetu.local',
      role: 'DISTRICT_ADMIN',
      language: 'mr',
      passwordHash: defaultPasswordHash,
      admin: {
        create: {
          scope: 'DISTRICT',
          districtId: district.id,
        },
      },
    },
    update: {},
  });

  // Demo Teacher 1 (School 1)
  const teacherUser1 = await prisma.user.upsert({
    where: { username: 'teacher' },
    create: {
      id: '018f679a-tc01-7000-8000-000000000001',
      username: 'teacher',
      email: 'teacher@vidyasetu.local',
      role: 'TEACHER',
      schoolId: school1.id,
      language: 'mr',
      passwordHash: teacherPasswordHash,
      phone: '+919876543210',
    },
    update: {},
  });

  const teacherProfile1 = await prisma.teacherProfile.upsert({
    where: { teacherId: 'TCH-KHED-01' },
    create: {
      id: '018f679a-tp01-7000-8000-000000000001',
      userId: teacherUser1.id,
      schoolId: school1.id,
      teacherId: 'TCH-KHED-01',
      name: 'Sunil Patil',
      email: 'teacher@vidyasetu.local',
      phone: '+919876543210',
      deviceId: 'dev-hub-01',
    },
    update: {},
  });

  // Teacher 2 (School 1)
  const teacherUser2 = await prisma.user.upsert({
    where: { username: 'asha.deshmukh' },
    create: {
      id: '018f679a-tc02-7000-8000-000000000002',
      username: 'asha.deshmukh',
      email: 'asha@vidyasetu.local',
      role: 'TEACHER',
      schoolId: school1.id,
      language: 'mr',
      passwordHash: teacherPasswordHash,
    },
    update: {},
  });

  await prisma.teacherProfile.upsert({
    where: { teacherId: 'TCH-KHED-02' },
    create: {
      id: '018f679a-tp02-7000-8000-000000000002',
      userId: teacherUser2.id,
      schoolId: school1.id,
      teacherId: 'TCH-KHED-02',
      name: 'Asha Deshmukh',
      deviceId: 'dev-tablet-01',
    },
    update: {},
  });

  // Teacher 3 & 4 (School 2)
  const teacherUser3 = await prisma.user.upsert({
    where: { username: 'vikas.more' },
    create: {
      id: '018f679a-tc03-7000-8000-000000000003',
      username: 'vikas.more',
      email: 'vikas@vidyasetu.local',
      role: 'TEACHER',
      schoolId: school2.id,
      language: 'mr',
      passwordHash: teacherPasswordHash,
    },
    update: {},
  });

  await prisma.teacherProfile.upsert({
    where: { teacherId: 'TCH-SHIRUR-01' },
    create: {
      id: '018f679a-tp03-7000-8000-000000000003',
      userId: teacherUser3.id,
      schoolId: school2.id,
      teacherId: 'TCH-SHIRUR-01',
      name: 'Vikas More',
      deviceId: 'dev-hub-02',
    },
    update: {},
  });

  // Demo Parent / Guardian
  const parentUser = await prisma.user.upsert({
    where: { username: 'parent' },
    create: {
      id: '018f679a-pr01-7000-8000-000000000001',
      username: 'parent',
      email: 'parent@vidyasetu.local',
      role: 'GUARDIAN',
      language: 'mr',
      phone: '+919822012345',
      passwordHash: parentPasswordHash,
    },
    update: {},
  });

  const guardianProfile = await prisma.guardianProfile.upsert({
    where: { userId: parentUser.id },
    create: {
      id: '018f679a-gp01-7000-8000-000000000001',
      userId: parentUser.id,
      name: 'Ramesh Jadhav',
      phone: '+919822012345',
      relation: 'Father',
    },
    update: {},
  });
  logger.info('Seeded Staff and Demo Accounts');

  // 4. Create 30 Students across Grades 1-8
  const studentNames = [
    { name: 'Aarav Patil', gender: 'MALE', grade: 1, level: 1 },
    { name: 'Ananya Deshmukh', gender: 'FEMALE', grade: 1, level: 1 },
    { name: 'Rohit Kulkarni', gender: 'MALE', grade: 2, level: 2 },
    { name: 'Sneha More', gender: 'FEMALE', grade: 2, level: 2 },
    { name: 'Aditya Shinde', gender: 'MALE', grade: 3, level: 2 },
    { name: 'Pooja Jadhav', gender: 'FEMALE', grade: 3, level: 3 },
    { name: 'Karan Pawar', gender: 'MALE', grade: 3, level: 3 },
    { name: 'Riya Gaikwad', gender: 'FEMALE', grade: 4, level: 3 },
    { name: 'Omkar Bhosale', gender: 'MALE', grade: 4, level: 4 },
    { name: 'Tanvi Chavan', gender: 'FEMALE', grade: 4, level: 3 },
    { name: 'Prathamesh Kale', gender: 'MALE', grade: 5, level: 3 },
    { name: 'Sakshi Sawant', gender: 'FEMALE', grade: 5, level: 4 },
    { name: 'Siddharth Mane', gender: 'MALE', grade: 5, level: 4 },
    { name: 'Vaishnavi Thorat', gender: 'FEMALE', grade: 6, level: 3 },
    { name: 'Harshwardhan Gite', gender: 'MALE', grade: 6, level: 5 },
    { name: 'Meera Kadam', gender: 'FEMALE', grade: 6, level: 4 },
    { name: 'Soham Jagtap', gender: 'MALE', grade: 7, level: 4 },
    { name: 'Shreya Mohite', gender: 'FEMALE', grade: 7, level: 5 },
    { name: 'Yashraj Nikam', gender: 'MALE', grade: 7, level: 3 },
    { name: 'Kavita Salunkhe', gender: 'FEMALE', grade: 8, level: 4 },
    // School 2 Students
    { name: 'Digvijay Rane', gender: 'MALE', grade: 1, level: 1 },
    { name: 'Ishita Joshi', gender: 'FEMALE', grade: 2, level: 2 },
    { name: 'Tejas Sonawane', gender: 'MALE', grade: 3, level: 3 },
    { name: 'Divya Shelar', gender: 'FEMALE', grade: 4, level: 2 },
    { name: 'Manish Gawade', gender: 'MALE', grade: 5, level: 3 },
    { name: 'Kalyani Dhore', gender: 'FEMALE', grade: 6, level: 4 },
    { name: 'Abhishek Tambe', gender: 'MALE', grade: 7, level: 4 },
    { name: 'Archana Wagh', gender: 'FEMALE', grade: 8, level: 5 },
    { name: 'Ganesh Nalawade', gender: 'MALE', grade: 8, level: 3 },
    { name: 'Sunita Sharma', gender: 'FEMALE', grade: 5, level: 3 }, // Targeted for At-Risk demonstration
  ];

  const studentEntities: any[] = [];
  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const sId = `018f679a-st${(i + 1).toString().padStart(2, '0')}-7000-8000-000000000001`;
    const targetSchoolId = i < 20 ? school1.id : school2.id;
    const prn = `PRN2026${(1001 + i).toString()}`;

    const student = await prisma.studentProfile.upsert({
      where: { prn },
      create: {
        id: sId,
        schoolId: targetSchoolId,
        name: s.name,
        prn,
        grade: s.grade,
        gender: s.gender as any,
        assessedLevel: s.level,
        avatarId: `avatar-${(i % 6) + 1}`,
        pinHash: studentPinHash,
        parentalConsent: true,
        deviceId: 'dev-tablet-01',
      },
      update: {},
    });
    studentEntities.push(student);
  }

  // Link Demo Parent to Student (Pooja Jadhav - index 5)
  await prisma.guardianStudent.upsert({
    where: {
      guardianId_studentId: {
        guardianId: guardianProfile.id,
        studentId: studentEntities[5].id,
      },
    },
    create: {
      guardianId: guardianProfile.id,
      studentId: studentEntities[5].id,
    },
    update: {},
  });
  logger.info(`Seeded 30 students across Grades 1-8`);

  // 5. Seed 8 Government Schemes (labelled SAMPLE DATA)
  const schemesData = [
    {
      id: '018f679a-sc01-7000-8000-000000000001',
      name: 'PM POSHAN (Mid-Day Meal Scheme)',
      description: 'Provides hot nutritious cooked lunch every school day to enhance enrollment, retention, and nutrition.',
      girlSpecific: false,
      attendanceThreshold: 70,
      eligibilityRules: { minGrade: 1, maxGrade: 8, minAttendancePercent: 70 },
      requiredDocuments: ['School Enrollment Record', 'Parent Self-Declaration'],
      applicationSteps: ['Automatic enrollment on school admission', 'No separate application required'],
      whereToApply: 'School Headmaster Office',
      sourceUrl: 'https://pmposhan.education.gov.in',
      lastVerifiedAt: '2026-03-01',
    },
    {
      id: '018f679a-sc02-7000-8000-000000000002',
      name: 'RTE 25% Free Admission Scheme',
      description: 'Mandatory 25% reserved admission in entry-grade private schools with zero fees for economically weaker families.',
      girlSpecific: false,
      eligibilityRules: { minGrade: 1, maxGrade: 1, categories: ['BPL', 'EWS', 'SC', 'ST'] },
      requiredDocuments: ['Income Certificate (below ₹1 Lakh)', 'Birth Certificate', 'Proof of Address'],
      applicationSteps: ['Submit online application on State RTE Portal', 'Lottery allotment by Education Officer', 'Document verification at BEO'],
      whereToApply: 'Block Education Office / CSC Center',
      sourceUrl: 'https://rte25admission.maharashtra.gov.in',
      lastVerifiedAt: '2026-02-15',
    },
    {
      id: '018f679a-sc03-7000-8000-000000000003',
      name: 'Savitribai Phule Scholarship for Girl Students',
      description: 'Financial assistance for backward class girl students studying in Grades 5 to 10 to curb female dropout rates.',
      girlSpecific: true,
      attendanceThreshold: 75,
      eligibilityRules: { gender: 'FEMALE', minGrade: 5, maxGrade: 10, minAttendancePercent: 75 },
      requiredDocuments: ['Caste Certificate (SC/VJNT/SBC)', 'Previous Year Marksheet', 'Student Bank Passbook Copy'],
      applicationSteps: ['Collect form from Headmaster', 'Attach certified marksheet and bank passbook', 'School submits to Social Welfare Dept'],
      whereToApply: 'School Headmaster Office',
      sourceUrl: 'https://mahadbt.maharashtra.gov.in',
      lastVerifiedAt: '2026-01-20',
    },
    {
      id: '018f679a-sc04-7000-8000-000000000004',
      name: 'Ahilyabai Holkar Free Bus Travel Scheme for Girls',
      description: 'Free state transport (MSRTC) bus pass for rural girl students travelling from villages to school.',
      girlSpecific: true,
      attendanceThreshold: 75,
      eligibilityRules: { gender: 'FEMALE', minGrade: 5, maxGrade: 12 },
      requiredDocuments: ['School Bonafide Certificate', 'Distance Certificate from Gram Panchayat', 'Passport Photo (2 copies)'],
      applicationSteps: ['Obtain bonafide certificate from school', 'Submit application at nearest MSRTC Bus Depot'],
      whereToApply: 'MSRTC Bus Depot / Gram Panchayat',
      sourceUrl: 'https://msrtc.maharashtra.gov.in',
      lastVerifiedAt: '2026-02-10',
    },
    {
      id: '018f679a-sc05-7000-8000-000000000005',
      name: 'Pre-Matric Scholarship for SC/ST/OBC Students',
      description: 'Annual scholarship to cover school books, uniforms, and stationery for marginalized children.',
      girlSpecific: false,
      attendanceThreshold: 75,
      eligibilityRules: { minGrade: 1, maxGrade: 10, categories: ['SC', 'ST', 'OBC'] },
      requiredDocuments: ['Caste Certificate', 'Income Certificate (< ₹2.5 Lakh)', 'Bank Account Details'],
      applicationSteps: ['Apply on National Scholarship Portal (NSP)', 'School headmaster verification', 'District officer approval'],
      whereToApply: 'National Scholarship Portal (scholarships.gov.in) / CSC Center',
      sourceUrl: 'https://scholarships.gov.in',
      lastVerifiedAt: '2026-01-10',
    },
    {
      id: '018f679a-sc06-7000-8000-000000000006',
      name: 'National Means-cum-Merit Scholarship (NMMS)',
      description: '₹12,000 per annum merit scholarship for selected Grade 8 students to continue secondary schooling.',
      girlSpecific: false,
      attendanceThreshold: 80,
      eligibilityRules: { minGrade: 8, maxGrade: 8, minAttendancePercent: 80 },
      requiredDocuments: ['Grade 7 Annual Marksheet (>= 55%)', 'Income Certificate (< ₹3.5 Lakh)', 'Admit Card of NMMS Exam'],
      applicationSteps: ['Register for NMMS state examination in Grade 8', 'Qualify in Mental Ability (MAT) and Scholastic (SAT) tests'],
      whereToApply: 'Maharashtra State Council of Examination (MSCE Pune)',
      sourceUrl: 'https://www.mscepune.in',
      lastVerifiedAt: '2026-03-05',
    },
    {
      id: '018f679a-sc07-7000-8000-000000000007',
      name: 'Free Bicycle Scheme for Rural Secondary Girls',
      description: 'Provides a sturdy free bicycle to rural girls entering Grade 8 who reside more than 2 km from school.',
      girlSpecific: true,
      attendanceThreshold: 75,
      eligibilityRules: { gender: 'FEMALE', minGrade: 8, maxGrade: 8, isRural: true },
      requiredDocuments: ['School Enrollment Proof', 'Residence Distance Certificate from Sarpanch', 'BPL Ration Card Copy'],
      applicationSteps: ['Submit requisition form through school', 'Physical verification of village distance by Gram Sevak'],
      whereToApply: 'School Headmaster / Taluka Panchayat Samiti',
      sourceUrl: 'https://rural.maharashtra.gov.in',
      lastVerifiedAt: '2026-02-01',
    },
    {
      id: '018f679a-sc08-7000-8000-000000000008',
      name: 'Bal Sangopan Yojana (Foster Care Support)',
      description: 'Monthly foster stipend of ₹2,500 for children in distress (orphans, single parent, or critically ill parents) to ensure continuity of schooling.',
      girlSpecific: false,
      eligibilityRules: { minGrade: 1, maxGrade: 10 },
      requiredDocuments: ['Death Certificate of Parent (if applicable)', 'Medical Certificate (if illness)', 'Gram Panchayat Recommendation Letter', 'Ration Card'],
      applicationSteps: ['Application to District Child Protection Unit (DCPU)', 'Home investigation by Child Welfare Committee (CWC)'],
      whereToApply: 'District Child Protection Unit (DCPU) / Women & Child Development Dept',
      sourceUrl: 'https://womenchild.maharashtra.gov.in',
      lastVerifiedAt: '2026-01-15',
    },
  ];

  for (const s of schemesData) {
    await prisma.scheme.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        schoolId: 'global',
        name: s.name,
        description: `${s.description} [SAMPLE DATA - verify with the official source]`,
        girlSpecific: s.girlSpecific,
        attendanceThreshold: s.attendanceThreshold || null,
        eligibilityRules: s.eligibilityRules as any,
        requiredDocuments: s.requiredDocuments as any,
        applicationSteps: s.applicationSteps as any,
        whereToApply: s.whereToApply,
        sourceUrl: s.sourceUrl,
        lastVerifiedAt: s.lastVerifiedAt,
        version: 1,
        deviceId: 'cloud',
      },
      update: {},
    });
  }
  logger.info('Seeded 8 Government Welfare Schemes');

  // 6. Seed Support Facilities
  const facilities = [
    { name: 'Aaple Sarkar Seva Kendra (CSC) Khed', type: 'CSC_CENTER', address: 'Near Bus Stand, Khed', contactNumber: '+912135222100' },
    { name: 'Block Education Office (BEO) Khed', type: 'BLOCK_EDUCATION_OFFICE', address: 'Panchayat Samiti Compound, Khed', contactNumber: '+912135222345' },
    { name: 'Gram Panchayat Office Khed', type: 'GRAM_PANCHAYAT', address: 'Gram Bhavan, Khed Village', contactNumber: '+912135222890' },
    { name: 'Post Office & Banking Khed', type: 'POST_OFFICE', address: 'Bazaar Peth, Khed', contactNumber: '+912135222011' },
    { name: 'Taluka Education Office Shirur', type: 'BLOCK_EDUCATION_OFFICE', address: 'Tehsil Complex, Shirur', contactNumber: '+912138222400' },
  ];

  for (let i = 0; i < facilities.length; i++) {
    const f = facilities[i];
    await prisma.facility.upsert({
      where: { id: `018f679a-fc${(i + 1).toString().padStart(2, '0')}-7000-8000-000000000001` },
      create: {
        id: `018f679a-fc${(i + 1).toString().padStart(2, '0')}-7000-8000-000000000001`,
        name: f.name,
        type: f.type,
        address: f.address,
        contactNumber: f.contactNumber,
        districtId: district.id,
      },
      update: {},
    });
  }

  // 7. Seed Lessons & Quizzes (3 Subjects: Marathi/Language, Math, Science in EN/HI/MR)
  const lessonsData = [
    {
      id: '018f679a-ls01-7000-8000-000000000001',
      title: 'Our Alphabet and Phonics (वर्णमाला व ध्वनी)',
      subject: 'LANGUAGE',
      grade: 1,
      level: 1,
      contentBlocks: [
        { id: 'b1', type: 'HEADING', content: 'Learning Letter Sounds' },
        { id: 'b2', type: 'PARAGRAPH', content: 'Every letter has its own sound. For example, "क" makes the sound /ka/ as in Kamal (Lotus).' },
        { id: 'b3', type: 'CALLOUT', content: 'Point to the picture of a lotus and say "क" loudly!' },
      ],
      estimatedMinutes: 10,
    },
    {
      id: '018f679a-ls02-7000-8000-000000000002',
      title: 'Numbers and Counting 1 to 20 (अंक आणि मोजणी)',
      subject: 'MATH',
      grade: 1,
      level: 1,
      contentBlocks: [
        { id: 'b1', type: 'HEADING', content: 'Counting with Objects' },
        { id: 'b2', type: 'PARAGRAPH', content: 'Count the five mangoes on the tree: 1, 2, 3, 4, 5. Add one more to get 6!' },
        { id: 'b3', type: 'CALLOUT', content: 'Can you hold up 7 fingers?' },
      ],
      estimatedMinutes: 15,
    },
    {
      id: '018f679a-ls03-7000-8000-000000000003',
      title: 'Plants and Trees Around Us (आपल्या सभोवतालची झाडे)',
      subject: 'SCIENCE',
      grade: 3,
      level: 2,
      contentBlocks: [
        { id: 'b1', type: 'HEADING', content: 'Parts of a Plant' },
        { id: 'b2', type: 'PARAGRAPH', content: 'Roots absorb water from soil. The green leaves prepare food using sunlight and air.' },
        { id: 'b3', type: 'CALLOUT', content: 'Notice how the neem tree in your schoolyard provides cool shade!' },
      ],
      estimatedMinutes: 15,
    },
    {
      id: '018f679a-ls04-7000-8000-000000000004',
      title: 'Addition and Subtraction with Bundles (दशक आणि बेरीज)',
      subject: 'MATH',
      grade: 3,
      level: 3,
      contentBlocks: [
        { id: 'b1', type: 'HEADING', content: 'Grouping in Tens' },
        { id: 'b2', type: 'PARAGRAPH', content: 'Ten loose sticks make one bundle of 10. Two bundles and 4 sticks equal 24.' },
      ],
      estimatedMinutes: 20,
    },
    {
      id: '018f679a-ls05-7000-8000-000000000005',
      title: 'The Water Cycle in Nature (जलचक्र)',
      subject: 'SCIENCE',
      grade: 5,
      level: 4,
      contentBlocks: [
        { id: 'b1', type: 'HEADING', content: 'Evaporation and Rain' },
        { id: 'b2', type: 'PARAGRAPH', content: 'Sun heat turns river and sea water into vapor. It rises, condenses into clouds, and falls as rain.' },
      ],
      estimatedMinutes: 20,
    },
  ];

  for (const l of lessonsData) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      create: {
        id: l.id,
        schoolId: 'global',
        title: l.title,
        subject: l.subject,
        grade: l.grade,
        level: l.level,
        contentBlocks: l.contentBlocks as any,
        status: 'PUBLISHED',
        estimatedMinutes: l.estimatedMinutes,
        version: 1,
        deviceId: 'cloud',
      },
      update: {},
    });
  }

  // 8. Seed 5 Quizzes with Level-tagged Questions (Levels 1 to 5)
  for (let i = 0; i < lessonsData.length; i++) {
    const l = lessonsData[i];
    const qId = `018f679a-qz${(i + 1).toString().padStart(2, '0')}-7000-8000-000000000001`;

    const quiz = await prisma.quiz.upsert({
      where: { id: qId },
      create: {
        id: qId,
        schoolId: 'global',
        lessonId: l.id,
        title: `${l.title} Quiz`,
        subject: l.subject,
        grade: l.grade,
        totalMarks: 10,
        passingMarks: 6,
        version: 1,
        deviceId: 'cloud',
      },
      update: {},
    });

    // Seed questions for this quiz
    const questions = [
      {
        id: `018f679a-qs${(i * 2 + 1).toString().padStart(2, '0')}-7000-8000-000000000001`,
        type: 'MCQ',
        prompt: `Question 1 on ${l.title}: Which of the following is correct?`,
        options: [
          { id: 'opt1', text: 'Correct first option' },
          { id: 'opt2', text: 'Second option' },
          { id: 'opt3', text: 'Third option' },
        ],
        correctOptionId: 'opt1',
        level: l.level,
        marks: 5,
      },
      {
        id: `018f679a-qs${(i * 2 + 2).toString().padStart(2, '0')}-7000-8000-000000000001`,
        type: 'TRUE_FALSE',
        prompt: `Is this statement true about ${l.title}?`,
        options: [
          { id: 't_opt', text: 'True (होय)' },
          { id: 'f_opt', text: 'False (नाही)' },
        ],
        correctOptionId: 't_opt',
        level: l.level,
        marks: 5,
      },
    ];

    for (const q of questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          quizId: quiz.id,
          type: q.type as any,
          prompt: q.prompt,
          options: q.options as any,
          correctOptionId: q.correctOptionId,
          level: q.level,
          marks: q.marks,
        },
        update: {},
      });
    }
  }
  logger.info('Seeded Lessons and Level-tagged Quizzes');

  // 9. Seed 2 Sample Videos
  await prisma.video.upsert({
    where: { id: '018f679a-vd01-7000-8000-000000000001' },
    create: {
      id: '018f679a-vd01-7000-8000-000000000001',
      lessonId: lessonsData[0].id,
      title: 'Phonics Letter Sounds Video Demo',
      storageKey: 'videos/phonics-intro-240p.mp4',
      durationSec: 120,
      bitrateKbps: 350,
      sizeBytes: 5242880, // 5 MB
      sha256: crypto.createHash('sha256').update('sample-video-1').digest('hex'),
      transcodeStatus: 'READY',
      version: 1,
      deviceId: 'cloud',
    },
    update: {},
  });

  await prisma.video.upsert({
    where: { id: '018f679a-vd02-7000-8000-000000000002' },
    create: {
      id: '018f679a-vd02-7000-8000-000000000002',
      lessonId: lessonsData[1].id,
      title: 'Counting 1 to 20 Animation',
      storageKey: 'videos/math-counting-240p.mp4',
      durationSec: 180,
      bitrateKbps: 380,
      sizeBytes: 8388608, // 8 MB
      sha256: crypto.createHash('sha256').update('sample-video-2').digest('hex'),
      transcodeStatus: 'READY',
      version: 1,
      deviceId: 'cloud',
    },
    update: {},
  });

  // 10. Seed 60 Days of Attendance Records (including realistic At-Risk patterns)
  logger.info('Seeding 60 days of attendance per student...');
  const today = new Date();

  for (let sIdx = 0; sIdx < studentEntities.length; sIdx++) {
    const student = studentEntities[sIdx];
    const isAtRiskDemo = student.name === 'Sunita Sharma'; // 50% attendance and consecutive absences

    for (let dayOffset = 59; dayOffset >= 0; dayOffset--) {
      const d = new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      // Skip Sundays
      if (d.getDay() === 0) continue;

      const dateStr = d.toISOString().split('T')[0];

      let status: 'PRESENT' | 'ABSENT' | 'LEAVE' = 'PRESENT';
      if (isAtRiskDemo) {
        // Last 6 school days absent (triggers consecutive absence rule)
        if (dayOffset <= 7) {
          status = 'ABSENT';
        } else if (dayOffset % 2 === 0) {
          status = 'ABSENT';
        }
      } else {
        // Normal student: occasional absence
        if ((sIdx + dayOffset) % 15 === 0) {
          status = 'ABSENT';
        }
      }

      await prisma.attendanceRecord.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date: dateStr,
          },
        },
        create: {
          id: generateUuidV7(d.getTime()),
          schoolId: student.schoolId,
          studentId: student.id,
          date: dateStr,
          status,
          markedBy: teacherProfile1.id,
          source: 'TEACHER',
          version: 1,
          deviceId: 'dev-tablet-01',
        },
        update: {},
      });
    }
  }

  // 11. Trigger initial At-Risk flags and Content Pack
  const atRiskStudent = studentEntities.find((s) => s.name === 'Sunita Sharma');
  if (atRiskStudent) {
    await prisma.atRiskFlag.upsert({
      where: { id: '018f679a-fl01-7000-8000-000000000001' },
      create: {
        id: '018f679a-fl01-7000-8000-000000000001',
        schoolId: atRiskStudent.schoolId,
        studentId: atRiskStudent.id,
        ruleId: 'RULE_ATTENDANCE_LOW',
        reason: 'Attendance dropped to 52% over the past 30 days (below 75% threshold)',
        attendancePercent: 52,
        consecutiveAbsences: 6,
        suggestedSchemeIds: ['018f679a-sc03-7000-8000-000000000003'], // Savitribai Phule Scholarship
        deviceId: 'cloud',
        version: 1,
      },
      update: {},
    });
  }

  logger.info('Database seeding completed successfully!');
}

// Auto-run if executed directly via tsx
if (process.argv[1] && process.argv[1].includes('seed')) {
  runSeed()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      logger.error({ err: e }, 'Seed error');
      await prisma.$disconnect();
      process.exit(1);
    });
}
