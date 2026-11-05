export interface StatData {
  count: number;
  suffix: string;
  label: string;
}

export interface FeatureCardData {
  title: string;
  sub: string;
  flip?: boolean;
  imgSrc: string;
  imgAlt?: string;
}

export interface FeatureSpotlightData {
  title: string;
  description: string;
  bullets: string[];
  imgSrc: string;
  imgAlt: string;
  reverse?: boolean;
}

export interface StepData {
  stepNumber: string;
  title: string;
  description: string;
}

export interface FaqData {
  question: string;
  answer: string;
}

