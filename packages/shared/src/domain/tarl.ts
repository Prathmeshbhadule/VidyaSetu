import { StudentProfile } from '../types/index.js';

export interface TaRLActivity {
  id: string;
  level: number;
  title: string;
  description: string;
  subject: 'LANGUAGE' | 'MATH';
  durationMin: number;
  materialsNeeded: string[];
}

export interface TaRLGroup {
  level: number;
  groupName: string;
  description: string;
  studentIds: string[];
  students: StudentProfile[];
  recommendedActivities: TaRLActivity[];
}

export const TARL_ACTIVITIES: Record<number, TaRLActivity[]> = {
  1: [
    {
      id: 'act-1-lang',
      level: 1,
      title: 'Akshar Jhola (Letter Sound Bag)',
      description: 'Students pick cards with letters and make their phonetic sounds together with body gestures.',
      subject: 'LANGUAGE',
      durationMin: 20,
      materialsNeeded: ['Letter Flashcards', 'Cloth bag'],
    },
    {
      id: 'act-1-math',
      level: 1,
      title: 'Pebble Counting 1-9',
      description: 'Hands-on counting of pebbles/sticks and matching with numeral tokens.',
      subject: 'MATH',
      durationMin: 15,
      materialsNeeded: ['Pebbles', 'Sticks', 'Number cards 1-9'],
    },
  ],
  2: [
    {
      id: 'act-2-lang',
      level: 2,
      title: 'Word Chain (Shabd Shrunkhla)',
      description: 'Students take turns speaking a word starting with the ending sound of the previous word.',
      subject: 'LANGUAGE',
      durationMin: 20,
      materialsNeeded: ['Chalkboard', 'Chalk'],
    },
    {
      id: 'act-2-math',
      level: 2,
      title: 'Bundle & Stick Addition',
      description: 'Use bundles of 10 sticks to learn place value and 2-digit sums without carry-over.',
      subject: 'MATH',
      durationMin: 25,
      materialsNeeded: ['Sticks', 'Rubber bands'],
    },
  ],
  3: [
    {
      id: 'act-3-lang',
      level: 3,
      title: 'Paragraph Partner Reading',
      description: 'Students pair up to read a 4-line paragraph aloud, correcting and assisting each other.',
      subject: 'LANGUAGE',
      durationMin: 25,
      materialsNeeded: ['Level 3 graded reading cards'],
    },
    {
      id: 'act-3-math',
      level: 3,
      title: 'Market Play (Bazaar)',
      description: 'Simulate village market buying and selling to practice two-digit addition and subtraction.',
      subject: 'MATH',
      durationMin: 30,
      materialsNeeded: ['Play currency', 'Empty boxes/props'],
    },
  ],
  4: [
    {
      id: 'act-4-lang',
      level: 4,
      title: 'Story Retelling & Drawing',
      description: 'After reading a short folktale, students draw the main sequence and write 2 sentences in their own words.',
      subject: 'LANGUAGE',
      durationMin: 30,
      materialsNeeded: ['Drawing paper', 'Crayons', 'Storybooks'],
    },
    {
      id: 'act-4-math',
      level: 4,
      title: 'Array Multiplication with Seeds',
      description: 'Arrange seeds in rows and columns (e.g. 4 rows of 6) to grasp multiplication as repeated addition.',
      subject: 'MATH',
      durationMin: 25,
      materialsNeeded: ['Tamarind seeds', 'Grid sheet'],
    },
  ],
  5: [
    {
      id: 'act-5-lang',
      level: 5,
      title: 'Critical Thinking Questioning',
      description: 'Students debate "What would you do if you were the character?" and write an alternate story ending.',
      subject: 'LANGUAGE',
      durationMin: 35,
      materialsNeeded: ['Short story printouts', 'Notebooks'],
    },
    {
      id: 'act-5-math',
      level: 5,
      title: 'Multi-Step Village Word Problems',
      description: 'Solve real-life agricultural and grocery problems involving division and fractional portions.',
      subject: 'MATH',
      durationMin: 30,
      materialsNeeded: ['Word problem worksheets'],
    },
  ],
};

export const LEVEL_NAMES: Record<number, { name: string; description: string }> = {
  1: { name: 'Level 1: Beginner (Letter & Phonics)', description: 'Recognizing letters, letter sounds, and numbers 1-9' },
  2: { name: 'Level 2: Word (Simple Words)', description: 'Reading 2-3 letter words and single-digit arithmetic' },
  3: { name: 'Level 3: Paragraph (Sentences)', description: 'Reading connected sentences and 2-digit addition/subtraction' },
  4: { name: 'Level 4: Story (Fluency)', description: 'Reading stories fluently and basic multiplication/division' },
  5: { name: 'Level 5: Advanced (Comprehension)', description: 'Reading with deep comprehension and multi-step math' },
};

export function computeTaRLGroups(
  students: StudentProfile[],
  teacherOverrides: Record<string, number> = {}
): TaRLGroup[] {
  const groupsByLevel: Record<number, StudentProfile[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  for (const student of students) {
    const override = teacherOverrides[student.id];
    const effectiveLevel = override ? Math.max(1, Math.min(5, override)) : Math.max(1, Math.min(5, student.assessedLevel || 1));
    groupsByLevel[effectiveLevel].push(student);
  }

  const groups: TaRLGroup[] = [];

  for (let level = 1; level <= 5; level++) {
    const groupStudents = groupsByLevel[level];
    const meta = LEVEL_NAMES[level];
    groups.push({
      level,
      groupName: meta.name,
      description: meta.description,
      studentIds: groupStudents.map((s) => s.id),
      students: groupStudents,
      recommendedActivities: TARL_ACTIVITIES[level] || [],
    });
  }

  return groups;
}
