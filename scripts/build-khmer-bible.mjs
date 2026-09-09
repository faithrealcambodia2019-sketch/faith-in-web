import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_URL =
  "https://raw.githubusercontent.com/hoktin/1954-khmer-bible-dataset/main/bible_books_v1.json";

const BOOK_METADATA = [
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

const metaMap = new Map();
for (const b of BOOK_METADATA) {
  metaMap.set(b.name.toLowerCase(), b);
}

async function main() {
  console.log("Fetching Khmer 1954 Bible dataset from:", DATASET_URL);
  const resp = await fetch(DATASET_URL);
  if (!resp.ok) {
    throw new Error(`Failed to fetch dataset: ${resp.status} ${resp.statusText}`);
  }

  const rawBooks = await resp.json();
  console.log(`Fetched ${rawBooks.length} books.`);

  const outputDirs = [
    path.resolve(__dirname, "../data/bible/khmer1954"),
    path.resolve(__dirname, "../../faith-in-platform/data/bible/khmer1954"),
  ];

  for (const dir of outputDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const indexList = [];
  let totalVersesAll = 0;
  let totalChaptersAll = 0;

  for (const rawBook of rawBooks) {
    const meta = metaMap.get(rawBook.name.toLowerCase());
    if (!meta) {
      console.warn(`[WARN] Unknown book name: "${rawBook.name}"`);
      continue;
    }

    const chaptersObj = {};
    let bookVerseCount = 0;

    for (const ch of rawBook.chapters || []) {
      const chNum = Number(ch.chapter_no);
      const versesObj = {};

      for (const v of ch.verses || []) {
        const vNum = Number(v.verse_num);
        const text = (v.verse_text || "").trim();
        if (text) {
          versesObj[vNum] = text;
          bookVerseCount++;
        }
      }

      chaptersObj[chNum] = {
        title: (ch.title || "").trim(),
        subTitle: (ch.sub_title || "").trim(),
        verses: versesObj,
        totalVerses: Object.keys(versesObj).length,
      };
    }

    const bookData = {
      usfm: meta.usfm,
      name: meta.name,
      khmerName: meta.khmerName,
      testament: meta.testament,
      chaptersCount: Object.keys(chaptersObj).length,
      versesCount: bookVerseCount,
      version: "KHMER_OLD_1954",
      versionLabel: "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប - Khmer Old Version)",
      chapters: chaptersObj,
    };

    totalVersesAll += bookVerseCount;
    totalChaptersAll += Object.keys(chaptersObj).length;

    indexList.push({
      usfm: meta.usfm,
      name: meta.name,
      khmerName: meta.khmerName,
      testament: meta.testament,
      chaptersCount: Object.keys(chaptersObj).length,
      versesCount: bookVerseCount,
      file: `${meta.usfm}.json`,
    });

    const jsonStr = JSON.stringify(bookData);

    for (const dir of outputDirs) {
      const filePath = path.join(dir, `${meta.usfm}.json`);
      fs.writeFileSync(filePath, jsonStr, "utf-8");
    }

    console.log(`Saved ${meta.usfm} (${meta.name} - ${meta.khmerName}): ${Object.keys(chaptersObj).length} ch, ${bookVerseCount} vs`);
  }

  const indexData = {
    version: "KHMER_OLD_1954",
    aliases: ["KHMER_OLD_1953", "KHMER1954", "K1954", "OVB"],
    label: "ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប - Khmer Old Version 1953/1954)",
    totalBooks: indexList.length,
    totalChapters: totalChaptersAll,
    totalVerses: totalVersesAll,
    books: indexList,
  };

  for (const dir of outputDirs) {
    fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify(indexData, null, 2), "utf-8");
  }

  console.log(`\nDONE! Processed ${indexList.length} books, ${totalChaptersAll} chapters, ${totalVersesAll} verses.`);
}

main().catch((err) => {
  console.error("Error building Khmer Bible dataset:", err);
  process.exit(1);
});
