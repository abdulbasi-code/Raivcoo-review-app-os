"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const footerSections = [
  {
    title: "Legal",
    links: [
      {
        title: "Terms of Service",
        href: "/legal/TermsOfService",
      },
      {
        title: "Privacy Policy",
        href: "/legal/PrivacyPolicy",
      },
    ],
  },
  {
    title: "Support",
    links: [
      {
        title: "Help Center",
        href: "/support",
      },
    ],
  },
  {
    title: "Connect",
    links: [
      {
        title: "Twitter",
        href: "https://twitter.com/TEST",
      },
      {
        title: "Discord",
        href: "https://discord.gg/G5AZBEP5",
      },
      {
        title: "YouTube",
        href: "https://www.youtube.com/@TEST",
      },

      {
        title: "Email",
        href: "mailto:test@gmail.com",
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function Footer() {
  return (
    <motion.footer
      className="w-full py-12 bg-background border-t"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description Section */}
          <motion.div variants={itemVariants} className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/">
                <Image
                  src={"/MainLogo.png"}
                  alt="TEST.com Footer Logo"
                  loading="lazy"
                  height={80}
                  width={80}
                  className="rounded-[5px] hover:scale-105 transition-all duration-300 "
                />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              A simple tool for editors to share videos and get client feedback
              in one place.
            </p>
          </motion.div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="col-span-1"
            >
              <h3 className="text-lg font-semibold mb-4 text-purple-500">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm  text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t ">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              <span className="text-purple-500">© </span>{" "}
              {new Date().getFullYear()} TEST. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;
