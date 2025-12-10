import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, ChevronRight, RefreshCcw } from 'lucide-react';

/**
 * Knowledge Base Configuration
 * This array defines the bot's conversation flow.
 * Each object contains:
 * - keywords: Words to trigger this response.
 * - answer: The bot's text reply.
 * - options: (Optional) Clickable follow-up buttons for the user.
 */
const knowledgeBase = [
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'menu', 'help'],
    answer: "👋 Hi! I'm SpotBot. I can guide you through the SpotCheck process. What would you like to know?",
    options: ["Eligibility Rules", "Required Documents", "Track Application", "Contact Support"]
  },
  {
    keywords: ['eligibility', 'eligible', 'rules', 'criteria', 'requirement'],
    answer: "To qualify for a SpotCheck loan, your business usually needs:",
    options: ["Turnover Limits", "Trading Years", "Restricted Sectors", "Back to Menu"]
  },
  {
    keywords: ['turnover', 'revenue', 'sales', 'limit'],
    answer: "💰 Minimum Turnover Requirement: ₹42,00,000 (42 Lakhs) per annum. Loans cannot exceed your annual turnover.",
    options: ["Check Trading Years", "Back to Menu"]
  },
  {
    keywords: ['years', 'age', 'old', 'trading'],
    answer: "📅 Vintage Requirement: Your business must be active and registered for at least 2 years.",
    options: ["Check Turnover", "Back to Menu"]
  },
  {
    keywords: ['sector', 'industry', 'restricted', 'gambling'],
    answer: "🚫 We do NOT fund: Gambling, Adult Entertainment, or Speculative Trading. \n✅ We support: Retail, Tech, Manufacturing, and Services.",
    options: ["Back to Menu"]
  },
  {
    keywords: ['document', 'doc', 'file', 'upload', 'kyc', 'proof'],
    answer: "We categorize documents into 3 sections. Which one are you asking about?",
    options: ["KYC Documents", "Income Proofs", "Business Proofs", "File Formats"]
  },
  {
    keywords: ['kyc documents', 'identity', 'pan', 'aadhar'],
    answer: "🆔 **KYC Requirements:**\n1. Business PAN\n2. Owner's PAN\n3. Owner's Aadhar\n4. Office Address Proof",
    options: ["Check Income Proofs", "Back to Documents"]
  },
  {
    keywords: ['income proof', 'tax', 'profit', 'balance', 'sheet'],
    answer: "📈 **Income Requirements:**\n1. P&L Statement (3 Yrs)\n2. Balance Sheet (3 Yrs)\n3. ITR Acknowledgement (3 Yrs)\n4. Bank Statement (6-12 Months)",
    options: ["Check Business Proofs", "Back to Documents"]
  },
  {
    keywords: ['business proof', 'cin', 'registration', 'director'],
    answer: "🏢 **Business Requirements:**\n1. Registration Certificate (Required)\n2. CIN (Optional)\n3. List of Directors (Optional)",
    options: ["Back to Documents"]
  },
  {
    keywords: ['format', 'size', 'pdf', 'jpg'],
    answer: "💾 **File Rules:**\n- Formats: PDF, JPEG, PNG\n- Max Size: 5MB per file\n- Must be clear and readable.",
    options: ["Back to Menu"]
  },
  {
    keywords: ['track', 'status', 'progress', 'application'],
    answer: "You can track your status on the Dashboard.\n\n🟠 **Under Review:** Our team is checking details.\n🟢 **Approved:** Funds are being processed.\n🔴 **Rejected:** Criteria not met.",
    options: ["How to Revoke?", "Back to Menu"]
  },
  {
    keywords: ['revoke', 'cancel', 'withdraw'],
    answer: "⚠️ You can revoke an 'Under Review' application using the red 'Revoke' button in your dashboard table.",
    options: ["Back to Menu"]
  },
  {
    keywords: ['contact', 'human', 'email', 'phone', 'support'],
    answer: "👨‍💼 **Support Team:**\nEmail: help@spotcheck.bank\nPhone: 1800-SPOT-CHK\nHours: Mon-Fri, 9AM - 6PM",
    options: ["Back to Menu"]
  }
];

