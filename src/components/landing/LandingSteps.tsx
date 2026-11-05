import { WORKFLOW_STEPS_DATA } from "./landingData";
import ScrollReveal from "./ScrollReveal";
import { useInView } from "./useInView";

export default function LandingSteps() {
  const { ref: stepsRef, isInView: stepsVisible } = useInView<HTMLDivElement>({
    threshold: 0.18,
    triggerOnce: true,
  });

  return (
    <div className="lp-wrap">
      <ScrollReveal className="lp-head" delay="0s">
        <h2 className="lp-head-h2">Share in three steps</h2>
        <p className="lp-head-p">No setup. No learning curve.</p>
      </ScrollReveal>

      <div
        className={`lp-steps${stepsVisible ? " lp-steps--in" : ""}`}
        ref={stepsRef}
        id="steps"
      >
        {WORKFLOW_STEPS_DATA.map((step) => (
          <div key={step.stepNumber} className="lp-step">
            <em className="lp-step-num">{step.stepNumber}</em>
            <h3 className="lp-step-h3">{step.title}</h3>
            <p className="lp-step-p">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

