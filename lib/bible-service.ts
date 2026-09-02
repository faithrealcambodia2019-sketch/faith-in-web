/**
 * Faith In — Core Bible Service
 *
 * Centralizes bilingual Bible text processing, Khmer Standard & 1954 translations,
 * English translations (KJV, WEB, ASV), Concordance word studies, Daily Verse,
 * audio devotionals, and sermon note planners.
 */

export interface BibleBookInfo {
  name: string;
  khmerName: string;
  usfm: string;
  testament: "OT" | "NT";
  chapters: number;
}

export interface BibleVerse {
  v: number;
  text: string;
  reference?: string;
  khmerText?: string;
}

export interface BibleChapterResult {
  book: string;
  khmerBook: string;
  chapter: number;
  version: string;
  versionName: string;
  items: BibleVerse[];
  source: string;
  totalVerses: number;
  /**
   * "ready"          — `items` holds this chapter in the requested version.
   * "setup_required" — the licensed text is not available; `items` is empty.
   *
   * A chapter must never be returned as "ready" with text from a different
   * translation or language than `version` names. Faith In previously served
   * English World English Bible text stamped as KHMER_OLD_1954, which told
   * Khmer readers they were reading the 1954 Khmer Bible when they were not.
   */
  status?: "ready" | "setup_required";
  message?: string;
  readUrl?: string;
  setupUrl?: string;
  attribution?: string;
  attributionUrl?: string;
}

export interface ParallelChapterResult {
  book: string;
  khmerBook: string;
  chapter: number;
  version1: string;
  version1Name: string;
  version2: string;
  version2Name: string;
  items: Array<{
    v: number;
    text1: string;
    text2: string;
    reference: string;
  }>;
  totalVerses: number;
  version1Status?: "ready" | "setup_required";
  version2Status?: "ready" | "setup_required";
  version1Message?: string;
  version2Message?: string;
  readUrl?: string;
}

export interface DailyVerseResult {
  passage: string;
  ref: string;
  khmerRef: string;
  text: string;
  khmer: string;
  translation: string;
  devotionalTitle: string;
  reflection: string;
  reflectionKhmer: string;
  audioUrl: string;
  audioTitle: string;
  date: string;
}

export interface ConcordanceItem {
  word: string;
  original: string;
  transliteration: string;
  language: "Greek" | "Hebrew";
  strongs: string;
  definition: string;
  meaning: string;
  occurrences: number;
  keyVerses: string[];
}

export interface BibleQuote {
  text: string;
  author: string;
  title?: string;
  category: string;
  type: "preacher" | "general";
  source?: string;
}

export interface BibleMediaItem {
  id: string;
  title: string;
  khmerTitle?: string;
  speaker: string;
  duration: string;
  type: "audio" | "video";
  url: string;
  image: string;
  category: string;
}

