import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle,
  FileText,
  LifeBuoy,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Task Management Query",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "Task Management Query",
        message: "",
      });
    }, 4000);
  };

  const FAQS = [
    {
      q: "How does task state persistence work?",
      a: "All tasks are authenticated via JWT and stored in our MongoDB cluster. Changes sync optimistically with your local storage session.",
    },
    {
      q: "Can I collaborate across multiple project workspaces?",
      a: "Yes! Navigate to the Projects tab to view cross-functional sprint goals and team project timelines.",
    },
    {
      q: "What is route lazy loading and how does it benefit this app?",
      a: "Route lazy loading splits application pages into separate JavaScript chunks using React.lazy() and Suspense. The browser only fetches the code for the current route, dramatically reducing initial load times and network transfer size.",
    },
    {
      q: "How do I reset my account password?",
      a: "Use the 'Forgot Password' link on the login page to receive a secure time-limited cryptographic reset token via email.",
    },
  ];

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h2 className="contact-title">
          <LifeBuoy className="title-icon" size={26} />
          Support & Contact Center
        </h2>
        <p className="contact-subtitle">
          Have questions or need assistance? Reach out to the developer team or explore FAQs.
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Form Column */}
        <div className="contact-card">
          <h3 className="section-title">
            <MessageSquare size={18} /> Send a Message
          </h3>

          {submitted ? (
            <div className="success-banner">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <strong>Thank you, {formData.name || "friend"}!</strong>
                <p>Your support ticket has been submitted. Our team will review it shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-field">
                <label>Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Topic / Department</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="Task Management Query">Task Management Query</option>
                  <option value="Bug Report">Bug Report & Performance Issue</option>
                  <option value="Feature Request">Feature Request / Suggestion</option>
                  <option value="Account Support">Authentication & Account Help</option>
                </select>
              </div>

              <div className="form-field">
                <label>Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-send">
                <Send size={15} /> Submit Inquiry
              </button>
            </form>
          )}
        </div>

        {/* Contact Info & Helpdesk Column */}
        <div className="contact-info-col">
          <div className="contact-info-card">
            <h3 className="section-title">
              <FileText size={18} /> Direct Channels
            </h3>
            <ul className="info-list">
              <li>
                <div className="info-icon"><Mail size={16} /></div>
                <div>
                  <div className="info-label">Email Support</div>
                  <div className="info-value">support@taskmanager.internal</div>
                </div>
              </li>
              <li>
                <div className="info-icon"><Phone size={16} /></div>
                <div>
                  <div className="info-label">Help Desk Hotline</div>
                  <div className="info-value">+1 (555) 019-2834 (Mon-Fri 9am-6pm)</div>
                </div>
              </li>
              <li>
                <div className="info-icon"><Clock size={16} /></div>
                <div>
                  <div className="info-label">Response SLA</div>
                  <div className="info-value">Under 2 hours for critical incidents</div>
                </div>
              </li>
              <li>
                <div className="info-icon"><MapPin size={16} /></div>
                <div>
                  <div className="info-label">HQ Location</div>
                  <div className="info-value">Engineering Lab 4, Tech Campus</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="faq-card">
            <h3 className="section-title">
              <HelpCircle size={18} /> Frequently Asked Questions
            </h3>
            <div className="faq-list">
              {FAQS.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item ${activeFaq === index ? "open" : ""}`}
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <span className="faq-toggle">{activeFaq === index ? "−" : "+"}</span>
                  </div>
                  {activeFaq === index && (
                    <div className="faq-answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
