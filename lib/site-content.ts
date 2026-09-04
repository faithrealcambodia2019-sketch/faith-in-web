/**
 * Faith In Central Content & Configuration
 * Production design system tokens, navigation, and marketing copy
 */

export const site = Object.freeze({
  name: "Faith In",
  legalName: "Faith In Inc.",
  domain: "faithin.co",
  origin: "https://faithin.co",
  appPath: "/app",
  tagline: "Discover hope, purpose, and faith for your journey",
  description:
    "A modern Christian platform connecting believers and seekers worldwide. Experience bilingual Khmer–English Bible study, encouraging audio blessings, prayer fellowship, and ministry resources.",
  shortDescription:
    "Bilingual Khmer and English Christian community: Scripture study, prayer wall, audio blessings, and ministry network.",
  locales: ["en", "km"],
  contactEmail: "hello@faithin.co",
  supportEmail: "support@faithin.co",
  social: {
    telegram: "https://t.me/faithinco",
    facebook: "https://facebook.com/faithinco",
    youtube: "https://youtube.com/@faithinco",
  },
});

export type NavLink = {
  href: string;
  label: string;
  badge?: string;
};

export const primaryNav: NavLink[] = [
  { href: "/features", label: "Features" },
  { href: "/bible-study", label: "Bible Study" },
  { href: "/for-churches", label: "For Churches" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Platform",
    links: [
      { href: "/features", label: "All Features" },
      { href: "/bible-study", label: "Bilingual Bible Studio" },
      { href: "/for-churches", label: "Church Ministry Toolkit" },
      { href: "/app", label: "Community Web App" },
    ],
  },
  {
    title: "Journey & Community",
    links: [
      { href: "/app", label: "Prayer Wall" },
      { href: "/app", label: "Audio Blessings" },
      { href: "/features#jobs", label: "Christian Jobs & Ministry" },
      { href: "/about#vision", label: "Our Faith & Vision" },
    ],
  },
  {
    title: "Company & Support",
    links: [
      { href: "/about", label: "About Faith In" },
      { href: "/contact", label: "Talk to Our Team" },
      { href: "/contact#church-onboarding", label: "Church Partnerships" },
      { href: "mailto:support@faithin.co", label: "Help & Support" },
    ],
  },
  {
    title: "Privacy & Standards",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/about#ethics", label: "Safety & Community Guardrails" },
    ],
  },
];

export type JourneyStep = {
  number: string;
  step: "Discover" | "Explore" | "Connect" | "Grow";
  khmerTitle: string;
  title: string;
  description: string;
  icon: string;
  highlight: string;
  actionText: string;
  actionHref: string;
};

export const journeyPathway: JourneyStep[] = [
  {
    number: "01",
    step: "Discover",
    khmerTitle: "ស្វែងយល់ព្រះបន្ទូល",
    title: "Discover Hope & Truth",
    description:
      "Begin with Scripture in your native language. Explore side-by-side Khmer and English verses with crystal-clear formatting and thoughtful devotional commentary.",
    icon: "compass",
    highlight: "Bilingual Scripture Study",
    actionText: "Read Today's Verse",
    actionHref: "/bible-study",
  },
  {
    number: "02",
    step: "Explore",
    khmerTitle: "ស្វែងរកការលើកទឹកចិត្ត",
    title: "Explore Audio Blessings",
    description:
      "Listen to calming, uplifting audio blessings, morning prayers, and worship melodies recorded to bring peace into your busy daily routine.",
    icon: "headphones",
    highlight: "10+ Spoken Audio Devotionals",
    actionText: "Listen to Blessings",
    actionHref: "/app",
  },
  {
    number: "03",
    step: "Connect",
    khmerTitle: "ភ្ជាប់ទំនាក់ទំនង",
    title: "Connect in Safe Fellowship",
    description:
      "Post prayer requests anonymously or with your profile. Receive authentic encouragement from believers across Cambodia, North America, Europe, and Asia.",
    icon: "users",
    highlight: "Encouraging Prayer Wall",
    actionText: "Join the Fellowship",
    actionHref: "/app",
  },
  {
    number: "04",
    step: "Grow",
    khmerTitle: "រីកចម្រើនក្នុងជំនឿ",
    title: "Grow & Share Faith",
    description:
      "Create beautiful shareable Scripture art cards for Telegram and Facebook, discover Christian employment opportunities, and serve your local church.",
    icon: "audio-lines",
    highlight: "Scripture Design Studio & Jobs",
    actionText: "Explore Growth Tools",
    actionHref: "/features",
  },
];