export interface TypingPassage {
  id: string;
  title: string;
  reference: string;
  khmerRef: string;
  text: string;
  khmer: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

// -----------------------------------------------------------------------------
// 66 Bible Books Metadata (Old Testament + New Testament)
// -----------------------------------------------------------------------------
export const BIBLE_BOOKS: BibleBookInfo[] = [
  // Old Testament (39)
  { name: "Genesis", khmerName: "លោកុប្បត្តិ", usfm: "GEN", testament: "OT", chapters: 50 },
  { name: "Exodus", khmerName: "និក្ខមនំ", usfm: "EXO", testament: "OT", chapters: 40 },
  { name: "Leviticus", khmerName: "លេវីវិន័យ", usfm: "LEV", testament: "OT", chapters: 27 },
  { name: "Numbers", khmerName: "ជនគណនា", usfm: "NUM", testament: "OT", chapters: 36 },
  { name: "Deuteronomy", khmerName: "ចោទិយកថា", usfm: "DEU", testament: "OT", chapters: 34 },
  { name: "Joshua", khmerName: "យ៉ូស៊ូវ៉ា", usfm: "JOS", testament: "OT", chapters: 24 },
  { name: "Judges", khmerName: "ចៅហ្វាយ", usfm: "JDG", testament: "OT", chapters: 21 },
  { name: "Ruth", khmerName: "រូថ", usfm: "RUT", testament: "OT", chapters: 4 },
  { name: "1 Samuel", khmerName: "១ សាំយូអែល", usfm: "1SA", testament: "OT", chapters: 31 },
  { name: "2 Samuel", khmerName: "២ សាំយូអែល", usfm: "2SA", testament: "OT", chapters: 24 },
  { name: "1 Kings", khmerName: "១ ពង្សាវតាក្សត្រ", usfm: "1KI", testament: "OT", chapters: 22 },
  { name: "2 Kings", khmerName: "២ ពង្សាវតាក្សត្រ", usfm: "2KI", testament: "OT", chapters: 25 },
  { name: "1 Chronicles", khmerName: "១ របាក្សត្រ", usfm: "1CH", testament: "OT", chapters: 29 },
  { name: "2 Chronicles", khmerName: "២ របាក្សត្រ", usfm: "2CH", testament: "OT", chapters: 36 },
  { name: "Ezra", khmerName: "អែសរ៉ា", usfm: "EZR", testament: "OT", chapters: 10 },
  { name: "Nehemiah", khmerName: "នេហេមា", usfm: "NEH", testament: "OT", chapters: 13 },
  { name: "Esther", khmerName: "អេសធើរ", usfm: "EST", testament: "OT", chapters: 10 },
  { name: "Job", khmerName: "យ៉ូប", usfm: "JOB", testament: "OT", chapters: 42 },
  { name: "Psalms", khmerName: "ទំនុកតម្កើង", usfm: "PSA", testament: "OT", chapters: 150 },
  { name: "Proverbs", khmerName: "សុភាសិត", usfm: "PRO", testament: "OT", chapters: 31 },
  { name: "Ecclesiastes", khmerName: "សាស្ដា", usfm: "ECC", testament: "OT", chapters: 12 },
  { name: "Song of Solomon", khmerName: "បទចម្រៀងព្រះបាទសាឡូម៉ូន", usfm: "SNG", testament: "OT", chapters: 8 },
  { name: "Isaiah", khmerName: "អេសាយ", usfm: "ISA", testament: "OT", chapters: 66 },
  { name: "Jeremiah", khmerName: "យេរេមា", usfm: "JER", testament: "OT", chapters: 52 },
  { name: "Lamentations", khmerName: "បរិទេវ", usfm: "LAM", testament: "OT", chapters: 5 },
  { name: "Ezekiel", khmerName: "អេសេគាល", usfm: "EZK", testament: "OT", chapters: 48 },
  { name: "Daniel", khmerName: "ដានីយ៉ែល", usfm: "DAN", testament: "OT", chapters: 12 },
  { name: "Hosea", khmerName: "ហូសេ", usfm: "HOS", testament: "OT", chapters: 14 },
  { name: "Joel", khmerName: "យ៉ូអែល", usfm: "JOL", testament: "OT", chapters: 3 },
  { name: "Amos", khmerName: "អេម៉ុស", usfm: "AMO", testament: "OT", chapters: 9 },
  { name: "Obadiah", khmerName: "អូបាឌា", usfm: "OBA", testament: "OT", chapters: 1 },
  { name: "Jonah", khmerName: "យ៉ូណាស", usfm: "JON", testament: "OT", chapters: 4 },
  { name: "Micah", khmerName: "មីកា", usfm: "MIC", testament: "OT", chapters: 7 },
  { name: "Nahum", khmerName: "ណាហ៊ូម", usfm: "NAM", testament: "OT", chapters: 3 },
  { name: "Habakkuk", khmerName: "ហាបាគុក", usfm: "HAB", testament: "OT", chapters: 3 },
  { name: "Zephaniah", khmerName: "សេផានា", usfm: "ZEP", testament: "OT", chapters: 3 },
  { name: "Haggai", khmerName: "ហាកាយ", usfm: "HAG", testament: "OT", chapters: 2 },
  { name: "Zechariah", khmerName: "សាការី", usfm: "ZEC", testament: "OT", chapters: 14 },
  { name: "Malachi", khmerName: "ម៉ាឡាគី", usfm: "MAL", testament: "OT", chapters: 4 },

  // New Testament (27)
  { name: "Matthew", khmerName: "ម៉ាថាយ", usfm: "MAT", testament: "NT", chapters: 28 },
  { name: "Mark", khmerName: "ម៉ាកុស", usfm: "MRK", testament: "NT", chapters: 16 },
  { name: "Luke", khmerName: "លូកា", usfm: "LUK", testament: "NT", chapters: 24 },
  { name: "John", khmerName: "យ៉ូហាន", usfm: "JHN", testament: "NT", chapters: 21 },
  { name: "Acts", khmerName: "កិច្ចការ", usfm: "ACT", testament: "NT", chapters: 28 },
  { name: "Romans", khmerName: "រ៉ូម", usfm: "ROM", testament: "NT", chapters: 16 },
  { name: "1 Corinthians", khmerName: "១ កូរិនថូស", usfm: "1CO", testament: "NT", chapters: 16 },
  { name: "2 Corinthians", khmerName: "២ កូរិនថូស", usfm: "2CO", testament: "NT", chapters: 13 },
  { name: "Galatians", khmerName: "កាឡាទី", usfm: "GAL", testament: "NT", chapters: 6 },
  { name: "Ephesians", khmerName: "អេភេសូរ", usfm: "EPH", testament: "NT", chapters: 6 },
  { name: "Philippians", khmerName: "ភីលីព", usfm: "PHP", testament: "NT", chapters: 4 },
  { name: "Colossians", khmerName: "កូឡូស", usfm: "COL", testament: "NT", chapters: 4 },
  { name: "1 Thessalonians", khmerName: "១ ថែស្សាឡូនិច", usfm: "1TH", testament: "NT", chapters: 5 },
  { name: "2 Thessalonians", khmerName: "២ ថែស្សាឡូនិច", usfm: "2TH", testament: "NT", chapters: 3 },
  { name: "1 Timothy", khmerName: "១ ធីម៉ូថេ", usfm: "1TI", testament: "NT", chapters: 6 },
  { name: "2 Timothy", khmerName: "២ ធីម៉ូថេ", usfm: "2TI", testament: "NT", chapters: 4 },
  { name: "Titus", khmerName: "ទីតុស", usfm: "TIT", testament: "NT", chapters: 3 },
  { name: "Philemon", khmerName: "ភីលេម៉ូន", usfm: "PHM", testament: "NT", chapters: 1 },
  { name: "Hebrews", khmerName: "ហេព្រើរ", usfm: "HEB", testament: "NT", chapters: 13 },
  { name: "James", khmerName: "យ៉ាកុប", usfm: "JAS", testament: "NT", chapters: 5 },
  { name: "1 Peter", khmerName: "១ ពេត្រុស", usfm: "1PE", testament: "NT", chapters: 5 },
  { name: "2 Peter", khmerName: "២ ពេត្រុស", usfm: "2PE", testament: "NT", chapters: 3 },
  { name: "1 John", khmerName: "១ យ៉ូហាន", usfm: "1JN", testament: "NT", chapters: 5 },
  { name: "2 John", khmerName: "២ យ៉ូហាន", usfm: "2JN", testament: "NT", chapters: 1 },
  { name: "3 John", khmerName: "៣ យ៉ូហាន", usfm: "3JN", testament: "NT", chapters: 1 },
  { name: "Jude", khmerName: "យូដាស", usfm: "JUD", testament: "NT", chapters: 1 },
  { name: "Revelation", khmerName: "វិវរណៈ", usfm: "REV", testament: "NT", chapters: 22 },
];

export const BIBLE_VERSIONS = [
  { code: "KHMER_OLD_1954", label: "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប - Khmer Old Version)", lang: "km" },
  { code: "KJV", label: "King James Version (KJV)", lang: "en" },
  { code: "WEB", label: "World English Bible (WEB)", lang: "en" },
  { code: "ASV", label: "American Standard Version (ASV 1901)", lang: "en" },
  { code: "ESV", label: "English Standard Version (ESV)", lang: "en" },
];

// Helper to find book
export function findBibleBook(nameOrUsfm: string): BibleBookInfo {
  const query = (nameOrUsfm || "").trim().toLowerCase();
  const found = BIBLE_BOOKS.find(
    (b) =>
      b.name.toLowerCase() === query ||
      b.khmerName.toLowerCase() === query ||
      b.usfm.toLowerCase() === query ||
      (query === "psalm" && b.usfm === "PSA")
  );
  return found || BIBLE_BOOKS.find((b) => b.name === "John")!;
}

// -----------------------------------------------------------------------------
// Embedded Khmer 1954 Scripture Library (High-Fidelity Text)
// -----------------------------------------------------------------------------
const KHMER_SCRIPTURE_STORE: Record<string, Record<number, Record<number, string>>> = {
  John: {
    1: {
      1: "នៅដើមដំបូង មានព្រះបន្ទូល ព្រះបន្ទូលនៅជាមួយគ្នានឹងព្រះ ហើយព្រះបន្ទូលនោះឯងជាព្រះ។",
      2: "ព្រះបន្ទូលនោះឯង នៅដើមដំបូងទ្រង់នៅជាមួយគ្នានឹងព្រះ។",
      3: "គ្រប់របស់ទាំងអស់កើតមកដោយសារទ្រង់ ហើយក្នុងបណ្ដារបស់ដែលកើតមក គ្មានអ្វីមួយកើតមកដោយឥតទ្រង់ឡើយ។",
      4: "ក្នុងទ្រង់មានជីវិត ហើយជីវិតនោះជាពន្លឺនៃមនុស្សលោក។",
      5: "ពន្លឺនោះភ្លឺក្នុងសេចក្ដីងងឹត ហើយសេចក្ដីងងឹតមិនបានយល់ពន្លឺនោះឡើយ។",
      6: "មានមនុស្សម្នាក់ដែលព្រះបានចាត់ឲ្យមក ឈ្មោះយ៉ូហាន។",
      7: "គាត់បានមកសម្រាប់ជាសាក្សី ដើម្បីនឹងធ្វើបន្ទាល់ពីពន្លឺនោះ ឲ្យមនុស្សទាំងអស់បានជឿដោយសារគាត់។",
      8: "គាត់មិនមែនជាពន្លឺនោះទេ គឺគាត់មកគ្រាន់តែធ្វើបន្ទាល់ពីពន្លឺនោះប៉ុណ្ណោះ។",
      9: "ពន្លឺនោះជាពន្លឺដ៏ពិត ដែលបំភ្លឺដល់មនុស្សទាំងអស់ដែលកើតមកក្នុងលោកីយ៍។",
      10: "ទ្រង់បានគង់នៅក្នុងលោកីយ៍ ហើយលោកីយ៍បានកើតមកដោយសារទ្រង់ ប៉ុន្តែលោកីយ៍មិនបានស្គាល់ទ្រង់សោះ។",
      11: "ទ្រង់បានយាងមកឯរបស់ទ្រង់ ប៉ុន្តែពួកអ្នករបស់ទ្រង់មិនបានទទួលទ្រង់ទេ។",
      12: "ប៉ុន្តែអស់អ្នកណាដែលទទួលទ្រង់ គឺអស់អ្នកដែលជឿដល់ព្រះនាមទ្រង់ នោះទ្រង់បានប្រទានអំណាចឲ្យបានត្រឡប់ជាកូនព្រះ។",
      13: "ដែលកើតមកមិនមែនដោយសារឈាម ឬដោយសារចំណង់នៃសាច់ឈាម ឬដោយសារចំណង់នៃមនុស្សឡើយ គឺកើតមកដោយសារព្រះវិញ។",
      14: "ហើយព្រះបន្ទូលបានត្រឡប់ជាសាច់ឈាម ហើយបានសណ្ឋិតនៅកណ្ដាលយើងរាល់គ្នា (យើងបានឃើញសិរីល្អទ្រង់ គឺសិរីល្អដូចជាព្រះរាជបុត្រាតែមួយរបស់ព្រះវរបិតា) ពេញដោយព្រះគុណ និងសេចក្ដីពិត។",
      15: "យ៉ូហានបានធ្វើបន្ទាល់ពីទ្រង់ គាត់បានបន្លឺសំឡេងឡើងថា៖ «គឺព្រះអង្គនេះហើយ ដែលខ្ញុំបាននិយាយថា៖ ព្រះអង្គដែលយាងមកក្រោយខ្ញុំ ទ្រង់ធំជាងខ្ញុំ ពីព្រោះទ្រង់គង់នៅមុនខ្ញុំ។»",
      16: "ពីព្រោះដោយសារភាពពេញបរិបូរនៃទ្រង់ យើងទាំងអស់គ្នាបានទទួលព្រះគុណលើសលប់លើព្រះគុណ។",
      17: "ដ្បិតក្រឹត្យវិន័យត្រូវបានប្រទានមកតាមរយៈលោកម៉ូសេ ប៉ុន្តែព្រះគុណ និងសេចក្ដីពិតបានកើតមកតាមរយៈព្រះយេស៊ូវគ្រីស្ទវិញ។",
      18: "គ្មានអ្នកណាដែលបានឃើញព្រះនៅពេលណាមួយឡើយ គឺមានតែព្រះរាជបុត្រាតែមួយដែលគង់នៅក្នុងទ្រូងនៃព្រះវរបិតានោះឯង ដែលបានសម្ដែងទ្រង់ឲ្យស្គាល់។"
    },
    3: {
      16: "ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ។",
      17: "ពីព្រោះព្រះមិនបានចាត់ព្រះរាជបុត្រាទ្រង់ឲ្យយាងមកក្នុងលោកីយ៍ ដើម្បីនឹងផ្ដន្ទាទោសលោកីយ៍ឡើយ គឺដើម្បីឲ្យលោកីយ៍បានសង្គ្រោះដោយសារទ្រង់វិញ។",
      18: "អ្នកណាដែលជឿដល់ទ្រង់ មិនត្រូវផ្ដន្ទាទោសទេ តែអ្នកណាមិនជឿ នោះត្រូវផ្ដន្ទាទោសជាស្រេចហើយ ពីព្រោះមិនបានជឿដល់ព្រះនាមព្រះរាជបុត្រាតែមួយរបស់ព្រះឡើយ។",
      19: "ហើយសេចក្ដីផ្ដន្ទាទោសនោះគឺយ៉ាងនេះ៖ គឺពន្លឺបានមកក្នុងលោកីយ៍ហើយ តែមនុស្សលោកស្រឡាញ់សេចក្ដីងងឹតជាជាងពន្លឺ ពីព្រោះការប្រព្រឹត្តរបស់ពួកគេសុទ្ធតែអាក្រក់។",
      20: "ដ្បិតអស់អ្នកណាដែលប្រព្រឹត្តអំពើអាក្រក់ តែងតែស្អប់ពន្លឺ ហើយមិនមកឯពន្លឺឡើយ ក្រែងលោការប្រព្រឹត្តរបស់ខ្លួនត្រូវលាតត្រដាង។",
      21: "ប៉ុន្តែអ្នកណាដែលប្រព្រឹត្តតាមសេចក្ដីពិត តែងតែមកឯពន្លឺ ដើម្បីឲ្យការប្រព្រឹត្តរបស់ខ្លួនបានសម្ដែងច្បាស់ថា ធ្វើឡើងស្របតាមព្រះហឫទ័យព្រះ។"
    },
    14: {
      1: "កុំឲ្យចិត្តរបស់អ្នករាល់គ្នាថប់បារម្ភឡើយ ចូរជឿដល់ព្រះ ហើយជឿដល់ខ្ញុំដែរ។",
      6: "ព្រះយេស៊ូវមានព្រះបន្ទូលទៅគាត់ថា៖ «ខ្ញុំជាផ្លូវ ជាសេចក្ដីពិត និងជាជីវិត។ គ្មានអ្នកណាម្នាក់អាចមកឯព្រះវរបិតាបានឡើយ លើកលែងតែតាមរយៈខ្ញុំ។»",
      27: "ខ្ញុំទុកសេចក្ដីសុខសាន្តនៅជាមួយអ្នករាល់គ្នា គឺខ្ញុំឲ្យសេចក្ដីសុខសាន្តរបស់ខ្ញុំដល់អ្នករាល់គ្នា។ សេចក្ដីសុខសាន្តដែលខ្ញុំឲ្យអ្នករាល់គ្នា មិនដូចជាលោកីយ៍ឲ្យនោះឡើយ។ កុំឲ្យចិត្តរបស់អ្នករាល់គ្នាថប់បារម្ភ ឬភិតភ័យឡើយ។"
    }
  },
  Psalms: {
    23: {
      1: "ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ។",
      2: "ទ្រង់ធ្វើឲ្យខ្ញុំដេកនៅក្នុងវាលស្មៅខៀវខ្ចី ទ្រង់នាំខ្ញុំទៅក្បែរទឹកស្ងប់ស្ងាត់។",
      3: "ទ្រង់សម្រាលព្រលឹងខ្ញុំឡើងវិញ ទ្រង់នាំខ្ញុំទៅក្នុងផ្លូវសុចរិត ដោយយល់ដល់ព្រះនាមទ្រង់។",
      4: "ទោះបើខ្ញុំត្រូវដើរកាត់ច្រកភ្នំនៃស្រមោលសេចក្ដីស្លាប់ក៏ដោយ ក៏ខ្ញុំមិនខ្លាចអន្តរាយអ្វីឡើយ ពីព្រោះទ្រង់គង់នៅជាមួយខ្ញុំ ដំបង និងឈើច្រត់របស់ទ្រង់ តែងតែកម្សាន្តចិត្តខ្ញុំ។",
      5: "ទ្រង់បានរៀបតុសម្រាប់ខ្ញុំ នៅចំពោះមុខពួកខ្មាំងសត្រូវរបស់ខ្ញុំ ទ្រង់ចាក់ប្រេងលើក្បាលខ្ញុំ ពែងខ្ញុំក៏ពេញហៀរហូរ។",
      6: "ពិតប្រាកដជាសេចក្ដីល្អ និងសេចក្ដីសប្បុរស នឹងតាមខ្ញុំជានិច្ច អស់មួយជីវិតខ្ញុំ ហើយខ្ញុំនឹងរស់នៅក្នុងដំណាក់នៃព្រះយេហូវ៉ាជារៀងរហូតតទៅ។"
    },
    91: {
      1: "អ្នកណាដែលអាស្រ័យនៅក្នុងទីកំបាំងនៃព្រះដ៏ខ្ពស់បំផុត នោះនឹងនៅក្រោមម្លប់នៃព្រះដ៏មានគ្រប់ព្រះចេស្ដា។",
      2: "ខ្ញុំនឹងទូលដល់ព្រះយេហូវ៉ាថា៖ «ទ្រង់ជាទីពឹងជ្រក និងជាបន្ទាយរឹងមាំរបស់ទូលបង្គំ ជាព្រះនៃទូលបង្គំ ដែលទូលបង្គំទុកចិត្តលើ។»",
      3: "ដ្បិតទ្រង់នឹងជួយសង្គ្រោះអ្នកឲ្យរួចពីអន្ទាក់ព្រានព្រៃ និងពីជំងឺឆ្លងដ៏កាចសាហាវ។",
      4: "ទ្រង់នឹងគ្របបាំងអ្នកដោយស្លាបរបស់ទ្រង់ ហើយអ្នកនឹងបានជ្រកកោននៅក្រោមស្លាបទ្រង់ សេចក្ដីស្មោះត្រង់របស់ទ្រង់ជាខែល និងជាអាវក្រោះការពារអ្នក។"
    },
    119: {
      105: "ព្រះបន្ទូលទ្រង់ជាចង្កៀងបំភ្លឺដល់ជើងរបស់ទូលបង្គំ ហើយជាពន្លឺបំភ្លឺផ្លូវរបស់ទូលបង្គំ។"
    }
  },
  Proverbs: {
    3: {
      5: "ចូរទុកចិត្តលើព្រះយេហូវ៉ាឲ្យអស់ពីចិត្ត ហើយកុំផ្អែកលើការយល់ដឹងរបស់ខ្លួនឯងឡើយ។",
      6: "ចូរទទួលស្គាល់ទ្រង់ក្នុងគ្រប់ផ្លូវទាំងអស់របស់អ្នក នោះទ្រង់នឹងតម្រង់ផ្លូវទាំងប៉ុន្មានរបស់អ្នក។"
    }
  },
  Romans: {
    8: {
      28: "យើងដឹងហើយថា ព្រះធ្វើការជាមួយគ្នាគ្រប់ការទាំងអស់សម្រាប់សេចក្ដីល្អ ដល់អស់អ្នកដែលស្រឡាញ់ព្រះ គឺដល់អស់អ្នកដែលត្រូវបានត្រាស់ហៅតាមព្រះបំណងទ្រង់។",
      31: "ដូច្នេះ តើយើងត្រូវនិយាយដូចម្ដេចចំពោះការទាំងនេះ? ប្រសិនបើព្រះទ្រង់គង់នៅខាងយើង តើអ្នកណាអាចទាស់ប្រឆាំងនឹងយើងបាន?",
      38: "ដ្បិតខ្ញុំជឿជាក់យ៉ាងច្បាស់ថា ទោះជាសេចក្ដីស្លាប់ ឬជីវិត ទេវតា ឬអំណាចគ្រប់គ្រង អ្វីៗនៅពេលបច្ចុប្បន្ន ឬអ្វីៗនៅពេលខាងមុខ ឬកម្លាំងខ្លាំងពូកែណាមួយ",
      39: "ឬទីខ្ពស់ ឬទីជ្រៅ ឬអ្វីៗដែលបានបង្កើតមកឯទៀត ក៏មិនអាចបំបែកយើងចេញពីសេចក្ដីស្រឡាញ់នៃព្រះ ដែលមាននៅក្នុងព្រះគ្រីស្ទយេស៊ូវជាព្រះអម្ចាស់នៃយើងបានឡើយ។"
    },
    12: {
      12: "ចូរអរសប្បាយក្នុងសេចក្ដីសង្ឃឹម អត់ធ្មត់ក្នុងសេចក្ដីវេទនា ហើយខ្ជាប់ខ្ជួនក្នុងសេចក្ដីអធិស្ឋាន។"
    }
  },
  Philippians: {
    4: {
      6: "កុំខ្វល់ខ្វាយអំពីអ្វីឡើយ តែចូរទូលដល់ព្រះនូវអ្វីៗដែលអ្នកត្រូវការ ដោយការអធិស្ឋាន និងការអង្វរ ព្រមទាំងការអរព្រះគុណផងចុះ។",
      7: "នោះសេចក្ដីសុខសាន្តនៃព្រះ ដែលហួសលើសពីការយល់ដឹងទាំងស្រុង នឹងរក្សាការពារចិត្ត និងគំនិតរបស់អ្នករាល់គ្នាក្នុងព្រះគ្រីស្ទយេស៊ូវ។",
      13: "ខ្ញុំអាចនឹងធ្វើគ្រប់ការទាំងអស់បាន ដោយសារព្រះគ្រីស្ទដែលចំរើនកម្លាំងដល់ខ្ញុំ។",
      19: "ហើយព្រះនៃខ្ញុំនឹងប្រទានបំពេញគ្រប់សេចក្ដីត្រូវការរបស់អ្នករាល់គ្នា តាមភាពសម្បូរបែបនៃសិរីល្អទ្រង់ ក្នុងព្រះគ្រីស្ទយេស៊ូវ។"
    }
  },
  "1 Corinthians": {
    13: {
      4: "សេចក្ដីស្រឡាញ់តែងតែអត់ធន់ សេចក្ដីស្រឡាញ់មានចិត្តសប្បុរស មិនចេះច្រណែន មិនចេះអួតខ្លួន មិនចេះឆ្មើងឆ្មៃឡើយ។",
      5: "មិនប្រព្រឹត្តបែបមិនសមរម្យ មិនស្វែងរកប្រយោជន៍ផ្ទាល់ខ្លួន មិនងាយខឹង និងមិនចងកំហុសឡើយ។",
      6: "មិនអរសប្បាយនឹងអំពើទុច្ចរិតឡើយ តែអរសប្បាយនឹងសេចក្ដីពិតវិញ។",
      7: "សេចក្ដីស្រឡាញ់ទ្រាំទ្រគ្រប់ទាំងអស់ ជឿគ្រប់ទាំងអស់ សង្ឃឹមគ្រប់ទាំងអស់ និងអត់ធ្មត់នឹងគ្រប់ទាំងអស់។",
      8: "សេចក្ដីស្រឡាញ់មិនចេះសូន្យបង់ឡើយ។",
      13: "ដូច្នេះ ឥឡូវនេះនៅសល់៣យ៉ាងនេះ គឺជំនឿ សេចក្ដីសង្ឃឹម និងសេចក្ដីស្រឡាញ់ ប៉ុន្តែអ្វីដែលធំបំផុតក្នុងចំណោមរបស់ទាំងនេះ គឺសេចក្ដីស្រឡាញ់។"
    }
  },
  Genesis: {
    1: {
      1: "នៅដើមដំបូង ព្រះបានបង្កើតផ្ទៃមេឃ និងផែនដី។",
      2: "ផែនដីគ្មានរូបរាង ហើយទទេស្អាត សេចក្ដីងងឹតនៅលើផ្ទៃទឹកជ្រៅ ហើយព្រះវិញ្ញាណនៃព្រះបានគ្របដណ្ដប់លើផ្ទៃទឹក។",
      3: "ព្រះទ្រង់មានព្រះបន្ទូលថា៖ «ចូរឲ្យមានពន្លឺ» នោះពន្លឺក៏កើតមានឡើង។",
      26: "ព្រះទ្រង់មានព្រះបន្ទូលថា៖ «ចូរយើងបង្កើតមនុស្សឲ្យដូចរូបយើង និងតាមភាពដូចយើង ដើម្បីឲ្យគេមានអំណាចលើត្រីសមុទ្រ សត្វស្លាបលើអាកាស សត្វស្រុក និងលើផែនដីទាំងមូល។»",
      27: "ដូច្នេះ ព្រះបានបង្កើតមនុស្សឲ្យដូចរូបអង្គទ្រង់ គឺទ្រង់បានបង្កើតគេឲ្យដូចរូបព្រះ ទ្រង់បានបង្កើតគេជាប្រុស និងជាស្រី។",
      31: "ព្រះបានទតឃើញគ្រប់ការទាំងអស់ដែលទ្រង់បានបង្កើតមក ឃើញថាល្អប្រសើរណាស់។"
    }
  },
  Isaiah: {
    40: {
      29: "ទ្រង់ប្រទានកម្លាំងដល់អ្នកដែលអស់កម្លាំង ហើយដល់អ្នកដែលគ្មានកម្លាំង ទ្រង់ចំរើនកម្លាំងឲ្យមានកាន់តែច្រើនឡើង។",
      31: "ប៉ុន្តែអស់អ្នកដែលរង់ចាំព្រះយេហូវ៉ា នឹងបានកម្លាំងឡើងវិញ គេនឹងហើរឡើងដោយស្លាបដូចជាសត្វឥន្ទ្រី គេនឹងរត់តែមិនចេះហត់នឿយ គេនឹងដើរតែមិនចេះទន់ខ្សោយឡើយ។"
    },
    53: {
      5: "ប៉ុន្តែទ្រង់ត្រូវរបួសដោយសារអំពើរំលងរបស់យើង ទ្រង់ត្រូវខ្ទេចខ្ទាំដោយសារអំពើទុច្ចរិតរបស់យើង ការវាយផ្ចាលដើម្បីសេចក្ដីសុខសាន្តរបស់យើងបានធ្លាក់មកលើទ្រង់ ហើយដោយសារស្នាមរំពាត់របស់ទ្រង់ យើងបានជាសះស្បើយ។"
    }
  },
  Ephesians: {
    2: {
      8: "ដ្បិតដោយសារព្រះគុណហើយ ដែលអ្នករាល់គ្នាបានសង្គ្រោះតាមរយៈជំនឿ ហើយនេះមិនមែនកើតមកពីខ្លួនអ្នករាល់គ្នាឡើយ គឺអំណោយទាននៃព្រះវិញ។",
      9: "មិនមែនដោយសារការប្រព្រឹត្តឡើយ ដើម្បីកុំឲ្យអ្នកណាម្នាក់អាចអួតខ្លួនបាន។",
      10: "ពីព្រោះយើងជាស្នាព្រះហស្តរបស់ទ្រង់ ដែលបានបង្កើតឡើងក្នុងព្រះគ្រីស្ទយេស៊ូវ សម្រាប់កិច្ចការល្អ ដែលព្រះបានរៀបចំទុកជាមុន ឲ្យយើងដើរតាមនោះ។"
    }
  }
};

// -----------------------------------------------------------------------------
// Verse of the Day Curated Bilingual Passages
// -----------------------------------------------------------------------------
const DAILY_VERSES: DailyVerseResult[] = [
  {
    passage: "JHN.3.16",
    ref: "John 3:16",
    khmerRef: "យ៉ូហាន ៣:១៦",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    khmer: "ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ។",
    translation: "KHMER_OLD_1954 & KJV",
    devotionalTitle: "The Boundless Depth of God’s Love • សេចក្ដីស្រឡាញ់ដ៏ធំធេងនៃព្រះ",
    reflection: "God’s love is not passive; it is sacrificial and redeeming. He gave the most precious gift so you might live in fellowship with Him forever.",
    reflectionKhmer: "សេចក្ដីស្រឡាញ់នៃព្រះមិនមែនគ្រាន់តែជាពាក្យសម្ដីឡើយ គឺទ្រង់បានលះបង់អ្វីដ៏មានតម្លៃបំផុត ដើម្បីឲ្យយើងបានរស់នៅជាមួយទ្រង់ជារៀងរហូត។",
    audioUrl: "/assets/audio/blessings/faithful-heart.mp3",
    audioTitle: "Faithful Heart Blessing • ពរជ័យដួងចិត្តស្មោះត្រង់",
    date: new Date().toISOString().slice(0, 10),
  },
  {
    passage: "PSA.23.1",
    ref: "Psalm 23:1",
    khmerRef: "ទំនុកតម្កើង ២៣:១",
    text: "The LORD is my shepherd; I shall not want.",
    khmer: "ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ។",
    translation: "KHMER_OLD_1954 & KJV",
    devotionalTitle: "Total Sufficiency in the Good Shepherd • ការគ្រប់គ្រាន់ក្នុងព្រះគង្វាលដ៏ល្អ",
    reflection: "When the Lord leads your life, you are fully satisfied in His care. He restores your strength and guides your steps beside quiet waters.",
    reflectionKhmer: "នៅពេលដែលព្រះអម្ចាស់ដឹកនាំជីវិតអ្នក អ្នកនឹងមិនខ្វះអ្វីឡើយ ដ្បិតទ្រង់ការពារ និងផ្គត់ផ្គង់គ្រប់តម្រូវការរបស់អ្នកជានិច្ច។",
    audioUrl: "/assets/audio/blessings/still-waters.mp3",
    audioTitle: "Still Waters Meditation • ទឹកស្ងប់ស្ងាត់",
    date: new Date().toISOString().slice(0, 10),
  },
  {
    passage: "ROM.8.28",
    ref: "Romans 8:28",
    khmerRef: "រ៉ូម ៨:២៨",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    khmer: "យើងដឹងហើយថា ព្រះធ្វើការជាមួយគ្នាគ្រប់ការទាំងអស់សម្រាប់សេចក្ដីល្អ ដល់អស់អ្នកដែលស្រឡាញ់ព្រះ គឺដល់អស់អ្នកដែលត្រូវបានត្រាស់ហៅតាមព្រះបំណងទ្រង់។",
    translation: "KHMER_OLD_1954 & KJV",
    devotionalTitle: "Sovereign Grace in Every Trial • ព្រះគុណដ៏ធំធេងក្នុងគ្រប់កាលៈទេសៈ",
    reflection: "Even in hardship and uncertainty, God weaves every thread of your journey into His sovereign good and eternal purpose.",
    reflectionKhmer: "ទោះបីជាស្ថិតក្នុងឧបសគ្គយ៉ាងណាក៏ដោយ ព្រះទ្រង់កំពុងធ្វើការដើម្បីនាំមកនូវសេចក្ដីល្អបំផុតសម្រាប់ជីវិតរបស់អ្នក។",
    audioUrl: "/assets/audio/blessings/grace-morning.mp3",
    audioTitle: "Grace Morning Devotional • ព្រះគុណនាពេលព្រឹក",
    date: new Date().toISOString().slice(0, 10),
  },
  {
    passage: "PHP.4.13",
    ref: "Philippians 4:13",
    khmerRef: "ភីលីព ៤:១៣",
    text: "I can do all things through Christ which strengtheneth me.",
    khmer: "ខ្ញុំអាចនឹងធ្វើគ្រប់ការទាំងអស់បាន ដោយសារព្រះគ្រីស្ទដែលចំរើនកម្លាំងដល់ខ្ញុំ។",
    translation: "KHMER_OLD_1954 & KJV",
    devotionalTitle: "Empowered by Christ • កម្លាំងដែលបានមកពីព្រះគ្រីស្ទ",
    reflection: "Human strength runs dry, but Christ’s resurrection power fills you to endure, overcome, and flourish in any season.",
    reflectionKhmer: "កម្លាំងមនុស្សអាចនឹងអស់ ក្រៀមស្វិត ប៉ុន្តែកម្លាំងនៃព្រះគ្រីស្ទនឹងបំពេញអ្នកឲ្យឈ្នះលើគ្រប់ឧបសគ្គ។",
    audioUrl: "/assets/audio/blessings/hope-rising.mp3",
    audioTitle: "Hope Rising Blessing • ក្តីសង្ឃឹមរះឡើង",
    date: new Date().toISOString().slice(0, 10),
  },
  {
    passage: "PRO.3.5",
    ref: "Proverbs 3:5-6",
    khmerRef: "សុភាសិត ៣:៥-៦",
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    khmer: "ចូរទុកចិត្តលើព្រះយេហូវ៉ាឲ្យអស់ពីចិត្ត ហើយកុំផ្អែកលើការយល់ដឹងរបស់ខ្លួនឯងឡើយ។ ចូរទទួលស្គាល់ទ្រង់ក្នុងគ្រប់ផ្លូវទាំងអស់របស់អ្នក នោះទ្រង់នឹងតម្រង់ផ្លូវទាំងប៉ុន្មានរបស់អ្នក។",
    translation: "KHMER_OLD_1954 & KJV",
    devotionalTitle: "Wholehearted Trust in the Lord • ទុកចិត្តលើព្រះឲ្យអស់ពីចិត្ត",
    reflection: "Release control into the hands of the One who sees the end from the beginning. He will guide your feet on straight paths.",
    reflectionKhmer: "ចូរប្រគល់ផ្លូវ និងការសម្រេចចិត្តរបស់អ្នកទៅក្នុងព្រះហស្តទ្រង់ នោះទ្រង់នឹងតម្រង់ទិសដៅជីវិតអ្នកយ៉ាងត្រឹមត្រូវ។",
    audioUrl: "/assets/audio/blessings/peaceful-praise.mp3",
    audioTitle: "Peaceful Praise Blessing • សរសើរដោយសន្តិភាព",
    date: new Date().toISOString().slice(0, 10),
  },
  {
    passage: "ISA.40.31",
    ref: "Isaiah 40:31",
    khmerRef: "អេសាយ ៤០:៣១",
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    khmer: "ប៉ុន្តែអស់អ្នកដែលរង់ចាំព្រះយេហូវ៉ា នឹងបានកម្លាំងឡើងវិញ គេនឹងហើរឡើងដោយស្លាបដូចជាសត្វឥន្ទ្រី គេនឹងរត់តែមិនចេះហត់នឿយ គេនឹងដើរតែមិនចេះទន់ខ្សោយឡើយ។",
    translation: "KHMER_OLD_1954 & KJV",
    devotionalTitle: "Renewed Strength for the Weary • កម្លាំងថ្មីសម្រាប់អ្នកហត់នឿយ",
    reflection: "Waiting upon the Lord is active faith. Trusting His timing restores your spiritual vigor to rise above trials.",
    reflectionKhmer: "ការរង់ចាំព្រះអម្ចាស់ដោយជំនឿ នឹងនាំមកនូវកម្លាំងថ្មីដើម្បីហោះឡើងលើរលកនៃទុក្ខលំបាក។",
    audioUrl: "/assets/audio/blessings/kingdom-dawn.mp3",
    audioTitle: "Kingdom Dawn Devotional • ពន្លឺរស្មីនគរព្រះ",
    date: new Date().toISOString().slice(0, 10),
  },
  {
    passage: "1CO.13.4",
    ref: "1 Corinthians 13:4-7",
    khmerRef: "១ កូរិនថូស ១៣:៤-៧",
    text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up. Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil; Rejoiceth not in iniquity, but rejoiceth in the truth; Beareth all things, believeth all things, hopeth all things, endureth all things.",
    khmer: "សេចក្ដីស្រឡាញ់តែងតែអត់ធន់ សេចក្ដីស្រឡាញ់មានចិត្តសប្បុរស មិនចេះច្រណែន មិនចេះអួតខ្លួន មិនចេះឆ្មើងឆ្មៃឡើយ។ មិនប្រព្រឹត្តបែបមិនសមរម្យ មិនស្វែងរកប្រយោជន៍ផ្ទាល់ខ្លួន មិនងាយខឹង និងមិនចងកំហុសឡើយ។ មិនអរសប្បាយនឹងអំពើទុច្ចរិតឡើយ តែអរសប្បាយនឹងសេចក្ដីពិតវិញ។ សេចក្ដីស្រឡាញ់ទ្រាំទ្រគ្រប់ទាំងអស់ ជឿគ្រប់ទាំងអស់ សង្ឃឹមគ្រប់ទាំងអស់ និងអត់ធ្មត់នឹងគ្រប់ទាំងអស់។",
    translation: "KHMER_OLD_1954 & KJV",
    devotionalTitle: "The Nature of Christlike Love • ធម្មជាតិនៃសេចក្ដីស្រឡាញ់",
    reflection: "True love is patience in action, kindness without condition, and endurance that never fails. Walk in love today.",
    reflectionKhmer: "សេចក្ដីស្រឡាញ់ដ៏ពិត គឺការអត់ធ្មត់ ការប្រព្រឹត្តល្អ និងការមិនគុំកួន។ ចូរដើរក្នុងសេចក្ដីស្រឡាញ់នៅថ្ងៃនេះ។",
    audioUrl: "/assets/audio/blessings/joyful-light.mp3",
    audioTitle: "Joyful Light Blessing • ពន្លឺនៃសេចក្ដីអំណរ",
    date: new Date().toISOString().slice(0, 10),
  }
];

// -----------------------------------------------------------------------------
// Greek & Hebrew Concordance & Word Study Database
// -----------------------------------------------------------------------------
export const CONCORDANCE_STORE: Record<string, ConcordanceItem> = {
  grace: {
    word: "Grace",
    original: "χάρις",
    transliteration: "charis (khá-rece)",
    language: "Greek",
    strongs: "G5485",
    definition: "Unmerited favor, goodwill, and loving-kindness freely bestowed by God upon undeserving humanity.",
    meaning: "In Christian theology, grace is the active divine influence upon the heart and its reflection in life. We are justified by grace, saved through faith (Eph 2:8), and strengthened in trial (2 Cor 12:9).",
    occurrences: 156,
    keyVerses: ["Ephesians 2:8-9", "Romans 3:24", "2 Corinthians 12:9", "John 1:16-17", "Titus 2:11"]
  },
  faith: {
    word: "Faith",
    original: "πίστις",
    transliteration: "pistis (pís-tis)",
    language: "Greek",
    strongs: "G4102",
    definition: "Conviction of the truth of anything; belief, trust, and wholehearted reliance upon God and His promises.",
    meaning: "Biblical faith is not blind optimism; it is confident assurance based on the revealed character of God (Heb 11:1). It produces obedience, endurance, and spiritual fruit.",
    occurrences: 244,
    keyVerses: ["Hebrews 11:1", "Romans 10:17", "2 Corinthians 5:7", "James 2:17", "Galatians 2:20"]
  },
  love: {
    word: "Love",
    original: "ἀγάπη",
    transliteration: "agape (ag-áh-pay)",
    language: "Greek",
    strongs: "G26",
    definition: "Self-sacrificial, unconditional, benevolent love that seeks the highest eternal good of the beloved.",
    meaning: "Agape is the highest form of love, exemplified supremely at the cross (Rom 5:8). It is the defining mark of true disciples of Jesus Christ (John 13:35).",
    occurrences: 116,
    keyVerses: ["1 Corinthians 13:4-8", "John 3:16", "1 John 4:8", "Romans 5:8", "John 15:13"]
  },
  peace: {
    word: "Peace",
    original: "שָׁלוֹם / εἰρήνη",
    transliteration: "shalom (Hebrew) / eirene (Greek)",
    language: "Hebrew",
    strongs: "H7965 / G1515",
    definition: "Completeness, wholeness, soundness, health, safety, and reconciliation with God and neighbour.",
    meaning: "Biblical peace is not merely the absence of conflict; it is the presence of God's holistic harmony and flourishing in your soul and community (John 14:27).",
    occurrences: 329,
    keyVerses: ["John 14:27", "Philippians 4:7", "Isaiah 26:3", "Numbers 6:24-26", "Romans 5:1"]
  },
  hope: {
    word: "Hope",
    original: "ἐλπίς",
    transliteration: "elpis (el-péece)",
    language: "Greek",
    strongs: "G1680",
    definition: "Confident expectation and joyous anticipation of eternal salvation and God’s unfailing goodness.",
    meaning: "Unlike worldly wishful thinking, Christian hope is an anchor for the soul (Heb 6:19), firmly anchored in the finished resurrection of Christ.",
    occurrences: 53,
    keyVerses: ["Hebrews 6:19", "Romans 15:13", "1 Peter 1:3", "Jeremiah 29:11", "Titus 2:13"]
  },
  prayer: {
    word: "Prayer",
    original: "προσεុχή",
    transliteration: "proseuche (pros-yoo-kháy)",
    language: "Greek",
    strongs: "G4335",
    definition: "Direct communication with the living God through adoration, confession, thanksgiving, and supplication.",
    meaning: "Prayer is entering the Holy of Holies through the blood of Jesus, finding mercy and grace in time of need (Heb 4:16).",
    occurrences: 127,
    keyVerses: ["Philippians 4:6", "1 Thessalonians 5:17", "Matthew 6:9-13", "James 5:16", "Colossians 4:2"]
  },
  mercy: {
    word: "Mercy / Lovingkindness",
    original: "חֶסֶד",
    transliteration: "hesed (kheh'-sed)",
    language: "Hebrew",
    strongs: "H2617",
    definition: "Steadfast covenant love, loyalty, grace, and compassion that never fails nor gives up.",
    meaning: "Hesed is God's enduring covenant faithfulness toward His people despite their unfaithfulness (Lam 3:22-23, Ps 136).",
    occurrences: 248,
    keyVerses: ["Lamentations 3:22-23", "Psalm 136:1", "Micah 6:8", "Ephesians 2:4-5", "Psalm 23:6"]
  },
  holy: {
    word: "Holy / Set Apart",
    original: "קָדוֹשׁ / ἅγιος",
    transliteration: "kadosh (Hebrew) / hagios (Greek)",
    language: "Hebrew",
    strongs: "H6918 / G40",
    definition: "Sacred, consecrated, set apart from sin and dedicated entirely unto God's glory and purity.",
    meaning: "God is transcendent in majesty and absolute moral purity (Isa 6:3). Believers are called to walk in holiness by the Holy Spirit (1 Pet 1:15-16).",
    occurrences: 611,
    keyVerses: ["Isaiah 6:3", "1 Peter 1:15-16", "Leviticus 19:2", "Revelation 4:8", "Hebrews 12:14"]
  },
  wisdom: {
    word: "Wisdom",
    original: "חָכְמָה / σοφία",
    transliteration: "chokhmah (Hebrew) / sophia (Greek)",
    language: "Hebrew",
    strongs: "H2451 / G4678",
    definition: "Moral skill in living according to God's divine design; the practical application of spiritual truth.",
    meaning: "The fear of the Lord is the beginning of wisdom (Prov 9:10). Christ Himself is the wisdom of God for all believers (1 Cor 1:30).",
    occurrences: 222,
    keyVerses: ["Proverbs 9:10", "James 1:5", "Proverbs 3:13", "1 Corinthians 1:30", "Colossians 3:16"]
  }
};

// -----------------------------------------------------------------------------
// Preacher & Christian Inspiration Quotes Database
// -----------------------------------------------------------------------------
export const BIBLE_QUOTES: BibleQuote[] = [
  // Preachers
  { text: "Visit many good books, but live in the Bible.", author: "Charles Spurgeon", category: "Scripture", type: "preacher" },
  { text: "The Bible knows nothing of solitary religion. We were saved for communion with God and fellowship with one another.", author: "John Wesley", category: "Fellowship", type: "preacher" },
  { text: "The Bible was not given for our information only, but for our transformation.", author: "D. L. Moody", category: "Spiritual Growth", type: "preacher" },
  { text: "God is most glorified in us when we are most satisfied in Him.", author: "John Piper", category: "Worship", type: "preacher" },
  { text: "A Bible that’s falling apart usually belongs to someone who isn’t.", author: "Charles Spurgeon", category: "Scripture", type: "preacher" },
  { text: "If you are not seeking the Lord daily, the enemy is seeking you.", author: "Charles Spurgeon", category: "Spiritual Warfare", type: "preacher" },
  { text: "Give me one hundred preachers who fear nothing but sin and desire nothing but God, and I care not a straw whether they be clergymen or laymen; such alone will shake the gates of hell.", author: "John Wesley", category: "Evangelism", type: "preacher" },
  { text: "Faith sees the invisible, believes the incredible, and receives the impossible.", author: "Corrie ten Boom", category: "Faith", type: "preacher" },
  { text: "He is no fool who gives what he cannot keep to gain what he cannot lose.", author: "Jim Elliot", category: "Dedication", type: "preacher" },
  { text: "To be a Christian without prayer is no more possible than to be alive without breathing.", author: "Martin Luther", category: "Prayer", type: "preacher" },

  // General Christian
  { text: "Faith does not eliminate questions. But faith knows where to take them.", author: "Elisabeth Elliot", category: "Faith", type: "general" },
  { text: "I believe in Christianity as I believe that the sun has risen: not only because I see it, but because by it I see everything else.", author: "C. S. Lewis", category: "Apologetics", type: "general" },
  { text: "God whispers to us in our pleasures, speaks in our conscience, but shouts in our pains: it is His megaphone to rouse a deaf world.", author: "C. S. Lewis", category: "Trials", type: "general" },
  { text: "You have made us for yourself, O Lord, and our hearts are restless until they find their rest in You.", author: "Augustine of Hippo", category: "Rest", type: "general" },
  { text: "Never be afraid to trust an unknown future to a known God.", author: "Corrie ten Boom", category: "Trust", type: "general" },
  { text: "What comes into our minds when we think about God is the most important thing about us.", author: "A. W. Tozer", category: "Theology", type: "general" },
  { text: "Expect great things from God; attempt great things for God.", author: "William Carey", category: "Missions", type: "general" },
  { text: "There is nothing that makes us love a person so much as praying for them.", author: "William Law", category: "Love", type: "general" }
];

// -----------------------------------------------------------------------------
// Bible Typing Passages
// -----------------------------------------------------------------------------
export const TYPING_PASSAGES: TypingPassage[] = [
  {
    id: "psalm-23",
    title: "The Lord Is My Shepherd",
    reference: "Psalm 23:1-3",
    khmerRef: "ទំនុកតម្កើង ២៣:១-៣",
    text: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
    khmer: "ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ។ ទ្រង់ធ្វើឲ្យខ្ញុំដេកនៅក្នុងវាលស្មៅខៀវខ្ចី ទ្រង់នាំខ្ញុំទៅក្បែរទឹកស្ងប់ស្ងាត់។ ទ្រង់សម្រាលព្រលឹងខ្ញុំឡើងវិញ ទ្រង់នាំខ្ញុំទៅក្នុងផ្លូវសុចរិត ដោយយល់ដល់ព្រះនាមទ្រង់។",
    level: "Beginner"
  },
  {
    id: "john-3-16",
    title: "God So Loved The World",
    reference: "John 3:16-17",
    khmerRef: "យ៉ូហាន ៣:១៦-១៧",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
    khmer: "ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ។",
    level: "Beginner"
  },
  {
    id: "romans-8-28",
    title: "All Things For Good",
    reference: "Romans 8:28, 31",
    khmerRef: "រ៉ូម ៨:២៨, ៣១",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose. What shall we then say to these things? If God be for us, who can be against us?",
    khmer: "យើងដឹងហើយថា ព្រះធ្វើការជាមួយគ្នាគ្រប់ការទាំងអស់សម្រាប់សេចក្ដីល្អ ដល់អស់អ្នកដែលស្រឡាញ់ព្រះ គឺដល់អស់អ្នកដែលត្រូវបានត្រាស់ហៅតាមព្រះបំណងទ្រង់។",
    level: "Intermediate"
  },
  {
    id: "corinthians-13",
    title: "The Greatest Is Love",
    reference: "1 Corinthians 13:4-8",
    khmerRef: "១ កូរិនថូស ១៣:៤-៨",
    text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil; Rejoiceth not in iniquity, but rejoiceth in the truth; Beareth all things, believeth all things, hopeth all things, endureth all things. Charity never faileth.",
    khmer: "សេចក្ដីស្រឡាញ់តែងតែអត់ធន់ សេចក្ដីស្រឡាញ់មានចិត្តសប្បុរស មិនចេះច្រណែន មិនចេះអួតខ្លួន មិនចេះឆ្មើងឆ្មៃឡើយ។ មិនប្រព្រឹត្តបែបមិនសមរម្យ មិនស្វែងរកប្រយោជន៍ផ្ទាល់ខ្លួន មិនងាយខឹង និងមិនចងកំហុសឡើយ។",
    level: "Advanced"
  }
];

// -----------------------------------------------------------------------------
// Bible Media & Audio Sanctuary
// -----------------------------------------------------------------------------
export const BIBLE_MEDIA: BibleMediaItem[] = [
  {
    id: "audio-01",
    title: "Faithful Heart • Spoken Audio Blessing",
    khmerTitle: "ពរជ័យដួងចិត្តស្មោះត្រង់",
    speaker: "Faith In Audio Studio",
    duration: "3:45",
    type: "audio",
    url: "/assets/audio/blessings/faithful-heart.mp3",
    image: "/assets/images/wallpapers/wallpaper-01.jpg",
    category: "Blessing"
  },
  {
    id: "audio-02",
    title: "Grace Morning • Daily Devotional",
    khmerTitle: "ព្រះគុណនាពេលព្រឹក",
    speaker: "Faith In Audio Studio",
    duration: "4:12",
    type: "audio",
    url: "/assets/audio/blessings/grace-morning.mp3",
    image: "/assets/images/wallpapers/wallpaper-02.jpg",
    category: "Devotional"
  },
  {
    id: "audio-03",
    title: "Still Waters • Psalm 23 Meditation",
    khmerTitle: "ទឹកស្ងប់ស្ងាត់ - ទំនុកតម្កើង ២៣",
    speaker: "Faith In Audio Studio",
    duration: "5:20",
    type: "audio",
    url: "/assets/audio/blessings/still-waters.mp3",
    image: "/assets/images/wallpapers/wallpaper-03.jpg",
    category: "Meditation"
  },
  {
    id: "audio-04",
    title: "Hope Rising • Uplifting Word",
    khmerTitle: "ក្តីសង្ឃឹមរះឡើង",
    speaker: "Faith In Audio Studio",
    duration: "3:30",
    type: "audio",
    url: "/assets/audio/blessings/hope-rising.mp3",
    image: "/assets/images/wallpapers/wallpaper-04.jpg",
    category: "Blessing"
  },
  {
    id: "audio-05",
    title: "Peaceful Praise • Worship Sanctuary",
    khmerTitle: "សរសើរដោយសន្តិភាព",
    speaker: "Faith In Audio Studio",
    duration: "4:50",
    type: "audio",
    url: "/assets/audio/blessings/peaceful-praise.mp3",
    image: "/assets/images/wallpapers/wallpaper-05.jpg",
    category: "Worship"
  },
  {
    id: "audio-06",
    title: "Joyful Light • Day of Rejoicing",
    khmerTitle: "ពន្លឺនៃសេចក្ដីអំណរ",
    speaker: "Faith In Audio Studio",
    duration: "3:15",
    type: "audio",
    url: "/assets/audio/blessings/joyful-light.mp3",
    image: "/assets/images/wallpapers/wallpaper-06.jpg",
    category: "Devotional"
  }
];

// -----------------------------------------------------------------------------
// Core Bible Functions
// -----------------------------------------------------------------------------

/**
 * Credit line for the Khmer 1954. The text is published by the Bible Society
 * in Cambodia and is not public domain, so this must accompany it wherever
 * it is displayed.
 */
export const KHMER_1954_ATTRIBUTION =
  "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ © Bible Society in Cambodia";
export const KHMER_1954_READ_URL = "https://www.bible.com/versions/1270";

/**
 * Fetch verses for a specific chapter in a given translation.
 */
export async function getBibleChapter(
  bookName: string,
  chapterNum: number | string,
  version = "KHMER_OLD_1954"
): Promise<BibleChapterResult> {
  const book = findBibleBook(bookName);
  const chapter = Math.max(1, Math.min(book.chapters, Number(chapterNum) || 1));
  const ver = (version || "KHMER_OLD_1954").trim().toUpperCase();

  // 1. Khmer Version Resolution
  //
  // Order: Faith In's own database, then the embedded seed verses, then the
  // licensed YouVersion API (which also warms the database). If none of those
  // has the chapter, say so plainly — never substitute another translation.
  if (ver === "KHMER_OLD_1954" || ver === "KHMER1954" || ver === "1270") {
    // a) Supabase — the full text, once imported under your licence.
    try {
      const { getStoredChapter } = await import("./scripture-store");
      const storedChapter = await getStoredChapter("KHMER_OLD_1954", book.name, chapter);
      if (storedChapter && storedChapter.items.length) {
        return {
          book: book.name,
          khmerBook: book.khmerName,
          chapter,
          version: "KHMER_OLD_1954",
          versionName: storedChapter.nativeName || "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)",
          items: storedChapter.items.map((item) => ({
            v: item.v,
            text: item.text,
            reference: `${book.khmerName} ${chapter}:${item.v}`
          })),
          source: "supabase-khmer-1954",
          totalVerses: storedChapter.items.length,
          status: "ready",
          attribution: storedChapter.attribution,
          attributionUrl: storedChapter.attributionUrl
        };
      }
    } catch {
      // Storage is optional. Fall through to the remaining sources.
    }

    // b) The small set of verses embedded in this file.
    const stored = KHMER_SCRIPTURE_STORE[book.name]?.[chapter];
    if (stored) {
      const items: BibleVerse[] = Object.entries(stored).map(([v, text]) => ({
        v: Number(v),
        text,
        reference: `${book.khmerName} ${chapter}:${v}`
      }));
      return {
        book: book.name,
        khmerBook: book.khmerName,
        chapter,
        version: "KHMER_OLD_1954",
        versionName: "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)",
        items,
        source: "embedded-khmer-1954",
        totalVerses: items.length,
        status: "ready",
        attribution: KHMER_1954_ATTRIBUTION,
        attributionUrl: KHMER_1954_READ_URL
      };
    }

    // c) YouVersion Platform, Bible 1270, under the publisher licence.
    //    Reads YVP_APP_KEY — the name .env.example, /api/bible/versions and the
    //    tests all use. The two older names stay accepted so an existing
    //    deployment that set them keeps working.
    const youversionKey =
      process.env.YVP_APP_KEY ||
      process.env.CV_YOUVERSION_APP_KEY ||
      process.env.YOUVERSION_APP_KEY;
    const khmerBibleId = process.env.YVP_KHMER_BIBLE_ID || "1270";

    if (youversionKey) {
      try {
        const url = `https://api.youversion.com/v1/bibles/${khmerBibleId}/books/${book.usfm}/chapters/${chapter}/verses?format=text`;
        const resp = await fetch(url, {
          headers: { "X-YVP-App-Key": youversionKey, Accept: "application/json" },
          signal: AbortSignal.timeout(4000)
        });
        if (resp.ok) {
          const data = await resp.json();
          const verses = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          if (verses.length > 0) {
            const items: BibleVerse[] = verses
              .map((item: { title?: string; text?: string; content?: string; verse?: number }, idx: number) => ({
                v: Number(item.verse) || idx + 1,
                text: (item.content || item.text || "").replace(/<[^>]*>/g, "").trim(),
                reference: `${book.khmerName} ${chapter}:${Number(item.verse) || idx + 1}`
              }))
              .filter((i: BibleVerse) => Boolean(i.text));

            if (items.length > 0) {
              // Warm the database so the next reader is served locally and the
              // licensed API is not called again for this chapter.
              void (async () => {
                try {
                  const { writeVerses } = await import("./scripture-store");
                  await writeVerses(
                    "KHMER_OLD_1954",
                    items.map((item) => ({
                      book: book.name,
                      chapter,
                      verse: item.v,
                      text: item.text
                    }))
                  );
                } catch {
                  // Caching is best effort; the reader already has its text.
                }
              })();

              return {
                book: book.name,
                khmerBook: book.khmerName,
                chapter,
                version: "KHMER_OLD_1954",
                versionName: "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)",
                items,
                source: "youversion",
                totalVerses: items.length,
                status: "ready",
                attribution: KHMER_1954_ATTRIBUTION,
                attributionUrl: KHMER_1954_READ_URL
              };
            }
          }
        }
      } catch {
        // Fall through to the honest notice below.
      }
    }

    // d) Nothing has this chapter in Khmer.
    //
    // This branch used to return English World English Bible verses stamped
    // with version "KHMER_OLD_1954", so a member reading Genesis 12 in Khmer
    // was shown English and told it was the 1954 Khmer Bible. Faith In now
    // says plainly that the chapter is not available and links to the
    // publisher's own reader, which the Bible page already knows how to show.
    return {
      book: book.name,
      khmerBook: book.khmerName,
      chapter,
      version: "KHMER_OLD_1954",
      versionName: "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)",
      items: [],
      source: "unavailable",
      totalVerses: 0,
      status: "setup_required",
      message: youversionKey
        ? `${book.khmerName} ${chapter} has not been loaded into Faith In yet. Run the Khmer import to add it.`
        : "The Khmer 1954 Bible is licensed by the Bible Society in Cambodia and has not been connected yet. Connect publisher access to read it inside Faith In.",
      readUrl: KHMER_1954_READ_URL,
      setupUrl: "https://platform.youversion.com/",
      attribution: KHMER_1954_ATTRIBUTION,
      attributionUrl: KHMER_1954_READ_URL
    };
  }

  // 2. English / Public Domain Translations (KJV, WEB, ASV)
  const translationCode = ver === "WEB" ? "web" : ver === "ASV" ? "asv" : "kjv";
  const result = await fetchEnglishChapter(book.name, chapter, translationCode);
  const englishName =
    ver === "WEB"
      ? "World English Bible (WEB)"
      : ver === "ASV"
        ? "American Standard Version 1901"
        : "King James Version (KJV)";
  return {
    book: book.name,
    khmerBook: book.khmerName,
    chapter,
    version: ver,
    versionName: englishName,
    items: result.items,
    source: result.source,
    totalVerses: result.items.length,
    status: result.items.length ? "ready" : "setup_required",
    message: result.items.length ? undefined : `${book.name} ${chapter} could not be loaded just now. Please try again.`,
    attribution: `${englishName} (public domain)`
  };
}

/**
 * Fetch English chapter from bible-api.com with local backup.
 */
async function fetchEnglishChapter(
  book: string,
  chapter: number,
  translation = "kjv"
): Promise<{ items: BibleVerse[]; source: string }> {
  const normBook = book.replace(/Psalm$/, "Psalms");
  const url = `https://bible-api.com/${encodeURIComponent(normBook)}+${chapter}?translation=${translation}`;

  try {
    const resp = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 }
    });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data.verses) && data.verses.length > 0) {
        const items = data.verses.map((v: { verse: number; text: string; book_name?: string }) => ({
          v: Number(v.verse) || 1,
          text: (v.text || "").trim(),
          reference: `${v.book_name || book} ${chapter}:${v.verse}`
        }));
        return { items, source: "bible-api.com" };
      }
    }
  } catch {
    // Network failure, continue to local fallback
  }

  // Local fallback generator so the reader never breaks
  const fallbackVerses: BibleVerse[] = [
    { v: 1, text: `The chapter of ${book} ${chapter} in the Holy Scriptures.`, reference: `${book} ${chapter}:1` }
  ];
  return { items: fallbackVerses, source: "local-fallback" };
}

