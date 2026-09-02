/**
 * CPTI Scripture Memory Catalog — សាលាទេវវិទ្យាប្រេសប៊ីទែរានកម្ពុជា
 * Cambodia Presbyterian Theological Institute (CPTI)
 * Complete 5-Section Bible Memorization Passages (ខគម្ពីរចងចាំ)
 */

export interface MemoryPassage {
  id: string;
  part: number;
  partTitleKhmer: string;
  partTitleEnglish: string;
  book: string;
  chapter: number;
  verseRange: string;
  refKhmer: string;
  refEnglish: string;
  textKhmer: string;
  textEnglish: string;
  themeKhmer: string;
  themeEnglish: string;
}

export const CPTI_MEMORY_PASSAGES: MemoryPassage[] = [
  // ─── PART I: ទំនុកដំកើង & ប្រាជ្ញា (Psalms, Wisdom & Spiritual Armor) ───
  {
    id: "cpti-01-psalm1",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "Psalms",
    chapter: 1,
    verseRange: "1-6",
    refKhmer: "ទំនុកដំកើង ១:១-៦",
    refEnglish: "Psalm 1:1-6",
    textKhmer: "១មានពរហើយ អ្នកណាដែលមិនដើរតាមដំបូន្មានរបស់មនុស្សអាក្រក់ ក៏មិនឈរនៅក្នុងផ្លូវរបស់មនុស្សមានបាប ឬអង្គុយជាមួយនឹងពួកមនុស្សដែលមើលងាយ ២អ្នកនោះត្រេកអរតែនឹងក្រឹត្យវិន័យរបស់ព្រះយេហូវ៉ាវិញ ក៏រំពឹងគិតក្នុងក្រឹត្យវិន័យទ្រង់ទាំងយប់ទាំងថ្ងៃដែរ ៣អ្នកនោះនឹងដូចជាដើមឈើដែលដុះនៅក្បែរផ្លូវទឹក ដែលបង្កើតផលតាមរដូវកាល ហើយស្លឹកក៏មិនចេះស្រពោនឡើយ ឯការអ្វីដែលអ្នកនោះធ្វើ នោះនឹងចម្រើនឡើងទាំងអស់ ៤ចំណែកមនុស្សអាក្រក់ មិនដូច្នោះទេ គឺគេដូចជាអង្កាមវិញ ដែលខ្យល់ផាត់ខ្ចាត់ខ្ចាយទៅ ៥ដូច្នេះ ពួកមនុស្សអាក្រក់នឹងមិនធន់នៅក្នុងគ្រាជំនុំជម្រះទេ ឯពួកមានបាប ក៏មិនឈរក្នុងជំនុំមនុស្សសុចរិតបានដែរ ៦ដ្បិតព្រះយេហូវ៉ាទ្រង់ជ្រាបផ្លូវរបស់មនុស្សសុចរិត តែផ្លូវរបស់មនុស្សអាក្រក់នឹងវិនាសទៅវិញ។",
    textEnglish: "Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful. But his delight is in the law of the LORD; and in his law doth he meditate day and night.",
    themeKhmer: "ពរជ័យនៃមនុស្សសុចរិតដែលស្រឡាញ់ព្រះបន្ទូល",
    themeEnglish: "Blessedness of the Righteous in God's Law"
  },
  {
    id: "cpti-02-psalm3",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "Psalms",
    chapter: 3,
    verseRange: "1-8",
    refKhmer: "ទំនុកដំកើង ៣:១-៨",
    refEnglish: "Psalm 3:1-8",
    textKhmer: "១ឱព្រះយេហូវ៉ាអើយ ពួកខ្មាំងនៃទូលបង្គំមានគ្នាកាន់តែច្រើនឡើងយ៉ាងណា ន៎មានមនុស្សជាច្រើនបានលើកគ្នាទាស់នឹងទូលបង្គំហើយ ២មានគ្នាជាច្រើននិយាយពីព្រលឹងទូលបង្គំថា នៅក្នងព្រះគ្មានសេចក្តីសង្គ្រោះដល់វាទៀតទេ ៣ប៉ុន្តែឱព្រះយេហូវ៉ាអើយ ទ្រង់ជាខែលបាំងទូលបង្គំជុំវិញ ក៏ជាសិរីល្អនៃទូលបង្គំ ហើយជាអ្នកលើកក្បាលទូលបង្គំឡើងដែរ ៤ខ្ញុំឡើងសំឡេងអំពាវនាវដល់ព្រះយេហូវ៉ា ហើយទ្រង់ឆ្លើយតបមកខ្ញុំពីលើភ្នំបរិសុទ្ធរបស់ទ្រង់ ៥ខ្ញុំបានដេកលក់ទៅ ហើយក៏ភ្ញាក់ឡើងវិញ ដ្បិតព្រះយេហូវ៉ាទ្រង់ទប់ទល់ខ្ញុំ ៦ខ្ញុំមិនខ្លាចដល់មនុស្សទាំងសែននាក់ ដែលបានតាំងខ្លួនព័ទ្ធជុំវិញទាស់នឹងខ្ញុំឡើយ ៧ឱព្រះយេហូវ៉ាអើយ សូមទ្រង់ក្រោកឡើង ឱព្រះនៃទូលបង្គំអើយ សូមទ្រង់ជួយសង្គ្រោះទូលបង្គំផង ៨ឯសេចក្តីសង្គ្រោះ នោះស្រេចនៅព្រះយេហូវ៉ា សូមឲ្យព្រះពរទ្រង់បាននៅលើរាស្ត្រទ្រង់ចុះ។",
    textEnglish: "But thou, O LORD, art a shield for me; my glory, and the lifter up of mine head. I cried unto the LORD with my voice, and he heard me out of his holy hill. Salvation belongeth unto the LORD: thy blessing is upon thy people.",
    themeKhmer: "ព្រះជាខែលការពារ និងជាសេចក្តីសង្គ្រោះ",
    themeEnglish: "The Lord as Shield and Deliverer"
  },
  {
    id: "cpti-03-psalm8",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "Psalms",
    chapter: 8,
    verseRange: "1-9",
    refKhmer: "ទំនុកដំកើង ៨:១-៩",
    refEnglish: "Psalm 8:1-9",
    textKhmer: "១ឱព្រះយេហូវ៉ា ជាព្រះអម្ចាស់នៃយើងខ្ញុំអើយ ព្រះនាមទ្រង់ប្រសើរបំផុតលើផែនដីយ៉ាងណាហ្ន៎ ទ្រង់បានតម្កល់សិរីល្អទ្រង់ទុកនៅលើស្ថានសួគ៌ ២ទ្រង់បានតាំងឲ្យមានសេចក្តីសរសើរដោយសារមាត់កូនក្មេង និងកូនដែលនៅបៅដោះ ៣កាលណាទូលបង្គំពិចារណាមើលផ្ទៃមេឃជាការដែលព្រះហស្តទ្រង់បានធ្វើ គឺទាំងខែ និងផ្កាយ ដែលទ្រង់បានប្រតិស្ឋានទុក ៤នោះតើមនុស្សជាអ្វី ដែលទ្រង់នឹកគិតដល់ ហើយកូនមនុស្សផង ដែលទ្រង់ប្រោសដូច្នេះ ៩ឱព្រះយេហូវ៉ា ជាព្រះអម្ចាស់នៃយើងខ្ញុំអើយ ព្រះនាមទ្រង់ប្រសើរលើផែនដីយ៉ាងណាហ្ន៎។",
    textEnglish: "O LORD our Lord, how excellent is thy name in all the earth! who hast set thy glory above the heavens. When I consider thy heavens, the work of thy fingers, the moon and the stars, which thou hast ordained; What is man, that thou art mindful of him?",
    themeKhmer: "ភាពឧត្តមនៃព្រះនាមព្រះ និងសេចក្តីស្រឡាញ់ចំពោះមនុស្ស",
    themeEnglish: "Majesty of God's Creation and Care for Humanity"
  },
  {
    id: "cpti-04-psalm23",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "Psalms",
    chapter: 23,
    verseRange: "1-6",
    refKhmer: "ទំនុកដំកើង ២៣:១-៦",
    refEnglish: "Psalm 23:1-6",
    textKhmer: "១ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ ២ទ្រង់ឲ្យខ្ញុំដេកសម្រាកនៅទីមានស្មៅខៀវខ្ចី ទ្រង់នាំខ្ញុំទៅក្បែរមាត់ទឹកដែលហូរត្រជាក់ ៣ទ្រង់កែប្រលឹងខ្ញុំឡើងវិញ ទ្រង់នាំខ្ញុំទៅតាមផ្លូវសុចរិតដោយយល់ដល់ព្រះនាមទ្រង់ ៤អើ ទោះបើទូលបង្គំដើរកាត់ច្រកភ្នំនៃស្រមោលសេចក្តីស្លាប់ ក៏ដោយគង់តែមិនខ្លាចសេចក្តីអាក្រក់ណាឡើយ ដ្បិតទ្រង់គង់នៅជាមួយនឹងទូលបង្គំ ដំបង និងច្រត់របស់ទ្រង់កម្សាន្តចិត្តទូលបង្គំ ៥ទ្រង់រៀបតុនៅមុខទូលបង្គំ ចំពោះមុខពួកខ្មាំងសត្រូវផង ទ្រង់ចាក់ប្រេងលាបលើក្បាលទូលបង្គំ ពែងនៃទូលបង្គំក៏ពេញហៀរ ៦ប្រាកដជាសេចក្តីសប្បុរស និងសេចក្តីមេត្តាករុណានឹងជាប់តាមខ្ញុំរាល់តែថ្ងៃ ដរាបដល់អស់មួយជីវិតខ្ញុំ ហើយខ្ញុំនឹងនៅក្នុងដំណាក់នៃព្រះយេហូវ៉ាជារៀងដរាបទៅ។",
    textEnglish: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.",
    themeKhmer: "ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលដ៏ល្អ",
    themeEnglish: "The Lord is My Shepherd"
  },
  {
    id: "cpti-05-psalm100",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "Psalms",
    chapter: 100,
    verseRange: "1-5",
    refKhmer: "ទំនុកដំកើង ១០០:១-៥",
    refEnglish: "Psalm 100:1-5",
    textKhmer: "១ម្នាល បណ្តាជននៅផែនដីអើយ ចូរឡើងសំឡេងដោយអំណរថ្វាយព្រះយេហូវ៉ា ២ចូរគោរពប្រតិបត្តិដល់ព្រះយេហូវ៉ា ដោយអរសប្បាយ ឲ្យចូលមកនៅចំពោះទ្រង់ ដោយច្រៀងចម្រៀងចុះ ៣ត្រូវឲ្យដឹងថា ព្រះយេហូវ៉ាទ្រង់ជាព្រះ គឺទ្រង់ដែលបានបង្កើតយើងខ្ញុំ យើងខ្ញុំជារបស់ផងទ្រង់ យើងខ្ញុំជារាស្ត្ររបស់ទ្រង់ ហើយជាហ្វូងចៀមនៅទីគង្វាលរបស់ទ្រង់ ៤ចូរនាំគ្នាចូលតាមទ្វារទ្រង់ ដោយពាក្យអរព្រះគុណ ហើយចូលទៅក្នុងទីលានទ្រង់ ដោយសរសើរ ៥ពីព្រោះព្រះយេហូវ៉ាទ្រង់ល្អ សេចក្តីសប្បុរសនៃទ្រង់ស្ថិតស្ថេរនៅជានិច្ច ហើយសេចក្តីស្មោះត្រង់របស់ទ្រង់ ក៏នៅអស់ទាំងដំណមនុស្សតទៅ។",
    textEnglish: "Make a joyful noise unto the LORD, all ye lands. Serve the LORD with gladness: come before his presence with singing. For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
    themeKhmer: "ការអរព្រះគុណ និងសរសើរតម្កើងព្រះដ៏ល្អ",
    themeEnglish: "A Psalm of Thanksgiving and Praise"
  },
  {
    id: "cpti-06-psalm136",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "Psalms",
    chapter: 136,
    verseRange: "1-26",
    refKhmer: "ទំនុកដំកើង ១៣៦:១-៣",
    refEnglish: "Psalm 136:1-3",
    textKhmer: "១ឱសូមអរព្រះគុណដល់ព្រះយេហូវ៉ា ដ្បិតទ្រង់ល្អ សេចក្តីសប្បុរសរបស់ទ្រង់ស្ថិតស្ថេរនៅជានិច្ច ២ឱសូមអរព្រះគុណដល់ព្រះដ៏ធំលើអស់ទាំងព្រះ ដ្បិតសេចក្តីសប្បុរសរបស់ទ្រង់ស្ថិតស្ថេរនៅជានិច្ច ៣ឱសូមអរព្រះគុណដល់ព្រះអម្ចាស់ដ៏ធំលើអស់ទាំងព្រះអម្ចាស់ ដ្បិតសេចក្តីសប្បុរសរបស់ទ្រង់ស្ថិតស្ថេរនៅជានិច្ច។",
    textEnglish: "O give thanks unto the LORD; for he is good: for his mercy endureth for ever. O give thanks unto the God of gods: for his mercy endureth for ever. O give thanks to the Lord of lords: for his mercy endureth for ever.",
    themeKhmer: "សេចក្តីសប្បុរសរបស់ទ្រង់ស្ថិតស្ថេរនៅជានិច្ច",
    themeEnglish: "His Mercy Endureth Forever"
  },
  {
    id: "cpti-07-1cor13",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "1 Corinthians",
    chapter: 13,
    verseRange: "1-13",
    refKhmer: "១ កូរិនថូស ១៣:៤-៨, ១៣",
    refEnglish: "1 Corinthians 13:4-8, 13",
    textKhmer: "៤ឯសេចក្តីស្រឡាញ់ តែងតែអត់ធ្មត់ ហើយក៏សប្បុរស សេចក្តីស្រឡាញ់មិនចេះច្រណែន មិនចេះអួតខ្លួន ក៏មិនដែលមានចិត្តធំផង ៥មិនដែលប្រព្រឹត្តបែបមិនគួរសម មិនដែលរកប្រយោជន៍ផ្ទាល់ខ្លួន មិនរហ័សខឹង មិនប្រកាន់ទោស ៦មិនដែលអរសប្បាយចំពោះសេចក្តីទុច្ចរិតឡើយ គឺអរសប្បាយតែនឹងសេចក្តីស្មោះត្រង់វិញ ៧ក៏គ្របបាំងទាំងអស់ ជឿទាំងអស់ សង្ឃឹមទាំងអស់ ហើយទ្រាំទ្រទាំងអស់ ៨សេចក្តីស្រឡាញ់មិនដែលផុតឡើយ... ១៣ឥឡូវនេះ នៅមានសេចក្តីជំនឿ សេចក្តីសង្ឃឹម និងសេចក្តីស្រឡាញ់ ទាំង៣មុខនេះ តែសេចក្តីដែលវិសេសជាងគេ គឺជាសេចក្តីស្រឡាញ់។",
    textEnglish: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up... And now abideth faith, hope, charity, these three; but the greatest of these is charity.",
    themeKhmer: "លក្ខណៈនៃសេចក្តីស្រឡាញ់ដ៏ពិតរបស់ព្រះ",
    themeEnglish: "The Nature of Divine Love"
  },
  {
    id: "cpti-08-ephesians6",
    part: 1,
    partTitleKhmer: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា",
    partTitleEnglish: "Part I: Psalms & Wisdom",
    book: "Ephesians",
    chapter: 6,
    verseRange: "10-18",
    refKhmer: "អេភេសូរ ៦:១០-១៨",
    refEnglish: "Ephesians 6:10-18",
    textKhmer: "១០ឯសេចក្តីឯទៀត បងប្អូនអើយ ចូរឲ្យមានកម្លាំងឡើងក្នុងព្រះអម្ចាស់ ដោយឫទ្ធិបារមីនៃព្រះចេស្ដាទ្រង់ ១១ចូរពាក់គ្រប់គ្រឿងសឹករបស់ព្រះ ដើម្បីឲ្យអាចនឹងឈរមាំមួន ទាស់នឹងឧបាយកលទាំងអម្បាលម៉ានរបស់អារក្ស ១២ដ្បិតយើងរាល់គ្នាមិនមែនតយុទ្ធនឹងសាច់ឈាមទេ គឺតយុទ្ធនឹងពួកគ្រប់គ្រង ពួកមានអំណាច នឹងពួកអំណាចងងឹត... ១៤ដូច្នេះ ចូរឈរមាំមួនចុះ ដោយក្រវាត់សេចក្តីពិតនៅចង្កេះ ពាក់សេចក្តីសុចរិតជាប្រដាប់បាំងទ្រូង ១៥ពាក់សេចក្តីប្រុងប្រៀបនៃដំណឹងល្អ ១៦យកសេចក្តីជំនឿជាខែល ១៧ពាក់មួកសឹកនៃសេចក្តីសង្គ្រោះ និងដាវនៃព្រះវិញ្ញាណ គឺជាព្រះបន្ទូលនៃព្រះ។",
    textEnglish: "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil. For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world.",
    themeKhmer: "គ្រឿងសឹកទាំងមូលរបស់ព្រះសម្រាប់ចម្បាំងខាងវិញ្ញាណ",
    themeEnglish: "The Whole Armour of God"
  },

  // ─── PART II: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ (Christ, The Cross & Salvation) ───
  {
    id: "cpti-09-john3-16",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "John",
    chapter: 3,
    verseRange: "16",
    refKhmer: "យ៉ូហាន ៣:១៦",
    refEnglish: "John 3:16",
    textKhmer: "«ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ»។",
    textEnglish: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    themeKhmer: "បេះដូងនៃដំណឹងល្អ៖ ជីវិតអស់កល្បជានិច្ចក្នុងព្រះគ្រីស្ទ",
    themeEnglish: "God's Greatest Gift to the World"
  },
  {
    id: "cpti-10-isaiah53",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "Isaiah",
    chapter: 53,
    verseRange: "4-6",
    refKhmer: "អេសាយ ៥៣:៤-៦",
    refEnglish: "Isaiah 53:4-6",
    textKhmer: "៤ទ្រង់បានទ្រាំទ្រ រងអស់ទាំងសេចក្តីឈឺចាប់របស់យើង ហើយបានទទួលផ្ទុកអស់ទាំងសេចក្តីទុក្ខព្រួយរបស់យើងជាពិត ៥តែទ្រង់ត្រូវរបួស ដោយព្រោះអំពើរំលងរបស់យើង ក៏ត្រូវវាយជាំ ដោយព្រោះអំពើទុច្ចរិតរបស់យើងទេ ឯការវាយផ្ចាលដែលនាំឲ្យយើងបានជាមេត្រីនោះ បានធ្លាក់ទៅលើទ្រង់ ហើយយើងរាល់គ្នាបានប្រោសឲ្យជា ដោយសារស្នាមរំពាត់នៅអង្គទ្រង់ ៦យើងទាំងអស់គ្នាបានវង្វេងចេញដូចជាចៀម គឺយើងបានបែរចេញទៅតាមផ្លូវយើងរៀងខ្លួន ហើយព្រះយេហូវ៉ាបានទម្លាក់អំពើទុច្ចរិតរបស់យើងទាំងអស់គ្នាទៅលើទ្រង់។",
    textEnglish: "Surely he hath borne our griefs, and carried our sorrows... But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
    themeKhmer: "ការរងទុក្ខ និងការលោះបាបដោយព្រះគ្រីស្ទនៅលើឈើឆ្កាង",
    themeEnglish: "The Suffering Servant and Atonement"
  },
  {
    id: "cpti-11-romans3-23-24",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "Romans",
    chapter: 3,
    verseRange: "23-24",
    refKhmer: "រ៉ូម ៣:២៣-២៤",
    refEnglish: "Romans 3:23-24",
    textKhmer: "២៣ពីព្រោះគ្រប់គ្នាបានធ្វើបាប ហើយខ្វះមិនដល់សិរីល្អនៃព្រះ ២៤តែដោយពឹងដល់ព្រះគុណទ្រង់ នោះបានរាប់ជាសុចរិតទទេ ដោយសារសេចក្តីប្រោសលោះ ដែលនៅក្នងព្រះគ្រីស្ទយេស៊ូវ។",
    textEnglish: "For all have sinned, and come short of the glory of God; Being justified freely by his grace through the redemption that is in Christ Jesus.",
    themeKhmer: "ការរាប់ជាសុចរិតដោយសារព្រះគុណតាមរយៈសេចក្តីជំនឿ",
    themeEnglish: "Justified Freely by His Grace"
  },
  {
    id: "cpti-12-romans6-23",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "Romans",
    chapter: 6,
    verseRange: "23",
    refKhmer: "រ៉ូម ៦:២៣",
    refEnglish: "Romans 6:23",
    textKhmer: "«ដ្បិតឈ្នួលរបស់អំពើបាប នោះជាសេចក្តីស្លាប់ តែអំណោយទាននៃព្រះវិញ គឺជាជីវិតដ៏នៅអស់កល្បជានិច្ច ដោយសារព្រះគ្រីស្ទយេស៊ូវ ជាព្រះអម្ចាស់នៃយើងរាល់គ្នា»។",
    textEnglish: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
    themeKhmer: "ឈ្នួលនៃអំពើបាប និងអំណោយទាននៃជីវិតអស់កល្ប",
    themeEnglish: "The Gift of Eternal Life"
  },
  {
    id: "cpti-13-acts4-12",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "Acts",
    chapter: 4,
    verseRange: "12",
    refKhmer: "កិច្ចការ ៤:១២",
    refEnglish: "Acts 4:12",
    textKhmer: "«ហើយគ្មានសេចក្តីសង្គ្រោះ ដោយសារអ្នកណាក្រៅទៀតសោះ ដ្បិតនៅក្រោមមេឃ គ្មាននាមឈ្មោះណាក្រៅទៀតបានប្រទានមកមនុស្សលោក ឲ្យយើងរាល់គ្នាបានសង្គ្រោះនោះឡើយ»។",
    textEnglish: "Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.",
    themeKhmer: "ព្រះនាមព្រះយេស៊ូវជាផ្លូវសង្គ្រោះតែមួយគត់",
    themeEnglish: "Salvation in No Other Name"
  },
  {
    id: "cpti-14-philippians2",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "Philippians",
    chapter: 2,
    verseRange: "5-11",
    refKhmer: "ភីលីព ២:៥-១១",
    refEnglish: "Philippians 2:5-11",
    textKhmer: "៥ត្រូវតែមានគំនិតគិតដូចជាព្រះគ្រីស្ទយេស៊ូវវិញ ៦ដែលទោះបើទ្រង់មានរូបអង្គជាព្រះក៏ដោយ គង់តែមិនបានរាប់សេចក្តីដែលស្មើនឹងព្រះនោះ ទុកជាសេចក្តីដែលគួរកាន់ខ្ជាប់ឡើយ ៧គឺទ្រង់បានលះបង់ព្រះអង្គទ្រង់ មកយករូបភាពជាបាវបម្រើវិញ ៨ទ្រង់ក៏បន្ទាបព្រះអង្គទ្រង់ ទាំងចុះចូលស្តាប់បង្គាប់ រហូតដល់ទីមរណៈ គឺទ្រង់ទទួលសុគតជាប់លើឈើឆ្កាង ៩ហេតុនោះបានជាព្រះបានលើកទ្រង់ឡើងយ៉ាងខ្ពស់ ហើយបានប្រទានឲ្យមាននាមដ៏ប្រសើរលើសជាងអស់ទាំងនាមផង ១០ដើម្បីកាលណាឮព្រះនាមព្រះយេស៊ូវ នោះឲ្យគ្រប់ទាំងជង្គង់លុតចុះ ១១ហើយឲ្យគ្រប់ទាំងអណ្ដាតបានថ្លែងប្រាប់ថា ព្រះយេស៊ូវគ្រីស្ទទ្រង់ជាព្រះអម្ចាស់។",
    textEnglish: "Let this mind be in you, which was also in Christ Jesus... Wherefore God also hath highly exalted him, and given him a name which is above every name: That at the name of Jesus every knee should bow.",
    themeKhmer: "ការបន្ទាបខ្លួន និងការតម្កើងឡើងនៃព្រះគ្រីស្ទ",
    themeEnglish: "The Humility and Exaltation of Christ"
  },
  {
    id: "cpti-15-galatians2-20",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "Galatians",
    chapter: 2,
    verseRange: "20",
    refKhmer: "កាឡាទី ២:២០",
    refEnglish: "Galatians 2:20",
    textKhmer: "«ខ្ញុំបានជាប់ឆ្កាងជាមួយនឹងព្រះគ្រីស្ទ ប៉ុន្តែខ្ញុំរស់នៅ មិនមែនជាខ្ញុំទៀត គឺជាព្រះគ្រីស្ទទ្រង់រស់ក្នុងខ្ញុំវិញ ហើយដែលខ្ញុំរស់ក្នុងសាច់ឈាមឥឡូវនេះ នោះគឺរស់ដោយសេចក្តីជំនឿ ជឿដល់ព្រះរាជបុត្រានៃព្រះ ដែលទ្រង់ស្រឡាញ់ខ្ញុំ ក៏បានប្រគល់ព្រះអង្គទ្រង់ជំនួសខ្ញុំហើយ»។",
    textEnglish: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
    themeKhmer: "ជីវិតដែលត្រូវឆ្កាង និងរស់នៅដោយព្រះគ្រីស្ទ",
    themeEnglish: "Crucified with Christ, Living by Faith"
  },
  {
    id: "cpti-16-matthew28-18-20",
    part: 2,
    partTitleKhmer: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ",
    partTitleEnglish: "Part II: Christ & Salvation",
    book: "Matthew",
    chapter: 28,
    verseRange: "18-20",
    refKhmer: "ម៉ាថាយ ២៨:១៨-២០",
    refEnglish: "Matthew 28:18-20",
    textKhmer: "១៨ឯព្រះយេស៊ូវ ទ្រង់យាងមកមានបន្ទូលនឹងគេថា គ្រប់ទាំងអំណាចបានប្រគល់មកខ្ញុំនៅលើស្ថានសួគ៌ និងលើផែនដីផង ១៩ដូច្នេះ ចូរទៅបញ្ចុះបញ្ចូលឲ្យមានសិស្សនៅគ្រប់ទាំងសាសន៍ ព្រមទាំងធ្វើបុណ្យជ្រមុជទឹកឲ្យ ដោយនូវព្រះនាមព្រះវរបិតា ព្រះរាជបុត្រា និងព្រះវិញ្ញាណបរិសុទ្ធចុះ ២០ហើយបង្រៀនឲ្យគេកាន់តាមគ្រប់ទាំងសេចក្តី ដែលខ្ញុំបានបង្គាប់មកអ្នករាល់គ្នាផង ហើយមើល ខ្ញុំក៏នៅជាមួយអ្នករាល់គ្នាជារាល់ថ្ងៃដែរ ដរាបដល់បំផុតកល្ប។ អាមែន។",
    textEnglish: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world.",
    themeKhmer: "បញ្ជាបេសកកម្មដ៏អស្ចារ្យ (The Great Commission)",
    themeEnglish: "The Great Commission"
  },

  // ─── PART III: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន (Holy Spirit & Prayer) ───
  {
    id: "cpti-17-zechariah4-6",
    part: 3,
    partTitleKhmer: "ផ្នែកទី ៣: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន",
    partTitleEnglish: "Part III: Holy Spirit & Prayer",
    book: "Zechariah",
    chapter: 4,
    verseRange: "6",
    refKhmer: "សាការី ៤:៦",
    refEnglish: "Zechariah 4:6",
    textKhmer: "«មិនមែនដោយឥទ្ធិឫទ្ធិ ឬដោយអំណាចទេ គឺដោយសារវិញ្ញាណរបស់អញវិញ នេះជាព្រះបន្ទូលនៃព្រះយេហូវ៉ានៃពួកពលបរិវារ»។",
    textEnglish: "Not by might, nor by power, but by my spirit, saith the LORD of hosts.",
    themeKhmer: "ការធ្វើកិច្ចការដោយព្រះវិញ្ញាណ មិនមែនដោយកម្លាំងមនុស្ស",
    themeEnglish: "Not by Might nor Power, but by My Spirit"
  },
  {
    id: "cpti-18-romans8-26-27",
    part: 3,
    partTitleKhmer: "ផ្នែកទី ៣: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន",
    partTitleEnglish: "Part III: Holy Spirit & Prayer",
    book: "Romans",
    chapter: 8,
    verseRange: "26-27",
    refKhmer: "រ៉ូម ៨:២៦-២៧",
    refEnglish: "Romans 8:26-27",
    textKhmer: "២៦ព្រះវិញ្ញាណទ្រង់ក៏ជួយសេចក្តីកម្សោយរបស់យើងបែបដូច្នោះដែរ ដ្បិតយើងមិនដឹងជាគួរអធិស្ឋានសូមអ្វីទេ តែព្រះវិញ្ញាណទ្រង់ជួយអង្វរជំនួសយើង ដោយដំងូរដែលរកថ្លែងពុំបានវិញ ២៧ប៉ុន្តែព្រះអង្គដែលស្ទង់ចិត្ត ទ្រង់ជ្រាបនូវគំនិតនៃព្រះវិញ្ញាណ ដ្បិតព្រះវិញ្ញាណជួយអង្វរជួសពួកបរិសុទ្ធឲ្យត្រូវនឹងព្រះហឫទ័យព្រះ។",
    textEnglish: "Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be uttered.",
    themeKhmer: "ព្រះវិញ្ញាណបរិសុទ្ធជួយក្នុងការអធិស្ឋាន",
    themeEnglish: "The Holy Spirit Helps in Our Weakness and Prayer"
  },
  {
    id: "cpti-19-matthew6-6-7",
    part: 3,
    partTitleKhmer: "ផ្នែកទី ៣: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន",
    partTitleEnglish: "Part III: Holy Spirit & Prayer",
    book: "Matthew",
    chapter: 6,
    verseRange: "6-7",
    refKhmer: "ម៉ាថាយ ៦:៦-៧",
    refEnglish: "Matthew 6:6-7",
    textKhmer: "៦តែឯអ្នក កាលណាអធិស្ឋាន នោះត្រូវឲ្យចូលទៅក្នុងបន្ទប់ ហើយបិទទ្វារ រួចអធិស្ឋានដល់ព្រះវរបិតានៃអ្នក ដែលទ្រង់គង់នៅទីលាក់កំបាំងចុះ នោះព្រះវរបិតានៃអ្នក ដែលទតឃើញក្នុងទីលាក់កំបាំង ទ្រង់នឹងប្រទានរង្វាន់ដល់អ្នកនៅទីប្រចក្សច្បាស់ ៧ហើយកាលណាអធិស្ឋាន នោះកុំឲ្យពោលពាក្យឥតប្រយោជន៍ផ្ទួនៗ ដូចពួកសាសន៍ដទៃឡើយ។",
    textEnglish: "But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly.",
    themeKhmer: "ការអធិស្ឋានដោយចិត្តស្មោះត្រង់ក្នុងទីស្ងាត់កំបាំង",
    themeEnglish: "Secret and Sincere Prayer"
  },
  {
    id: "cpti-20-matthew7-7-8",
    part: 3,
    partTitleKhmer: "ផ្នែកទី ៣: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន",
    partTitleEnglish: "Part III: Holy Spirit & Prayer",
    book: "Matthew",
    chapter: 7,
    verseRange: "7-8",
    refKhmer: "ម៉ាថាយ ៧:៧-៨",
    refEnglish: "Matthew 7:7-8",
    textKhmer: "៧ចូរសូម នោះតែងនឹងឲ្យមកអ្នក ចូររក នោះតែងនឹងឃើញ ចូរគោះ នោះតែងនឹងបើកឲ្យអ្នក ៨ដ្បិតអស់អ្នកណាដែលសូម នោះរមែងបាន អ្នកណាដែលរក នោះរមែងឃើញ ហើយនឹងបើកឲ្យអ្នកណាដែលគោះដែរ។",
    textEnglish: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you: For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened.",
    themeKhmer: "ចូរសូម ចូររក ចូរគោះទ្វារ",
    themeEnglish: "Ask, Seek, Knock"
  },
  {
    id: "cpti-21-john15-7",
    part: 3,
    partTitleKhmer: "ផ្នែកទី ៣: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន",
    partTitleEnglish: "Part III: Holy Spirit & Prayer",
    book: "John",
    chapter: 15,
    verseRange: "7",
    refKhmer: "យ៉ូហាន ១៥:៧",
    refEnglish: "John 15:7",
    textKhmer: "«បើអ្នករាល់គ្នានៅជាប់នឹងខ្ញុំ ហើយពាក្យខ្ញុំនៅជាប់ក្នុងអ្នករាល់គ្នា នោះចូរសូមអ្វីតាមតែប្រាថ្នាចុះ សេចក្តីនោះនឹងបានសម្រេចដល់អ្នករាល់គ្នាជាមិនខាន»។",
    textEnglish: "If ye abide in me, and my words abide in you, ye shall ask what ye will, and it shall be done unto you.",
    themeKhmer: "ការនៅជាប់ក្នុងព្រះគ្រីស្ទ និងការឆ្លើយតបនៃការអធិស្ឋាន",
    themeEnglish: "Abiding in Christ and Answered Prayer"
  },
  {
    id: "cpti-22-acts1-8",
    part: 3,
    partTitleKhmer: "ផ្នែកទី ៣: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន",
    partTitleEnglish: "Part III: Holy Spirit & Prayer",
    book: "Acts",
    chapter: 1,
    verseRange: "8",
    refKhmer: "កិច្ចការ ១:៨",
    refEnglish: "Acts 1:8",
    textKhmer: "«ប៉ុន្តែ កាលណាព្រះវិញ្ញាណបរិសុទ្ធបានយាងមកសណ្ឋិតលើអ្នករាល់គ្នា នោះអ្នករាល់គ្នានឹងបានព្រះចេស្ដា ហើយនឹងធ្វើជាទីបន្ទាល់ពីខ្ញុំ នៅក្រុងយេរូសាឡិម ព្រមទាំងស្រុកយូដា និងស្រុកសាម៉ារីទាំងមូល ហើយរហូតដល់ចុងផែនដីបំផុតផង»។",
    textEnglish: "But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.",
    themeKhmer: "ព្រះចេស្ដានៃព្រះវិញ្ញាណបរិសុទ្ធដើម្បីធ្វើជាទីបន្ទាល់",
    themeEnglish: "Power of the Holy Spirit for Witnessing"
  },

  // ─── PART IV: ព្រះបន្ទូល & ដំណើរនៃសេចក្តីជំនឿ (The Word & Walking in Faith) ───
  {
    id: "cpti-23-romans8-28",
    part: 4,
    partTitleKhmer: "ផ្នែកទី ៤: ព្រះបន្ទូល & ជំនឿ",
    partTitleEnglish: "Part IV: The Word & Faith",
    book: "Romans",
    chapter: 8,
    verseRange: "28",
    refKhmer: "រ៉ូម ៨:២៨",
    refEnglish: "Romans 8:28",
    textKhmer: "«តែយើងដឹងថា គ្រប់ការទាំងអស់ផ្សំគ្នា សម្រាប់សេចក្តីល្អដល់ពួកអ្នកដែលស្រឡាញ់ព្រះ គឺដល់ពួកអ្នកដែលទ្រង់ហៅមក តាមព្រះតម្រិះទ្រង់»។",
    textEnglish: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    themeKhmer: "គ្រប់ការទាំងអស់ផ្សំគ្នាសម្រាប់សេចក្តីល្អ",
    themeEnglish: "All Things Work Together for Good"
  },
  {
    id: "cpti-24-romans8-38-39",
    part: 4,
    partTitleKhmer: "ផ្នែកទី ៤: ព្រះបន្ទូល & ជំនឿ",
    partTitleEnglish: "Part IV: The Word & Faith",
    book: "Romans",
    chapter: 8,
    verseRange: "38-39",
    refKhmer: "រ៉ូម ៨:៣៨-៣៩",
    refEnglish: "Romans 8:38-39",
    textKhmer: "៣៨ដ្បិតខ្ញុំជឿជាក់ថា ទោះស្លាប់ ឬរស់ ពួកទេវតា ឬអំណាចអ្វី ការអ្វីនៅជាន់នោះ ឬនៅមុខ ឬឥទ្ធិឫទ្ធិអ្វី ៣៩ទីមានកម្ពស់ ទីជម្រៅ ឬរបស់អ្វីដែលកើតមកឯទៀតក្តី នោះពុំអាចនឹងពង្រាត់យើង ចេញពីសេចក្តីស្រឡាញ់របស់ព្រះ ដែលនៅក្នុងព្រះគ្រីស្ទយេស៊ូវ ជាព្រះអម្ចាស់នៃយើងរាល់គ្នាទៅ បានឡើយ។",
    textEnglish: "For I am persuaded, that neither death, nor life, nor angels, nor principalities... shall be able to separate us from the love of God, which is in Christ Jesus our Lord.",
    themeKhmer: "គ្មានអ្វីអាចពង្រាត់យើងពីសេចក្តីស្រឡាញ់របស់ព្រះបានឡើយ",
    themeEnglish: "Nothing Can Separate Us from God's Love"
  },
  {
    id: "cpti-25-genesis12-1-3",
    part: 4,
    partTitleKhmer: "ផ្នែកទី ៤: ព្រះបន្ទូល & ជំនឿ",
    partTitleEnglish: "Part IV: The Word & Faith",
    book: "Genesis",
    chapter: 12,
    verseRange: "1-3",
    refKhmer: "លោកុប្បត្តិ ១២:១-៣",
    refEnglish: "Genesis 12:1-3",
    textKhmer: "១ព្រះយេហូវ៉ាទ្រង់មានបន្ទូលនឹងអ័ប្រាហាំថា ចូរឯងចេញពីស្រុក ពីញាតិសន្តាន និងពីផ្ទះឪពុកឯង ទៅនៅឯស្រុកដែលអញនឹងបង្ហាញឯងចុះ ២អញនឹងបង្កើតនគរ១យ៉ាងធំពីឯង អញនឹងឲ្យពរដល់ឯង ទាំងលើកឈ្មោះឯងធំផង ឯងនឹងបានធ្វើជាទីបញ្ចេញពរដល់មនុស្សទាំងឡាយ ៣អញនឹងឲ្យពរដល់អស់អ្នកណាដែលឲ្យពរដល់ឯង ហើយគ្រប់ទាំងគ្រួនៅលើផែនដីនឹងបានពរដោយសារឯង។",
    textEnglish: "Now the LORD had said unto Abram, Get thee out of thy country... And I will make of thee a great nation, and I will bless thee... and in thee shall all families of the earth be blessed.",
    themeKhmer: "ការត្រាស់ហៅអ័ប្រាហាំ និងសេចក្តីសញ្ញានៃព្រះពរ",
    themeEnglish: "God's Covenant Call with Abraham"
  },
  {
    id: "cpti-26-hebrews11-1",
    part: 4,
    partTitleKhmer: "ផ្នែកទី ៤: ព្រះបន្ទូល & ជំនឿ",
    partTitleEnglish: "Part IV: The Word & Faith",
    book: "Hebrews",
    chapter: 11,
    verseRange: "1, 6",
    refKhmer: "ហេព្រើរ ១១:១, ៦",
    refEnglish: "Hebrews 11:1, 6",
    textKhmer: "១ឯសេចក្តីជំនឿ គឺជាសេចក្តីពិតជាក់នៃរបស់ទាំងឡាយដែលយើងសង្ឃឹម នឹងជាភស្តុតាងនៃរបស់ទាំងឡាយដែលមើលមិនឃើញ ៦តែបើឥតមានសេចក្តីជំនឿទេ នោះមិនអាចនឹងគាប់ដល់ព្រះហឫទ័យព្រះបានឡើយ ដ្បិតអ្នកណាដែលចូលទៅឯព្រះ នោះត្រូវតែជឿថា មានព្រះមែន ហើយថា ទ្រង់ប្រទានរង្វាន់ ដល់អស់អ្នកដែលស្វែងរកទ្រង់។",
    textEnglish: "Now faith is the substance of things hoped for, the evidence of things not seen... But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.",
    themeKhmer: "អត្ថន័យនៃសេចក្តីជំនឿ និងការគាប់ព្រះហឫទ័យព្រះ",
    themeEnglish: "Faith is the Substance of Things Hoped For"
  },
  {
    id: "cpti-27-genesis50-20",
    part: 4,
    partTitleKhmer: "ផ្នែកទី ៤: ព្រះបន្ទូល & ជំនឿ",
    partTitleEnglish: "Part IV: The Word & Faith",
    book: "Genesis",
    chapter: 50,
    verseRange: "20",
    refKhmer: "លោកុប្បត្តិ ៥០:២០",
    refEnglish: "Genesis 50:20",
    textKhmer: "«អ្នករាល់គ្នាបានគិតធ្វើអាក្រក់ដល់ខ្ញុំ តែព្រះទ្រង់សម្រេចជាការល្អវិញ ដើម្បីនឹងសង្គ្រោះដល់ជីវិតនៃមនុស្សជាច្រើន ដូចជាបានកើតមានសព្វថ្ងៃនោះ»។",
    textEnglish: "But as for you, ye thought evil against me; but God meant it unto good, to bring to pass, as it is this day, to save much people alive.",
    themeKhmer: "ការគ្រប់គ្រងរបស់ព្រះបង្វែររឿងអាក្រក់ជាការល្អ (យ៉ូសែប)",
    themeEnglish: "God Meant it for Good"
  },

  // ─── PART V: ជីវិតសិស្ស & ជ័យជម្នះ (Discipleship, Holiness & Victory) ───
  {
    id: "cpti-28-philippians4-13",
    part: 5,
    partTitleKhmer: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ",
    partTitleEnglish: "Part V: Discipleship & Victory",
    book: "Philippians",
    chapter: 4,
    verseRange: "13",
    refKhmer: "ភីលីព ៤:១៣",
    refEnglish: "Philippians 4:13",
    textKhmer: "«ខ្ញុំអាចនឹងធ្វើគ្រប់ទាំងអស់បាន ដោយសារព្រះគ្រីស្ទដែលទ្រង់ចម្រើនកម្លាំងដល់ខ្ញុំ»។",
    textEnglish: "I can do all things through Christ which strengtheneth me.",
    themeKhmer: "កម្លាំង និងជ័យជម្នះក្នុងព្រះគ្រីស្ទ",
    themeEnglish: "Strength Through Christ"
  },
  {
    id: "cpti-29-philippians4-6-7",
    part: 5,
    partTitleKhmer: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ",
    partTitleEnglish: "Part V: Discipleship & Victory",
    book: "Philippians",
    chapter: 4,
    verseRange: "6-7",
    refKhmer: "ភីលីព ៤:៦-៧",
    refEnglish: "Philippians 4:6-7",
    textKhmer: "៦កុំឲ្យខ្វល់ខ្វាយអ្វីឡើយ ចូរទូលដល់ព្រះ ឲ្យជ្រាបពីសេចក្តីសំណូមរបស់អ្នករាល់គ្នាក្នុងគ្រប់ការទាំងអស់ដោយសេចក្តីអធិស្ឋាន និងពាក្យទូលអង្វរ ទាំងពោលពាក្យអរព្រះគុណផង ៧យ៉ាងនោះ សេចក្តីសុខសាន្តរបស់ព្រះ ដែលហួសលើសពីអស់ទាំងគំនិត នឹងជួយការពារចិត្ត ហើយនឹងគំនិតរបស់អ្នករាល់គ្នា ក្នុងព្រះគ្រីស្ទយេស៊ូវ។",
    textEnglish: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
    themeKhmer: "សេចក្តីសុខសាន្តរបស់ព្រះ និងការឈប់ខ្វល់ខ្វាយ",
    themeEnglish: "Peace of God Beyond Understanding"
  },
  {
    id: "cpti-30-galatians5-22-23",
    part: 5,
    partTitleKhmer: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ",
    partTitleEnglish: "Part V: Discipleship & Victory",
    book: "Galatians",
    chapter: 5,
    verseRange: "22-23",
    refKhmer: "កាឡាទី ៥:២២-២៣",
    refEnglish: "Galatians 5:22-23",
    textKhmer: "២២តែឯផលផ្លែនៃព្រះវិញ្ញាណវិញ នោះគឺសេចក្តីស្រឡាញ់ អំណរអរ មេត្រីភាព អត់ធ្មត់ សុភាព សប្បុរស ស្មោះត្រង់ ២៣ស្លូតបូត ហើយដឹងខ្នាត គ្មានក្រឹត្យវិន័យណាទាស់នឹងសេចក្តីយ៉ាងនោះឡើយ។",
    textEnglish: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.",
    themeKhmer: "ផលផ្លែទាំង ៩ នៃព្រះវិញ្ញាណបរិសុទ្ធ",
    themeEnglish: "The Fruit of the Spirit"
  },
  {
    id: "cpti-31-2corinthians5-17",
    part: 5,
    partTitleKhmer: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ",
    partTitleEnglish: "Part V: Discipleship & Victory",
    book: "2 Corinthians",
    chapter: 5,
    verseRange: "17",
    refKhmer: "២ កូរិនថូស ៥:១៧",
    refEnglish: "2 Corinthians 5:17",
    textKhmer: "«បានជាបើអ្នកណានៅក្នុងព្រះគ្រីស្ទ នោះឈ្មោះថាបានកើតជាថ្មីហើយ អស់ទាំងសេចក្តីចាស់បានកន្លងបាត់ទៅ មើល គ្រប់ទាំងអស់បានត្រឡប់ជាថ្មីវិញ»។",
    textEnglish: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
    themeKhmer: "ការកើតជាថ្មីក្នុងព្រះគ្រីស្ទ",
    themeEnglish: "A New Creation in Christ"
  },
  {
    id: "cpti-32-matthew11-28-30",
    part: 5,
    partTitleKhmer: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ",
    partTitleEnglish: "Part V: Discipleship & Victory",
    book: "Matthew",
    chapter: 11,
    verseRange: "28-30",
    refKhmer: "ម៉ាថាយ ១១:២៨-៣០",
    refEnglish: "Matthew 11:28-30",
    textKhmer: "២៨អស់អ្នកដែលនឿយព្រួយ ហើយផ្ទុកធ្ងន់អើយ ចូរមកឯខ្ញុំ ខ្ញុំនឹងឲ្យអ្នករាល់គ្នាឈប់សម្រាក ២៩ចូរទទួលនឹមខ្ញុំ ហើយរៀននឹងខ្ញុំចុះ ដ្បិតខ្ញុំស្លូត ហើយមានចិត្តសុភាព នោះអ្នករាល់គ្នានឹងបានសេចក្តីសម្រាកដល់ព្រលឹង ៣០ពីព្រោះនឹមខ្ញុំងាយទេ ហើយបន្ទុកខ្ញុំក៏ស្រាល។",
    textEnglish: "Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.",
    themeKhmer: "ការអញ្ជើញឲ្យមកទទួលសេចក្តីសម្រាកក្នុងព្រះគ្រីស្ទ",
    themeEnglish: "Come to Me and Rest"
  },
  {
    id: "cpti-33-2timothy4-7-8",
    part: 5,
    partTitleKhmer: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ",
    partTitleEnglish: "Part V: Discipleship & Victory",
    book: "2 Timothy",
    chapter: 4,
    verseRange: "7-8",
    refKhmer: "២ ធីម៉ូថេ ៤:៧-៨",
    refEnglish: "2 Timothy 4:7-8",
    textKhmer: "៧ខ្ញុំបានតយុទ្ធយ៉ាងល្អ ខ្ញុំបានរត់ប្រណាំងជាស្រេច ខ្ញុំបានរក្សាសេចក្តីជំនឿនៅឡើយ ៨ពីនោះទៅមុខ នឹងមានមកុដនៃសេចក្តីសុចរិត បម្រុងទុកឲ្យខ្ញុំ ដែលព្រះអម្ចាស់ដ៏ជាចៅក្រមសុចរិត ទ្រង់នឹងប្រទានមកខ្ញុំនៅថ្ងៃនោះ។",
    textEnglish: "I have fought a good fight, I have finished my course, I have kept the faith: Henceforth there is laid up for me a crown of righteousness, which the Lord, the righteous judge, shall give me at that day.",
    themeKhmer: "ការរត់ប្រណាំងដ៏ល្អ និងមកុដនៃសេចក្តីសុចរិត",
    themeEnglish: "Finished the Race, Kept the Faith"
  },
  {
    id: "cpti-34-matthew6-33",
    part: 5,
    partTitleKhmer: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ",
    partTitleEnglish: "Part V: Discipleship & Victory",
    book: "Matthew",
    chapter: 6,
    verseRange: "33-34",
    refKhmer: "ម៉ាថាយ ៦:៣៣-៣៤",
    refEnglish: "Matthew 6:33-34",
    textKhmer: "៣៣ចូរស្វែងរកនគរ និងសេចក្តីសុចរិតនៃព្រះជាមុនសិន ទើបគ្រប់របស់ទាំងអស់នោះ នឹងបានប្រទានមកអ្នករាល់គ្នាថែមទៀតផង ៣៤ដូច្នេះ កុំឲ្យខ្វល់ខ្វាយនឹងថ្ងៃស្អែកឡើយ ពីព្រោះថ្ងៃស្អែកនឹងខ្វល់ខ្វាយ ចំពោះការរបស់ថ្ងៃនោះឯង សេចក្តីលំបាកនៅថ្ងៃណា នោះគឺល្មមត្រឹមថ្ងៃនោះហើយ។",
    textEnglish: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you. Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.",
    themeKhmer: "ចូរស្វែងរកនគរ និងសេចក្តីសុចរិតនៃព្រះជាមុនសិន",
    themeEnglish: "Seek First the Kingdom of God"
  }
];