export type Feature = {
  slug: string;
  title: string;
  khmerTitle?: string;
  summary: string;
  detail: string;
  icon: string;
  category: "Scripture" | "Fellowship" | "Growth" | "Ministry";
  badge?: "Live" | "Popular" | "Essential" | "New";
};

export const features: Feature[] = [
  {
    slug: "bible-study",
    title: "Bilingual Bible Studio",
    khmerTitle: "ព្រះគម្ពីរ ខ្មែរ–អង់គ្លេស",
    summary: "Side-by-side Khmer Standard Version and English Bible with tailored Khmer font rendering.",
    detail:
      "Read Scripture with optimized line heights, syllable break handling, instant cross-references, and verse-by-verse translation alignment tailored for bilingual speakers and learners.",
    icon: "sparkles",
    category: "Scripture",
    badge: "Essential",
  },
  {
    slug: "community-feed",
    title: "Uplifting Community Feed",
    khmerTitle: "សហគមន៍ចែករំលែក",
    summary: "A clean, peaceful feed for testimonies, life updates, reflections, and spiritual blessings.",
    detail:
      "Free from political outrage, algorithmic noise, and intrusive ads. Designed for heartfelt encouragement, respectful discussions, and shared praise.",
    icon: "heart-handshake",
    category: "Fellowship",
    badge: "Popular",
  },
  {
    slug: "prayer-wall",
    title: "Global Prayer Wall",
    khmerTitle: "បន្ទប់អធិស្ឋាន",
    summary: "Share your burdens and celebrate answered prayers with compassionate Christians worldwide.",
    detail:
      "Post prayer requests publicly or anonymously. Click 'I prayed for you' to let believers know they are not walking alone in their struggles.",
    icon: "globe",
    category: "Fellowship",
    badge: "Live",
  },
  {
    slug: "audio-blessings",
    title: "Spoken Audio Blessings",
    khmerTitle: "ព្រះពរជាសម្លេង",
    summary: "Listen to high-definition spoken blessings, morning devotions, and peaceful reflections.",
    detail:
      "Immerse your spirit in spoken Scripture and gentle worship audio tracks, recorded in gentle Khmer and English voices to start and end your day in tranquility.",
    icon: "audio-lines",
    category: "Growth",
    badge: "Popular",
  },
  {
    slug: "scripture-studio",
    title: "Scripture Card Designer",
    khmerTitle: "រចនារូបភាពព្រះបន្ទូល",
    summary: "Transform favorite Bible verses into breathtaking visual cards for Telegram, Instagram, and Facebook.",
    detail:
      "Choose elegant typography, background wallpapers, and custom layouts designed specifically to respect Khmer vowel/consonant rendering rules.",
    icon: "layers",
    category: "Growth",
    badge: "New",
  },
  {
    slug: "ministry-jobs",
    title: "Christian Jobs & Ministry Board",
    khmerTitle: "ឱកាសការងារគ្រីស្ទបរិស័ទ",
    summary: "Find purposeful career opportunities with faith-based organizations, churches, and NGOs.",
    detail:
      "Connect mission-minded professionals with Christian employers, educational institutions, translation teams, and non-profit ministries.",
    icon: "compass",
    category: "Ministry",
    badge: "Live",
  },
];

export type FaithPersona = {
  id: string;
  stage: string;
  khmerStage: string;
  headline: string;
  description: string;
  recommendedFeatures: string[];
  callToAction: string;
  href: string;
};

export const faithPersonas: FaithPersona[] = [
  {
    id: "seeker",
    stage: "Curious Seeker",
    khmerStage: "អ្នកស្វែងរកសេចក្តីពិត",
    headline: "Exploring meaning, hope, and who Jesus is",
    description:
      "Explore Christianity in a safe, non-judgmental environment. Read the Gospels in modern Khmer, ask questions anonymously, and discover the Gospel at your own pace.",
    recommendedFeatures: ["Bilingual Gospels", "Anonymous Prayer Wall", "Introductory Devotionals"],
    callToAction: "Start Exploring Scripture",
    href: "/bible-study",
  },
  {
    id: "new-believer",
    stage: "New Believer",
    khmerStage: "អ្នកជឿថ្មី",
    headline: "Building daily spiritual habits and foundations",
    description:
      "Lay strong roots in your faith with daily morning blessings, guided reading plans, and a warm community ready to welcome and encourage your first steps.",
    recommendedFeatures: ["Verse of the Day", "Daily Audio Blessings", "Encouragement Circles"],
    callToAction: "Begin Daily Devotion",
    href: "/app",
  },
  {
    id: "growing-christian",
    stage: "Growing Believer",
    khmerStage: "គ្រីស្ទបរិស័ទកំពុងរីកចម្រើន",
    headline: "Deepening your walk and ministering to others",
    description:
      "Sharpen your biblical understanding with bilingual comparisons, pray for brothers and sisters around the globe, and share uplifting testimonies.",
    recommendedFeatures: ["Scripture Design Studio", "Prayer Intercession", "Community Sharing"],
    callToAction: "Join the Community",
    href: "/app",
  },
  {
    id: "church-leader",
    stage: "Church Leader & Pastor",
    khmerStage: "អ្នកដឹកនាំក្រុមជំនុំ",
    headline: "Equipping your congregation and reaching youth",
    description:
      "Empower your church with modern digital discipleship tools, publish ministry events, post ministry job openings, and mobilize prayer across borders.",
    recommendedFeatures: ["Church Community Hub", "Ministry Jobs Board", "Sermon Media Toolkit"],
    callToAction: "Partner with Faith In",
    href: "/for-churches",
  },
];

