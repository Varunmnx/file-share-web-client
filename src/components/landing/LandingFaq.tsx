import { FAQ_DATA } from "./landingData";
import FaqItem from "./FaqItem";
import ScrollReveal from "./ScrollReveal";

export default function LandingFaq() {
  return (
    <div className="lp-faq">
      <ScrollReveal className="lp-head" delay="0s">
        <h2 className="lp-head-h2">Questions, answered</h2>
      </ScrollReveal>

      {FAQ_DATA.map((item) => (
        <FaqItem
          key={item.question}
          question={item.question}
          answer={item.answer}
        />
      ))}
    </div>
  );
}