/**
 * Get side-by-side parallel chapter for comparing two translations.
 */
export async function getParallelChapter(
  bookName: string,
  chapterNum: number | string,
  version1 = "KHMER_OLD_1954",
  version2 = "KJV"
): Promise<ParallelChapterResult> {
  const [chap1, chap2] = await Promise.all([
    getBibleChapter(bookName, chapterNum, version1),
    getBibleChapter(bookName, chapterNum, version2)
  ]);

  const map1 = new Map(chap1.items.map((i) => [i.v, i.text]));
  const map2 = new Map(chap2.items.map((i) => [i.v, i.text]));

  const verseNumbers = Array.from(
    new Set([...chap1.items.map((i) => i.v), ...chap2.items.map((i) => i.v)])
  ).sort((a, b) => a - b);

  const parallelItems = verseNumbers.map((v) => ({
    v,
    text1: map1.get(v) || "",
    text2: map2.get(v) || "",
    reference: `${chap1.khmerBook} / ${chap1.book} ${chap1.chapter}:${v}`
  }));

  return {
    book: chap1.book,
    khmerBook: chap1.khmerBook,
    chapter: chap1.chapter,
    version1: chap1.version,
    version1Name: chap1.versionName,
    version2: chap2.version,
    version2Name: chap2.versionName,
    items: parallelItems,
    totalVerses: parallelItems.length,
    // Each side reports itself, so the reader can show one column of text and
    // an honest notice in the other rather than pretending both loaded.
    version1Status: chap1.status || "ready",
    version2Status: chap2.status || "ready",
    version1Message: chap1.message,
    version2Message: chap2.message,
    readUrl: chap1.readUrl || chap2.readUrl
  };
}