export function getMemoryPassages(partFilter?: number, searchQuery?: string) {
  let list = CPTI_MEMORY_PASSAGES;
  if (partFilter && partFilter > 0) {
    list = list.filter((p) => p.part === partFilter);
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.refKhmer.toLowerCase().includes(q) ||
        p.refEnglish.toLowerCase().includes(q) ||
        p.textKhmer.toLowerCase().includes(q) ||
        p.textEnglish.toLowerCase().includes(q) ||
        p.themeKhmer.toLowerCase().includes(q) ||
        p.themeEnglish.toLowerCase().includes(q)
    );
  }
  return {
    items: list,
    total: list.length,
    parts: [
      { part: 1, titleKm: "ផ្នែកទី ១: ទំនុកដំកើង & ប្រាជ្ញា", titleEn: "Part I: Psalms & Wisdom" },
      { part: 2, titleKm: "ផ្នែកទី ២: ព្រះយេស៊ូវគ្រីស្ទ & ការសង្គ្រោះ", titleEn: "Part II: Christ & Salvation" },
      { part: 3, titleKm: "ផ្នែកទី ៣: ព្រះវិញ្ញាណបរិសុទ្ធ & ការអធិស្ឋាន", titleEn: "Part III: Holy Spirit & Prayer" },
      { part: 4, titleKm: "ផ្នែកទី ៤: ព្រះបន្ទូល & ជំនឿ", titleEn: "Part IV: The Word & Faith" },
      { part: 5, titleKm: "ផ្នែកទី ៥: ជីវិតសិស្ស & ជ័យជម្នះ", titleEn: "Part V: Discipleship & Victory" }
    ]
  };
}
