"use client";

import SectionHeader from "@/components/ui/sectionHeader";
import { LuMail, LuPhone, LuMapPin, LuSend } from "react-icons/lu";
import React, { useState } from 'react';
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type ContactSectionProps = {
  initialContact?: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    email: string;
    phone: string;
    location: string;
  };
};

export default function ContactSection({ initialContact }: ContactSectionProps) {
  const { dictionary, isId } = useLanguage();
  const [loading, setLoading] = useState(false);

  // If user has customized their title/badge via admin, use it, otherwise use localized defaults
  const badge = initialContact?.badge && initialContact.badge !== "Contact"
    ? initialContact.badge
    : dictionary.contact_badge;

  const title = initialContact?.title && initialContact.title !== "Let's build something great"
    ? initialContact.title
    : (isId ? dictionary.contact_title : "Let's build something great");

  const highlight = initialContact?.highlight && initialContact.highlight !== "something great"
    ? initialContact.highlight
    : (isId ? dictionary.contact_title_highlight : "something great");

  const description = initialContact?.description && !initialContact.description.includes("Have a project in mind?")
    ? initialContact.description
    : (isId ? dictionary.contact_description : "Have a project in mind? I'd love to hear about it. Let's connect.");

  const email = initialContact?.email || "akbarhanani02@gmail.com";
  const phone = initialContact?.phone || "+62 817 5204 440";
  const location = initialContact?.location || "Pasuruan, Jawa Timur, Indonesia";

  const contactInfo = [
    {
      icon: LuMail,
      label: dictionary.contact_info_email,
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: LuPhone,
      label: dictionary.contact_info_phone,
      value: phone,
      href: `tel:${phone.replace(/\s+/g, '')}`,
    },
    {
      icon: LuMapPin,
      label: dictionary.contact_info_location,
      value: location,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
    },
  ];

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("access_key", "5ca408e5-d422-4d1a-a4d0-8bea33788a82");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(dictionary.contact_form_success);
        (event.target as HTMLFormElement).reset();
      } else {
        toast.error(dictionary.contact_form_error);
      }
    } catch {
      toast.error(dictionary.contact_form_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 mb-12 pointer-events-none" />
      <div className="w-[90%] max-w-6xl mx-auto relative z-10 space-y-16">
        <SectionHeader
          title={title}
          highlight={highlight}
          badge={badge}
          description={description}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* left - form */}
          <form
            onSubmit={onSubmit}
            className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-5 shadow-lg"
            data-aos="fade-right"
            data-aos-delay="100"
            data-aos-anchor-placement="top-center"
          >
            <h3 className="text-lg font-bold text-text">{dictionary.contact_form_title}</h3>

            {/* name */}
            <div>
              <label className="text-xs sm:text-sm text-gray-400 font-medium block mb-1.5">
                {dictionary.contact_form_name}
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder={dictionary.contact_form_name_placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text placeholder-gray-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
              />
            </div>

            {/* email */}
            <div>
              <label className="text-xs sm:text-sm text-gray-400 font-medium block mb-1.5">
                {dictionary.contact_form_email}
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder={dictionary.contact_form_email_placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text placeholder-gray-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
              />
            </div>

            {/* message */}
            <div>
              <label className="text-xs sm:text-sm text-gray-400 font-medium block mb-1.5">
                {dictionary.contact_form_message}
              </label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder={dictionary.contact_form_message_placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text placeholder-gray-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm resize-none"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{dictionary.contact_form_sending}</span>
                </>
              ) : (
                <>
                  <span>{dictionary.contact_form_submit}</span>
                  <LuSend className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* right - contact info */}
          <div
            data-aos="fade-left"
            data-aos-delay="100"
            data-aos-anchor-placement="top-center"
            className="p-2 sm:p-4 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold mb-6 text-text">{dictionary.contact_info_title}</h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-border/70 hover:border-primary/40 hover:bg-surface transition-all duration-300 group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{item.label}</div>
                      <div className="font-medium text-text text-sm sm:text-base group-hover:text-primary transition-colors">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Note about fast response */}
            <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-text/80 text-xs sm:text-sm leading-relaxed">
              {isId ? (
                <p>
                  🚀 Terbuka untuk diskusi proyek freelance, magang, maupun kerja sama jangka panjang. Respon tercepat melalui WhatsApp atau Email.
                </p>
              ) : (
                <p>
                  🚀 Open for freelance projects, internships, and long-term collaborations. Fastest response via WhatsApp or Email.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