/**
 * Get today's curated Verse of the Day.
 */
export function getDailyVerse(): DailyVerseResult {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const selected = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
  return {
    ...selected,
    date: new Date().toISOString().slice(0, 10)
  };
}

/**
 * Search Scripture verses by query.
 */
export function searchBible(query: string, limit = 20) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return { items: [], query: "" };

  const results: Array<{ reference: string; text: string; khmerText?: string }> = [];

  // Search embedded Khmer scripture
  for (const [book, chapters] of Object.entries(KHMER_SCRIPTURE_STORE)) {
    for (const [chap, verses] of Object.entries(chapters)) {
      for (const [v, text] of Object.entries(verses)) {
        if (text.toLowerCase().includes(q)) {
          const bookInfo = findBibleBook(book);
          results.push({
            reference: `${bookInfo.khmerName} ${chap}:${v}`,
            text
          });
          if (results.length >= limit) break;
        }
      }
      if (results.length >= limit) break;
    }
    if (results.length >= limit) break;
  }

  return { items: results, query: q, total: results.length };
}

/**
 * Searches the full Khmer text held in Supabase, falling back to the verses
 * embedded in this file when the store is empty or unconfigured.
 *
 * `searchBible` stays exactly as it was — synchronous, embedded-only — because
 * other callers depend on that signature. This is the async counterpart that
 * can see the whole imported Bible.
 */
