"use client";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const Footer = () => {

    const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "How it Works", href: "/how-it-works" },
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Success Stories", href: "/stories" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Tutorials", href: "/tutorials" },
        { label: "FAQ", href: "/faq" },
        { label: "Community", href: "/community" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
        { label: "Press Kit", href: "/press" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Guidelines", href: "/guidelines" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-500" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-500" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-700" },
    { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-500" },
  ];

  const contactInfo = [
    { icon: Mail, text: "support@studyplatform.com" },
    { icon: Phone, text: "+1 (555) 123-4567" },
    { icon: MapPin, text: "123 Learning Street, Education City, EC 12345" },
  ];

  return (
    <footer className="bg-[#d5dae3] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '4px 4px 8px #b0b8c7, -4px -4px 8px #f0f4fa' }}
                >
                  <span className="text-white font-black text-xl">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-gray-800">NeuroSync</span>
                  <span className="text-xs text-gray-500">Learn & Share Knowledge</span>
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Empowering learners worldwide with a collaborative platform for asking questions, sharing knowledge, and growing together.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {contactInfo.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-500 hover:text-purple-600 transition-colors cursor-pointer">
                      <Icon size={16} />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Footer Links Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              className="lg:col-span-1"
            >
              <h3 className="text-gray-800 font-bold text-base mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 transform duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-gray-500"
          >
            © {new Date().getFullYear()} NeuroSync. Made with{" "}
            <Heart size={14} className="inline-block text-red-400 fill-current mx-1" />
            All rights reserved.
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            {socialLinks.map((social, i) => {
              const Icon = social.icon;
              return (
                <Link
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl nm-btn flex items-center justify-center transition-all transform hover:scale-110 text-gray-500 ${social.color}`}
                >
                  <Icon size={18} />
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 pt-12 border-t border-gray-400/20"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Stay Updated 📬
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Subscribe to our newsletter for the latest updates, tips, and exclusive content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 nm-input"
              />
              <button className="px-8 py-3 rounded-xl nm-gradient-btn hover:scale-105 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </footer>
  )
}

export default Footer
