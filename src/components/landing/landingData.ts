import { FeatureCardData, FeatureSpotlightData, FaqData, StatData, StepData } from "./types";

export const STATS_DATA: StatData[] = [
  { count: 2, suffix: " GB", label: "per file, no squeezing" },
  { count: 256, suffix: "-bit", label: "AES encryption" },
  { count: 3, suffix: " sec", label: "to your first share link" },
];

export const MARQUEE_TAGS = [
  "Photos",
  "Videos",
  "PDF documents",
  "ZIP archives",
  "Design files",
  "Music",
  "Spreadsheets",
  "Source code",
] as const;

export const FEATURE_CARDS_DATA: FeatureCardData[] = [
  {
    title: "Send files, share with anyone!",
    sub: "No account needed to receive. Just open the link.",
    flip: false,
    imgSrc: "/card1.jpg",
    imgAlt: "Card 1 illustration",
  },
  {
    title: "Share files. Fast, easy access.",
    sub: "Large files upload in the background while you keep working.",
    flip: true,
    imgSrc: "/card2.jpg",
    imgAlt: "Card 2 illustration",
  },
  {
    title: "Share files, quick and secure.",
    sub: "End-to-end encryption on every transfer, by default.",
    flip: false,
    imgSrc: "/card3.jpg",
    imgAlt: "Card 3 illustration",
  },
];

export const FEATURE_SPOTLIGHTS_DATA: FeatureSpotlightData[] = [
  {
    title: "Sealed before it's sent",
    description:
      "Files are encrypted on your device, so only the people you choose can open them. Not even we can read them.",
    bullets: ["End-to-end encryption", "Links that expire when you say so"],
    imgSrc: "/envelope.png",
    imgAlt: "Sealed envelope with a teal privacy stamp",
    reverse: false,
  },
  {
    title: "Private by design",
    description:
      "No tracking, no ads, no digging through your files. Share what you want and nothing else.",
    bullets: ["Password-protect any link", "See who opened what, and when"],
    imgSrc: "/envelope.png",
    imgAlt: "Sealed envelope with a teal privacy stamp",
    reverse: true,
  },
];

export const WORKFLOW_STEPS_DATA: StepData[] = [
  {
    stepNumber: "1",
    title: "Add your files",
    description: "Drag them in or pick from your phone. Big files are welcome.",
  },
  {
    stepNumber: "2",
    title: "Choose who gets them",
    description: "Set a password or an expiry date, or leave the link open.",
  },
  {
    stepNumber: "3",
    title: "Send the link",
    description: "They open it and download. That's all they need to do.",
  },
];

export const FAQ_DATA: FaqData[] = [
  {
    question: "Does the person I send to need an account?",
    answer: "No. Anyone with the link can download, unless you add a password.",
  },
  {
    question: "Who can see my files?",
    answer: "Only you and the people you share with. Files are encrypted before they leave your device.",
  },
  {
    question: "How long do links last?",
    answer: "You choose. Set an expiry from one hour to thirty days, or delete the link at any time.",
  },
  {
    question: "Is T Share free?",
    answer: "You can start sharing for free from the Android app.",
  },
];