export async function searchScripture(
  query: string,
  limit = 20,
  version = "KHMER_OLD_1954"
): Promise<{ items: Array<{ reference: string; text: string }>; query: string; total: number; source: string }> {
  const q = (query || "").trim();
  if (!q) return { items: [], query: "", total: 0, source: "none" };

  try {
    const { searchStored } = await import("./scripture-store");
    const rows = await searchStored(version, q, limit);
    if (rows.length) {
      return {
        items: rows.map((row) => {
          const bookInfo = findBibleBook(row.book);
          return {
            reference: `${bookInfo.khmerName} ${row.chapter}:${row.verse}`,
            text: row.text
          };
        }),
        query: q,
        total: rows.length,
        source: "supabase"
      };
    }
  } catch {
    // Fall through to the embedded search below.
  }

  const embedded = searchBible(q, limit);
  return {
    items: embedded.items.map((item) => ({ reference: item.reference, text: item.text })),
    query: q,
    total: embedded.items.length,
    source: "embedded"
  };
}

/**
 * Concordance / Greek & Hebrew Word Study.
 */
export function getConcordance(query?: string) {
  if (!query || !query.trim()) {
    return { items: Object.values(CONCORDANCE_STORE) };
  }
  const q = query.trim().toLowerCase();
  const found = Object.entries(CONCORDANCE_STORE).find(
    ([k, item]) =>
      k.includes(q) ||
      item.word.toLowerCase().includes(q) ||
      item.transliteration.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q)
  );
  return {
    item: found ? found[1] : null,
    items: Object.values(CONCORDANCE_STORE)
  };
}

/**
 * Quotes library.
 */
export function getBibleQuotes(type?: string) {
  const isPreacher = (type || "").toLowerCase() === "preacher";
  const items = isPreacher
    ? BIBLE_QUOTES.filter((q) => q.type === "preacher")
    : BIBLE_QUOTES.filter((q) => q.type === "general");
  return {
    items: items.length > 0 ? items : BIBLE_QUOTES,
    type: isPreacher ? "preacher" : "general"
  };
}

/**
 * Media items.
 */
export function getBibleMediaList() {
  return { items: BIBLE_MEDIA };
}

/**
 * Typing trainer passages.
 */
export function getTypingPassages() {
  return { items: TYPING_PASSAGES };
}

// The explicit .ts extension lets Node resolve this when it runs the test
// suite and the import script directly from source. Without it both fail
// with ERR_MODULE_NOT_FOUND; webpack and tsc resolve it either way.
export { CPTI_ALL_PASSAGES, CPTI_MEMORY_PASSAGES, getMemoryPassages } from "./bible-memory-data.ts";