export type JourneyStory = {
  audience: string;
  khmerAudience: string;
  title: string;
  description: string;
  outcome: string;
};

export const journeyStories: JourneyStory[] = [
  {
    audience: "For bilingual families",
    khmerAudience: "សម្រាប់គ្រួសារពីរភាសា",
    title: "Study together across generations",
    description:
      "Place Khmer and English Scripture side by side so parents, young people, and diaspora families can read and discuss the same passage together.",
    outcome: "Shared understanding",
  },
  {
    audience: "For busy daily rhythms",
    khmerAudience: "សម្រាប់ជីវិតប្រចាំថ្ងៃ",
    title: "Carry encouragement into your day",
    description:
      "Use short spoken blessings and Scripture reflections during a commute, a quiet morning, or the moments when you need to reset your attention.",
    outcome: "A calmer daily practice",
  },
  {
    audience: "For prayer and care",
    khmerAudience: "សម្រាប់ការអធិស្ឋាន",
    title: "Ask for prayer without pressure",
    description:
      "Share a need publicly or anonymously, encourage someone else, and make space for compassionate fellowship without noisy social mechanics.",
    outcome: "Connection with dignity",
  },
];

export const platformStats = [
  { value: "100%", label: "Free Forever", note: "No subscription fees" },
  { value: "2", label: "Core Languages", note: "Khmer & English optimized" },
  { value: "Web", label: "Every Screen", note: "Mobile-first and responsive" },
  { value: "0", label: "Commercial Ads", note: "100% privacy-first sanctuary" },
];

export type FaqItem = {
  question: string;
  khmerQuestion?: string;
  answer: string;
  category: "General" | "Privacy" | "Churches" | "Technology";
};

export const faqs: FaqItem[] = [
  {
    category: "General",
    question: "Is Faith In free to use?",
    khmerQuestion: "តើ Faith In ឥតគិតថ្លៃសម្រាប់ប្រើប្រាស់ឬ?",
    answer:
      "Yes, 100% free. Faith In is built to serve God's Kingdom and bless believers and seekers worldwide. There are no paywalls, hidden fees, or premium subscriptions.",
  },
  {
    category: "General",
    question: "Which Bible translations are supported?",
    khmerQuestion: "តើមានការបកប្រែព្រះគម្ពីរណាខ្លះ?",
    answer:
      "Faith In presents Khmer and English Scripture side by side with typography tuned for both writing systems. Translation availability depends on the licensed and approved sources configured in the Bible Studio.",
  },
  {
    category: "Privacy",
    question: "How does Faith In protect user privacy?",
    khmerQuestion: "តើ Faith In ការពារព័ត៌មានឯកជនរបស់អ្នកយ៉ាងដូចម្តេច?",
    answer:
      "We never sell user data, run third-party tracking scripts, or serve commercial advertisements. You can post prayer requests and blessings anonymously whenever you desire.",
  },
  {
    category: "Technology",
    question: "Can I use Faith In on my mobile phone?",
    khmerQuestion: "តើខ្ញុំអាចប្រើលើទូរស័ព្ទដៃបានទេ?",
    answer:
      "Faith In is engineered as a progressive, mobile-first web application that runs smoothly on iPhone, Android, tablets, and desktop browsers without consuming large amounts of device storage.",
  },
  {
    category: "Churches",
    question: "How can my local church or ministry partner with Faith In?",
    khmerQuestion: "តើក្រុមជំនុំរបស់ខ្ញុំអាចសហការជាមួយ Faith In យ៉ាងដូចម្តេច?",
    answer:
      "Churches can create dedicated fellowship spaces, post volunteer and job openings, share sermon audio/devotionals, and organize community prayer chains. Visit our For Churches page or reach out to hello@faithin.co.",
  },
];
