import { useId, useState } from "react";

interface FaqItemProps {
  question: string;
  answer: string;
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="lp-faq-item">
      <button
        type="button"
        className="lp-faq-summary"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {question}
        <span
          className="lp-faq-icon"
          style={{ transform: isOpen ? "rotate(45deg)" : undefined }}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {isOpen && (
        <p id={contentId} className="lp-faq-body" role="region">
          {answer}
        </p>
      )}
    </div>
  );
}

