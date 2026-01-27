// src/components/ContactEmail.tsx

"use client";

import { Mail, Send } from "lucide-react";
import { useState } from "react";

export default function ContactEmail() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendEmail = () => {
    const mailtoLink = `mailto:makhdaan7@gmail.com?subject=${encodeURIComponent(subject || "Gold Tracker Inquiry")}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="card-gold p-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-gradient-gold" />
        <h3 className="text-sm font-bold text-primary">Contact Us</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-secondary font-semibold mb-1 block">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Your subject..."
            className="w-full px-3 py-2 bg-secondary border border-secondary rounded-lg text-primary text-xs focus:outline-none focus:border-gold-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-secondary font-semibold mb-1 block">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            className="w-full px-3 py-2 bg-secondary border border-secondary rounded-lg text-primary text-xs focus:outline-none focus:border-gold-400 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSendEmail}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 hover:shadow-lg transition-all font-bold text-sm shadow-md"
        >
          <Send className="w-4 h-4" />
          Send Email
        </button>

        <p className="text-xs text-muted text-center">
          Contact: makhdaan7@gmail.com
        </p>
      </div>
    </div>
  );
}
