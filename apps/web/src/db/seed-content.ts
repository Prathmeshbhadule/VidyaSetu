import { offlineDb } from './offline-db.js';
import { Lesson, Video, Quiz, StudyMaterial } from '@vidya-setu/shared';

export const initialLessons: Lesson[] = [
  {
    id: '018f679a-ls01-7000-8000-000000000001',
    schoolId: 'global',
    title: 'Our Alphabet and Phonics (वर्णमाला व ध्वनी)',
    subject: 'LANGUAGE',
    grade: 1,
    level: 1,
    contentBlocks: [
      { id: 'b1', type: 'HEADING', content: 'Learning Letter Sounds' },
      {
        id: 'b2',
        type: 'PARAGRAPH',
        content: 'Every letter has its own sound. For example, "क" makes the sound /ka/ as in Kamal (Lotus).',
      },
      { id: 'b3', type: 'CALLOUT', content: 'Point to the picture of a lotus and say "क" loudly!' },
    ],
    status: 'PUBLISHED',
    estimatedMinutes: 10,
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: '018f679a-ls02-7000-8000-000000000002',
    schoolId: 'global',
    title: 'Numbers and Counting 1 to 20 (अंक आणि मोजणी)',
    subject: 'MATH',
    grade: 2,
    level: 2,
    contentBlocks: [
      { id: 'b1', type: 'HEADING', content: 'Counting with Everyday Objects' },
      {
        id: 'b2',
        type: 'PARAGRAPH',
        content: 'Count pebbles, sticks, or fingers. 1 apple plus 1 apple equals 2 apples!',
      },
    ],
    status: 'PUBLISHED',
    estimatedMinutes: 12,
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: '018f679a-ls03-7000-8000-000000000003',
    schoolId: 'global',
    title: 'Plants and Trees Around Us (आपल्या सभोवतालची झाडे)',
    subject: 'SCIENCE',
    grade: 3,
    level: 3,
    contentBlocks: [
      { id: 'b1', type: 'HEADING', content: 'Parts of a Plant' },
      {
        id: 'b2',
        type: 'PARAGRAPH',
        content: 'Roots absorb water from soil. Green leaves make food with sunlight.',
      },
    ],
    status: 'PUBLISHED',
    estimatedMinutes: 15,
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: '018f679a-ls04-7000-8000-000000000004',
    schoolId: 'global',
    title: 'Fun Addition & Subtraction (मजेदार बेरीज व वजाबाकी)',
    subject: 'MATH',
    grade: 2,
    level: 2,
    contentBlocks: [
      { id: 'b1', type: 'HEADING', content: 'Mental Math Addition' },
      {
        id: 'b2',
        type: 'PARAGRAPH',
        content: 'Simple mental math addition tricks using pebbles, sticks, and visual groups.',
      },
    ],
    status: 'PUBLISHED',
    estimatedMinutes: 11,
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

export const initialVideos: Video[] = [
  {
    id: 'vid-01',
    schoolId: 'global',
    lessonId: '018f679a-ls01-7000-8000-000000000001',
    title: 'Our Alphabet and Phonics (वर्णमाला व ध्वनी)',
    storageKey: 'offline-video-preset-1',
    durationSec: 180,
    bitrateKbps: 450,
    sizeBytes: 12582912,
    sha256: 'mock-sha-vid-01',
    transcodeStatus: 'READY',
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'vid-02',
    schoolId: 'global',
    lessonId: '018f679a-ls02-7000-8000-000000000002',
    title: 'Numbers and Counting 1 to 20 (अंक आणि मोजणी)',
    storageKey: 'offline-video-preset-2',
    durationSec: 240,
    bitrateKbps: 450,
    sizeBytes: 15728640,
    sha256: 'mock-sha-vid-02',
    transcodeStatus: 'READY',
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'vid-03',
    schoolId: 'global',
    lessonId: '018f679a-ls03-7000-8000-000000000003',
    title: 'Plants and Trees Around Us (आपल्या सभोवतालची झाडे)',
    storageKey: 'offline-video-preset-3',
    durationSec: 210,
    bitrateKbps: 450,
    sizeBytes: 14680064,
    sha256: 'mock-sha-vid-03',
    transcodeStatus: 'READY',
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'vid-04',
    schoolId: 'global',
    lessonId: '018f679a-ls04-7000-8000-000000000004',
    title: 'Fun Addition & Subtraction (मजेदार बेरीज व वजाबाकी)',
    storageKey: 'offline-video-preset-4',
    durationSec: 195,
    bitrateKbps: 450,
    sizeBytes: 13631488,
    sha256: 'mock-sha-vid-04',
    transcodeStatus: 'READY',
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

export const initialQuizzes: Quiz[] = [
  {
    id: 'quiz-lang-01',
    schoolId: 'global',
    lessonId: '018f679a-ls01-7000-8000-000000000001',
    title: 'वर्णमाला व ध्वनी दैनंदिन सराव (Phonics DPP)',
    subject: 'LANGUAGE',
    grade: 1,
    passingMarks: 6,
    totalMarks: 10,
    questions: [
      {
        id: 'q-l1',
        type: 'MCQ',
        level: 1,
        prompt: '"क" या अक्षरापासून सुरू होणारा शब्द कोणता?',
        options: [
          { id: 'opt-a', text: 'कमळ (Lotus)' },
          { id: 'opt-b', text: 'मका (Corn)' },
          { id: 'opt-c', text: 'घर (House)' },
          { id: 'opt-d', text: 'झाड (Tree)' },
        ],
        correctOptionId: 'opt-a',
        explanation: '"क" ने सुरू होणारा शब्द "कमळ" आहे.',
        marks: 5,
      },
      {
        id: 'q-l2',
        type: 'MCQ',
        level: 1,
        prompt: 'मराठी वर्णमालेत एकूण किती मुख्य स्वर आहेत?',
        options: [
          { id: 'opt-a', text: '५' },
          { id: 'opt-b', text: '१२' },
          { id: 'opt-c', text: '२६' },
          { id: 'opt-d', text: '३४' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'मराठीत १२ पारंपारिक स्वर मानले जातात.',
        marks: 5,
      },
    ],
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'quiz-math-01',
    schoolId: 'global',
    lessonId: '018f679a-ls02-7000-8000-000000000002',
    title: 'संख्याज्ञान व मोजणी सराव (Counting DPP)',
    subject: 'MATH',
    grade: 2,
    passingMarks: 6,
    totalMarks: 10,
    questions: [
      {
        id: 'q-m1',
        type: 'MCQ',
        level: 1,
        prompt: '७ नंतर येणारी संख्या कोणती?',
        options: [
          { id: 'opt-a', text: '६' },
          { id: 'opt-b', text: '८' },
          { id: 'opt-c', text: '९' },
          { id: 'opt-d', text: '१०' },
        ],
        correctOptionId: 'opt-b',
        explanation: '७ मध्ये १ मिळवल्यावर ८ येतात.',
        marks: 5,
      },
      {
        id: 'q-m2',
        type: 'MCQ',
        level: 1,
        prompt: '५ + ४ = ? (पाच अधिक चार किती?)',
        options: [
          { id: 'opt-a', text: '८' },
          { id: 'opt-b', text: '९' },
          { id: 'opt-c', text: '१०' },
          { id: 'opt-d', text: '७' },
        ],
        correctOptionId: 'opt-b',
        explanation: '५ + ४ = ९.',
        marks: 5,
      },
    ],
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'quiz-sci-01',
    schoolId: 'global',
    lessonId: '018f679a-ls03-7000-8000-000000000003',
    title: 'वनस्पती व निसर्ग सराव (Plants DPP)',
    subject: 'SCIENCE',
    grade: 3,
    passingMarks: 6,
    totalMarks: 10,
    questions: [
      {
        id: 'q-s1',
        type: 'MCQ',
        level: 1,
        prompt: 'झाडाची पाने कोणत्या रंगद्रव्यामुळे हिरवी दिसतात?',
        options: [
          { id: 'opt-a', text: 'हरितद्रव्य (Chlorophyll)' },
          { id: 'opt-b', text: 'पाणी' },
          { id: 'opt-c', text: 'माती' },
          { id: 'opt-d', text: 'ऑक्सिजन' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'पानांमधील क्लोरोफिल (हरितद्रव्य) मुळे रंग हिरवा दिसतो.',
        marks: 5,
      },
      {
        id: 'q-s2',
        type: 'MCQ',
        level: 1,
        prompt: 'झाडांना जमिनीतून पाणी कोण शोषून देते?',
        options: [
          { id: 'opt-a', text: 'मुळे (Roots)' },
          { id: 'opt-b', text: 'पाने (Leaves)' },
          { id: 'opt-c', text: 'फुले (Flowers)' },
          { id: 'opt-d', text: 'फळे (Fruits)' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'झाडांची मुळे जमिनीतील पाणी व क्षार शोषतात.',
        marks: 5,
      },
    ],
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

export const initialStudyMaterials: StudyMaterial[] = [
  {
    id: 'mat-01',
    schoolId: 'global',
    title: 'इयत्ता ३ री गणित पाठ्यपुस्तक - बालभारती',
    type: 'TEXTBOOK',
    subject: 'MATH',
    grade: 3,
    pages: 48,
    sizeBytes: 4404019,
    description:
      'महाराष्ट्र राज्य पाठ्यपुस्तक मंडळ (बालभारती) अधिकृत गणित पुस्तक - संख्याज्ञान, बेरीज, वजाबाकी व भौमितिक आकृत्या.',
    content: `इयत्ता ३ री गणित पाठ्यपुस्तक (Mathematics Textbook)\n\nअनुक्रमणिका:\n१. भौमितिक आकृत्यांची ओळख - कोन, कडा व शिरोबिंदू\n२. संख्याज्ञान - तीन अंकी संख्यांचे वाचन व लेखन\n३. बिनहातच्याची व हातच्याची बेरीज\n४. बिनउसन्याची व उसन्याची वजाबाकी\n५. गुणाकार पूर्वतयारी व पाढे तयार करणे\n\nप्रकरण १: तीन अंकी संख्याज्ञान\nउदा. शतक (१००), दशक (१०) आणि एकक (१). १०० + २० + ५ = १२५ (एकशे पंचवीस).`,
    downloadUrl: '/materials/math_grade3_balbharati.pdf',
    offlineReady: true,
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'mat-02',
    schoolId: 'global',
    title: 'परिसर अभ्यास व सामान्य विज्ञान हस्तलिखित नोट्स',
    type: 'NOTES',
    subject: 'SCIENCE',
    grade: 3,
    pages: 18,
    sizeBytes: 2097152,
    description:
      'शिक्षकांच्या हस्तलिखित स्पष्टीकरणासह जलचक्र, सजीव-निर्जीव आणि वनस्पतींची वाढ यावरील महत्त्वाचे मुद्दे.',
    content: `परिसर अभ्यास हस्तलिखित नोट्स (Science Teacher Notes)\n\nघटक: जलचक्र आणि वनस्पती\n\n१. वनस्पतींचे अवयव:\n- मुळे: जमिनीतील पाणी व क्षार शोषून घेतात.\n- खोड: झाडाला आधार देते व अन्न पोहोचवते.\n- पाने: सूर्यप्रकाशामध्ये अन्न तयार करतात (प्रकाशसंश्लेषण).\n\n२. पाण्याचे चक्र:\nउष्णता -> पाण्याचे बाष्पीभवन -> आकाशात ढग -> थंड हवा लागल्याने संघनन -> पाऊस!`,
    downloadUrl: '/materials/science_notes_std3.pdf',
    offlineReady: true,
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'mat-03',
    schoolId: 'global',
    title: 'मराठी वर्णमाला व ध्वनी स्वाध्याय पत्रिका',
    type: 'WORKSHEET',
    subject: 'LANGUAGE',
    grade: 1,
    pages: 12,
    sizeBytes: 1048576,
    description: 'अक्षर ओळख, चित्र-शब्द जोड्या आणि स्वरचिन्हांचा सराव करण्यासाठी रंगीत कार्यपत्रिका.',
    content: `मराठी भाषा स्वाध्याय पत्रिका (Vernacular Language Worksheet)\n\nस्वाध्याय १: अक्षराला गोल करा\nक - कमळ, कप, कपाट, करवत\nम - मका, मगर, मासा, मध\n\nस्वाध्याय २: रिकाम्या जागी योग्य शब्द भरा:\n१. आकाशामध्ये _______ चमकतो. (सूर्य / चंद्र)\n२. झाडावर गोड _______ पिकले आहेत. (आंबे / दगड)`,
    downloadUrl: '/materials/marathi_worksheet_std1.pdf',
    offlineReady: true,
    version: 1,
    deviceId: 'hub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

/**
 * Ensures initial offline content is seeded once into IndexedDB.
 * Subsequent launches respect deletions and never re-insert deleted content.
 */
export async function ensureContentSeeded(): Promise<void> {
  try {
    const isSeeded = await offlineDb.metadata.get('content_initialized');
    if (isSeeded && isSeeded.value === 'true') {
      return;
    }

    const currentLessonsCount = await offlineDb.lessons.count();
    if (currentLessonsCount > 0) {
      // Data already present from manual user additions
      await offlineDb.metadata.put({ key: 'content_initialized', value: 'true' });
      return;
    }

    // First time setup: seed initial curriculum assets
    await offlineDb.lessons.bulkPut(initialLessons);
    await offlineDb.videos.bulkPut(initialVideos);
    await offlineDb.quizzes.bulkPut(initialQuizzes);
    await offlineDb.studyMaterials.bulkPut(initialStudyMaterials);

    await offlineDb.metadata.put({ key: 'content_initialized', value: 'true' });
  } catch (err) {
    console.warn('ensureContentSeeded note:', err);
  }
}
