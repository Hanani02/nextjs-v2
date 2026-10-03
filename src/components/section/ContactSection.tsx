"use client";

import SectionHeader from "@/components/ui/sectionHeader";
import { LuMail, LuPhone, LuMapPin, LuSend } from "react-icons/lu";
import React, { useState } from 'react';
import { toast } from "react-hot-toast";

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
  const [loading, setLoading] = useState(false);

  const contactData = initialContact || {
    badge: "Contact",
    title: "Let's build something great",
    highlight: "something great",
    description: "Have a project in mind? I'd love to hear about it. Let's connect.",
    email: "akbarhanani02@gmail.com",
    phone: "+62 817 5204 440",
    location: "Pasuruan, Jawa Timur, Indonesia",
  };

  const contactInfo = [
    {
      icon: LuMail,
      label: "Email",
      value: contactData.email || "akbarhanani02@gmail.com",
      href: `mailto:${contactData.email || "akbarhanani02@gmail.com"}`,
    },
    {
      icon: LuPhone,
      label: "Phone",
      value: contactData.phone || "+62 817 5204 440",
      href: `tel:${contactData.phone?.replace(/\s+/g, '')}`,
    },
    {
      icon: LuMapPin,
      label: "Location",
      value: contactData.location || "Pasuruan, Jawa Timur, Indonesia",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactData.location || "Pasuruan, Jawa Timur, Indonesia")}`,
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
        toast.success("Pesan berhasil dikirim!");
        (event.target as HTMLFormElement).reset();
      } else {
        toast.error("Gagal mengirim pesan.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengirim pesan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 mb-12" />
      <div className="w-[90%] max-w-6xl mx-auto relative z-10 space-y-16">
        <SectionHeader
          title={contactData.title || "Let's build something great"}
          highlight={contactData.highlight || "something great"}
          badge={contactData.badge || "Contact"}
          description={contactData.description || "Have a project in mind? I'd love to hear about it. Let's connect."}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* left - form */}
          <form
            onSubmit={onSubmit}
            className="p-6 rounded-2xl bg-surface border border-border space-y-5"
            data-aos="fade-right"
            data-aos-delay="100"
            data-aos-anchor-placement="top-center"
          >
            <h3 className="text-lg font-semibold text-text">Send a message</h3>
            {/* name */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text outline-none focus:border-primary transition"
              />
            </div>
            {/* email */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Message</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Your message..."
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text outline-none focus:border-primary transition"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-full bg-primary text-gray-200 font-medium hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Sending message...
                </>
              ) : (
                <>
                  Send Message
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
            className="p-2"
          >
            <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">{item.label}</div>
                    <div className="font-medium">{item.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