/**
 * SpotBot Component
 * A floating chatbot widget that provides automated support to users.
 * Uses a keyword-matching engine to simulate intelligent responses.
 */
export default function SpotBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "👋 Hi! I'm SpotBot. I can guide you through the process. Select a topic below:", 
      sender: 'bot',
      options: ["Eligibility Rules", "Required Documents", "Track Application", "Contact Support"]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  /**
   * Automatically scrolls the chat window to the latest message.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping, isOpen]);

  /**
   * Processes user input (text or button click) and finds a matching response.
   * Simulates a network delay for a more natural feel.
   */
  const processResponse = (userText) => {
    setIsTyping(true);
    setTimeout(() => {
      const lowerInput = userText.toLowerCase();
      let response = {
        text: "I didn't quite get that. Could you try selecting an option from the menu?",
        options: ["Back to Menu", "Contact Support"]
      };
      
      // Basic keyword matching logic
      const match = knowledgeBase.find(item => 
        item.keywords.some(keyword => lowerInput.includes(keyword))
      );

      if (match) {
        response = {
          text: match.answer,
          options: match.options
        };
      }

      setMessages(prev => [...prev, { text: response.text, sender: 'bot', options: response.options }]);
      setIsTyping(false);
    }, 600);
  };

  /**
   * Handlers for manual text input submission.
   */
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setInput("");
    processResponse(userText);
  };

  /**
   * Handlers for clicking on predefined option chips.
   */
  const handleOptionClick = (optionText) => {
    setMessages(prev => [...prev, { text: optionText, sender: 'user' }]);
    processResponse(optionText);
  };

  /**
   * Resets conversation history to the initial state.
   */
  const resetChat = () => {
    setMessages([{ 
      text: "👋 Hi! I'm SpotBot. I can guide you through the process. Select a topic below:", 
      sender: 'bot',
      options: ["Eligibility Rules", "Required Documents", "Track Application", "Contact Support"]
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* Chat Window Container */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[32rem] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 animate-in slide-in-from-bottom-5 overflow-hidden transition-all">
          
          {/* Header Bar */}
          <div className="bg-slate-800 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-full border border-indigo-400/30">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold block text-sm">SpotBot AI</span>
                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                </span>
              </div>
            </div>
            
            {/* Header Actions (Reset & Close) */}
            <div className="flex items-center gap-1">
              <button onClick={resetChat} title="Reset Chat" className="hover:bg-white/10 p-1.5 rounded-full transition-colors text-slate-300 hover:text-white">
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} title="Close" className="hover:bg-white/10 p-1.5 rounded-full transition-colors text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Chat History Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Chat Bubble Style Logic */}
                <div className={`max-w-[85%] p-3.5 text-sm shadow-sm leading-relaxed whitespace-pre-line ${
                  m.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'
                }`}>
                  {m.text}
                </div>

                {/* Interactive Option Chips (Only for Bot messages) */}
                {m.sender === 'bot' && m.options && (
                  <div className="mt-2 flex flex-wrap gap-2 max-w-[90%]">
                    {m.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        className="text-xs font-medium bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm flex items-center gap-1"
                      >
                        {opt} <ChevronRight className="w-3 h-3 opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator Animation */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* User Input Field */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400" 
              placeholder="Type or select an option..." 
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-full shadow-sm transition-all transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) to open chat */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-slate-800 hover:bg-slate-900 text-white pl-5 pr-2 py-3 rounded-full shadow-xl shadow-slate-300 transition-all hover:-translate-y-1"
        >
          <span className="font-bold text-sm">Need Help?</span>
          <div className="bg-indigo-500 p-2 rounded-full group-hover:rotate-12 transition-transform">
            <MessageSquare className="w-5 h-5 fill-current text-white" />
          </div>
        </button>
      )}
    </div>
  );
}