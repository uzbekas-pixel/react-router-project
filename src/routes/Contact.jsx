import React, { useState } from "react";
import person1 from "./images/c.jpg";
import person2 from "./images/b.jpg";
import { useLang } from "../context/useLang";
import ScrollReveal from "../components/ScrollReveal";

const testimonials = [
  { img: person1, text: "Slate helps you see how many more days you need to work to reach your financial goal for the month and year.", name: "Regina Miles", role: "Designer", rating: 4 },
  { img: person2, text: "Slate helps you see how many more days you need to work to reach your financial goal for the month and year.", name: "Regina Miles", role: "Designer", rating: 4 },
];

const Stars = ({ rating }) => (
  <div className="flex gap-1 justify-center my-3">
    {[1,2,3,4,5].map((star) => (
      <span key={star} className={star <= rating ? "text-yellow-400" : "text-gray-500"}>★</span>
    ))}
  </div>
);

const Contact = ({ darkMode, showToast, showConfetti }) => {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Ism kiritilmadi";
    if (!form.email.trim()) newErrors.email = "Email kiritilmadi";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Emailga @gmail.com qo'shing";
    if (!form.message.trim()) newErrors.message = "Xabar kiritilmadi";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Iltimos, barcha maydonlarni to'ldiring!", "error");
    } else {
      setErrors({});
      setForm({ name: "", email: "", message: "" });
      showConfetti();
      showToast("Xabaringiz yuborildi! 🎉", "success");
    }
  };

  const inputClass = (field) => `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
    errors[field] ? "border-red-400" : darkMode ? "border-slate-600 focus:border-blue-400" : "border-gray-200 focus:border-blue-400"
  } ${darkMode ? "bg-slate-800 text-white placeholder-gray-500" : "bg-white text-gray-900 placeholder-gray-400"}`;

  return (
    <div className="page-transition w-full max-w-4xl mx-auto px-10 py-16 pb-24 translate-y-20">

    
      <ScrollReveal direction="up">
        <p className="text-green-500 text-sm font-medium mb-2">{t.testimonials}</p>
        <h2 className={`text-3xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.contactTitle}</h2>
        <p className={`text-sm mb-12 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>{t.contactSub}</p>
      </ScrollReveal>

      <div className="flex gap-10 justify-center mb-16">
        {testimonials.map((item, index) => (
          <ScrollReveal key={index} direction="up" delay={index * 200}>
            <div className="flex flex-col items-center max-w-[280px] text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-cyan-700 mb-5 shadow-md">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.text}</p>
              <Stars rating={item.rating} />
              <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{item.name}</p>
              <p className="text-gray-400 text-xs">{item.role}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

     
      <ScrollReveal direction="up" delay={200}>
        <div className={`rounded-2xl p-8 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`}>
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
            📩 Xabar yuborish
          </h3>

          <div className="flex flex-col gap-4">
          
            <div>
              <input
                type="text"
                placeholder="Ismingiz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass("name")}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

          
            <div>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass("email")}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

           
            <div>
              <textarea
                rows={4}
                placeholder="Xabaringiz..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={inputClass("message") + " resize-none"}
              />
              {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
            </div>

            
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Yuborish →
            </button>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};

export default Contact;