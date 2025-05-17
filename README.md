# Raivcoo – Open Source Video Review App

**Raivcoo** is a lightweight feedback and review system for solo video editors. Share video links (Google Drive, Dropbox, Vimeo, YouTube), get timestamped comments, images, and references—without requiring your client to sign up. It also includes an Adobe extension that syncs feedback directly into Premiere Pro and After Effects.

> ✅ Built entirely with **Next.js 15 App Router** and **Supabase** — no custom backend.

---

## 🎯 Purpose

- Speed up the review process between editors and clients
- Avoid enterprise-level complexity (like Frame.io)
- Explore what’s possible using only frontend + Supabase as backend
- Integrate a custom Adobe extension using Bolt-CEP

---

## 🧱 Tech Stack

| Layer              | Tech                                                                  |
|--------------------|-----------------------------------------------------------------------|
| Framework          | **Next.js 15 (App Router)**                                           |
| Auth & Database    | **Supabase (Auth + Postgres)** – OAuth (Google, Discord) + password   |
| UI & Styling       | **Tailwind CSS, ShadCN UI**                                           |
| SEO & Metadata     | **Next.js Metadata API**, `next-seo`                                  |
| OG Image Rendering | **Static + Dynamic via `/og` route**                                 |
| Hosting            | **Vercel**                                                            |
| Adobe Extension    | **Bolt-CEP (React + TypeScript)**                                     |

> 🔐 **Auth**: Users can sign up with email/password or OAuth (Google, Discord). Auth state is shared across the web app and extension.


---

## ⚙️ Core Features

- 🔗 Paste any video link (Google Drive, Dropbox, Vimeo, YouTube)
- ⏱ Clients can comment with timestamps — no login needed
- 🖼️ Support for screenshots, links, and comments
- 🔁 Tracks & rounds for clear revision flow
- ✅ Approval/revision status updates
- 🧩 Extension support for Adobe Premiere / AE
- 🔐 Client login with one-time email verification
- 🌐 SEO: OG tags, dynamic previews, sitemap, robots.txt, ads.txt

---

## 🧪 Live App

- 🌍 **Web App**: [https://raivcoo.com](https://raivcoo.com)
- 🧩 **Adobe Extension**: Installable via signed `.zxp` 


## 🛡 License

This project is licensed under **CC BY-NC-ND 4.0**  
[View License »](https://creativecommons.org/licenses/by-nc-nd/4.0/)


