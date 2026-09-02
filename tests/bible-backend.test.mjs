import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIBLE_BOOKS,
  findBibleBook,
  getBibleChapter,
  getParallelChapter,
  getDailyVerse,
  getConcordance,
  getBibleQuotes,
  getBibleMediaList,
  getTypingPassages,
  searchBible,
  getMemoryPassages,
} from '../lib/bible-service.ts';

test('Bible Service: CPTI Scripture Memory Catalog (5 Sections)', () => {
  const all = getMemoryPassages();
  assert.ok(all.items.length >= 30, 'Should contain all memorization passages');
  assert.equal(all.parts.length, 5, 'Should have 5 structured theological parts');

  // Part 1: Psalms & Wisdom
  const part1 = getMemoryPassages(1);
  assert.ok(part1.items.length >= 5, 'Part 1 should have Psalms and 1 Cor 13');
  assert.ok(part1.items.some(p => p.refKhmer.includes('ទំនុកដំកើង ២៣') || p.refKhmer.includes('ទំនុកដំកើង ១')));

  // Part 2: Christ & Salvation
  const part2 = getMemoryPassages(2);
  assert.ok(part2.items.some(p => p.refKhmer.includes('យ៉ូហាន ៣:១៦')));
  assert.ok(part2.items.some(p => p.refKhmer.includes('រ៉ូម ៦:២៣')));

  // Search in memory catalog
  const searchResult = getMemoryPassages(undefined, 'សេចក្តីស្រឡាញ់');
  assert.ok(searchResult.items.length > 0, 'Should find memory verses matching search term');
});

test('Bible Service: 66 Books Catalog', () => {
  assert.equal(BIBLE_BOOKS.length, 66, 'Should have all 66 canonical Bible books');
  const ot = BIBLE_BOOKS.filter(b => b.testament === 'OT');
  const nt = BIBLE_BOOKS.filter(b => b.testament === 'NT');
  assert.equal(ot.length, 39, 'Old Testament should have 39 books');
  assert.equal(nt.length, 27, 'New Testament should have 27 books');

  const john = findBibleBook('John');
  assert.equal(john.khmerName, 'យ៉ូហាន');
  assert.equal(john.usfm, 'JHN');
  assert.equal(john.chapters, 21);

  const psalms = findBibleBook('Psalms');
  assert.equal(psalms.khmerName, 'ទំនុកតម្កើង');
  assert.equal(psalms.usfm, 'PSA');
  assert.equal(psalms.chapters, 150);
});

test('Bible Service: Khmer Old Version 1954 Scripture Resolution', async () => {
  // John 3 in Khmer
  const john3 = await getBibleChapter('John', 3, 'KHMER_OLD_1954');
  assert.equal(john3.book, 'John');
  assert.equal(john3.khmerBook, 'យ៉ូហាន');
  assert.equal(john3.chapter, 3);
  assert.equal(john3.version, 'KHMER_OLD_1954');
  assert.ok(john3.items.length > 0, 'Should have verse items');

  const v16 = john3.items.find(i => i.v === 16);
  assert.ok(v16, 'Should contain verse 16');
  assert.ok(v16.text.includes('ព្រះទ្រង់ស្រឡាញ់មនុស្សលោក'), 'Verse 16 should match John 3:16 in Khmer');

  // Psalm 23 in Khmer
  const psalm23 = await getBibleChapter('Psalms', 23, 'KHMER_OLD_1954');
  assert.equal(psalm23.khmerBook, 'ទំនុកតម្កើង');
  const p1 = psalm23.items.find(i => i.v === 1);
  assert.ok(p1, 'Psalm 23:1 should exist');
  assert.ok(p1.text.includes('ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ'), 'Psalm 23:1 should match Khmer text');
});

test('Bible Service: English Translations (KJV, WEB, ASV)', async () => {
  const kjv = await getBibleChapter('John', 1, 'KJV');
  assert.equal(kjv.book, 'John');
  assert.equal(kjv.version, 'KJV');
  assert.ok(kjv.items.length > 0, 'KJV should return verses');
  assert.ok(kjv.items[0].text.length > 0, 'Verse text should not be empty');
});

test('Bible Service: Parallel Chapter Comparison', async () => {
  const parallel = await getParallelChapter('John', 3, 'KHMER_OLD_1954', 'KJV');
  assert.equal(parallel.book, 'John');
  assert.equal(parallel.version1, 'KHMER_OLD_1954');
  assert.equal(parallel.version2, 'KJV');
  assert.ok(parallel.items.length > 0, 'Parallel items should be generated');

  const item16 = parallel.items.find(i => i.v === 16);
  assert.ok(item16, 'Parallel item 16 should exist');
  assert.ok(item16.text1.includes('ព្រះទ្រង់ស្រឡាញ់មនុស្សលោក'), 'Khmer text column should be populated');
  assert.ok(item16.reference.includes('John 3:16') || item16.reference.includes('យ៉ូហាន'), 'Reference should match');
});

test('Bible Service: Daily Verse of the Day', () => {
  const daily = getDailyVerse();
  assert.ok(daily.passage, 'Should have passage identifier');
  assert.ok(daily.ref, 'Should have English reference');
  assert.ok(daily.khmerRef, 'Should have Khmer reference');
  assert.ok(daily.text, 'Should have English text');
  assert.ok(daily.khmer, 'Should have Khmer text');
  assert.ok(daily.devotionalTitle, 'Should have devotional title');
  assert.ok(daily.audioUrl.startsWith('/assets/audio/blessings/'), 'Should have audio blessing url');
});

test('Bible Service: Concordance & Word Study', () => {
  const grace = getConcordance('grace');
  assert.ok(grace.item, 'Should find grace word study');
  assert.equal(grace.item.original, 'χάρις');
  assert.equal(grace.item.strongs, 'G5485');
  assert.equal(grace.item.language, 'Greek');

  const faith = getConcordance('faith');
  assert.ok(faith.item, 'Should find faith word study');
  assert.equal(faith.item.strongs, 'G4102');

  const peace = getConcordance('peace');
  assert.ok(peace.item, 'Should find peace word study');
  assert.ok(peace.item.definition.length > 0);
});

test('Bible Service: Preacher & Christian Quotes', () => {
  const preachers = getBibleQuotes('preacher');
  assert.ok(preachers.items.length > 0, 'Should have preacher quotes');
  assert.ok(preachers.items.some(q => q.author.includes('Spurgeon')));
  assert.ok(preachers.items.some(q => q.author.includes('Wesley')));

  const general = getBibleQuotes('general');
  assert.ok(general.items.length > 0, 'Should have general Christian quotes');
  assert.ok(general.items.some(q => q.author.includes('Augustine') || q.author.includes('Lewis')));
});

test('Bible Service: Media Sanctuary & Typing Passages', () => {
  const media = getBibleMediaList();
  assert.ok(media.items.length >= 5, 'Should have at least 5 audio devotionals');
  assert.ok(media.items.every(m => m.url.endsWith('.mp3')));

  const typing = getTypingPassages();
  assert.ok(typing.items.length >= 3, 'Should have typing trainer passages');
  assert.ok(typing.items.some(t => t.id === 'psalm-23'));
});

test('Bible Service: Scripture Search', () => {
  const results = searchBible('ព្រះទ្រង់ស្រឡាញ់');
  assert.ok(results.items.length > 0, 'Should find verses matching search query');
  assert.ok(results.items[0].reference.includes('យ៉ូហាន 3:16'));
});
