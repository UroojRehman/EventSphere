import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleHelp, Sparkles } from "lucide-react";
import "./Faqs.css";
import faqService from "../../services/faqService";

const fallbackFaqs = [
  {
    question: "Can I browse events without an account?",
    answer: "Yes. Event listings, event details, announcements, and the public gallery are available without signing in.",
  },
  {
    question: "How do I register for an event?",
    answer: "Open an event and select Register for event. You will be asked to log in or create an account before registration.",
  },
  {
    question: "Where can I find event rules and requirements?",
    answer: "Event-specific rules and requirements are shown on the event details page when the organizer has provided them.",
  },
  {
    question: "Can I view photos and videos from past events?",
    answer: "Yes. Visit the Gallery page to browse approved images and videos by event, department, and year.",
  },
  {
    question: "How do I get help with my account?",
    answer: "Use the Contact page to reach the EventSphere support team with your question or account details.",
  },
];

const Faqs = () => {
  const [faqs, setFaqs] = useState(fallbackFaqs);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    faqService.getPublished()
      .then((response) => {
        if (response.faqs?.length) setFaqs(response.faqs);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="faqs-page">
      <div className="faqs-container">
        <section className="faqs-header">
          <div className="faqs-icon"><CircleHelp size={25} /></div>
          <div>
            <div className="faqs-kicker"><Sparkles size={13} /> HELP CENTER</div>
            <h1>Questions, <span>answered.</span></h1>
            <p>Find quick answers about events, registration, accounts, and campus media.</p>
          </div>
        </section>

        <motion.section
          className="faqs-list"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.article
                className={`faq-item ${isOpen ? "open" : ""}`}
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button type="button" onClick={() => setOpenIndex(isOpen ? -1 : index)} aria-expanded={isOpen}>
                  <span className="faq-number">0{index + 1}</span>
                  <span>{faq.question}</span>
                  <ChevronDown size={18} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.p
                      initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                      animate={{ height: "auto", opacity: 1, marginBottom: 22 }}
                      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.section>
      </div>
    </div>
  );
};

export default Faqs;
