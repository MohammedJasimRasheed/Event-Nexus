# 🚀 EventNexus – Event Aggregator for College/University Students

## 🌐 Live Site
Check out the live application here: 👉 **[EventNexus Live Site](https://event-nexus-phi.vercel.app)**

## 🧩 Introduction
EventNexus is a full-stack web platform built to help college students easily discover and manage tech events, hackathons, workshops, and free developer resources all in one place.
Designed with a seamless user experience, EventNexus aggregates events automatically through web scraping and allows organizers to submit their own events, creating a central hub for student opportunities.

## 🎯 Features
- **Event Discovery** – Automatically scraped and manually submitted events from platforms like GDG, Devfolio, MLH, and Eventbrite.
- **Free Courses & Resources** – Curated list of free online courses with coupon codes and developer resources like GitHub Student Pack.
- **College Profiles** – Dedicated pages for individual college events and opportunities.
- **Automated Scraping** – Powered by Firecrawl and node-cron to keep event listings up to date automatically.
- **Secure Authentication** – Role-based access control (User, Organizer, Admin) powered by Supabase.
- **Admin Dashboard** – Comprehensive approval workflows, event management, and resource moderation.
- **Responsive Design** – Optimized for seamless browsing across desktop and mobile devices.

## 🛠️ Tech Stack

### 🖥️ Frontend
![React](https://img.shields.io/static/v1?label=Frontend&message=React%2018&color=20232A&logo=react&style=flat-square)
![Vite](https://img.shields.io/static/v1?label=Bundler&message=Vite&color=646CFF&logo=vite&style=flat-square)
![Tailwind CSS](https://img.shields.io/static/v1?label=Styling&message=Tailwind%20CSS&color=38B2AC&logo=tailwind-css&style=flat-square)
![Framer Motion](https://img.shields.io/static/v1?label=Animations&message=Framer%20Motion&color=0055FF&logo=framer&style=flat-square)
![OGL](https://img.shields.io/static/v1?label=3D&message=OGL&color=000000&logo=opengl&style=flat-square)
![Lenis](https://img.shields.io/static/v1?label=Scroll&message=Lenis&color=000000&style=flat-square)

### ⚙️ Backend & Database
![Node.js](https://img.shields.io/static/v1?label=Backend&message=Node.js&color=339933&logo=nodedotjs&style=flat-square)
![Express.js](https://img.shields.io/static/v1?label=Framework&message=Express.js&color=000000&logo=express&style=flat-square)
![Supabase](https://img.shields.io/static/v1?label=Auth%20&%20DB&message=Supabase&color=3ECF8E&logo=supabase&style=flat-square)
![PostgreSQL](https://img.shields.io/static/v1?label=Database&message=PostgreSQL&color=4169E1&logo=postgresql&style=flat-square)

### 🚀 Automation & Cloud
![Firecrawl](https://img.shields.io/static/v1?label=Scraping&message=Firecrawl&color=FF4B4B&style=flat-square)
![Render](https://img.shields.io/static/v1?label=Hosting&message=Render&color=000000&logo=render&style=flat-square)
![Vercel](https://img.shields.io/static/v1?label=Deployment&message=Vercel&color=000000&logo=vercel&style=flat-square)

## ⚙️ Installation

Clone the repository:
```bash
git clone https://github.com/Kaushik00007/Event-Nexus.git
cd Event-Nexus
```

Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Set up your `.env` variables in both `backend` and `frontend` directories using your Supabase and Firecrawl API keys.

Run the development servers:
```bash
# Terminal 1 — backend (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

Your app will be available at:
👉 **http://localhost:5173**

## 💻 Usage
1. Sign up or sign in to your account.
2. Browse the homepage to discover featured and local events.
3. Filter events by category, city, or event type.
4. If you are an organizer, submit your own events for admin approval.
5. Explore the specific sections for free courses and developer resources.
6. Admins can access the dashboard to manage content and approve pending events.

## 🌟 Future Enhancements
- Team formation features for hackathons.
- Calendar integration for saving events.
- Advanced personalized event recommendations based on user interests.
- In-app messaging for event organizers and attendees.

## 🤝 Contributions
Contributions are welcome! Follow these steps:
```
1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your fork
5. Open a pull request
```

## 💻 Cross-Platform Development (Linux & Windows)

This project is designed to work seamlessly on both **Linux** and **Windows**. To ensure a consistent experience:

1.  **Git Configuration**: This project uses a `.gitattributes` file to enforce `LF` line endings in the repository. To avoid warnings on Windows, run:
    ```bash
    git config --global core.autocrlf input
    ```

2.  **Native Modules**: If you alternate between Windows and linux, the `node_modules` folder will contain OS-specific binaries. Always run the following when switching:
    ```bash
    # Reinstall all dependencies for the current OS
    npm run install-all
    ```

## 📩 Contact
For queries or collaboration, reach out via:
- <img src="https://skillicons.dev/icons?i=gmail" width="20" valign="middle" /> Email: [kaushi00007@gmail.com](mailto:kaushi00007@gmail.com)
- <img src="https://skillicons.dev/icons?i=linkedin" width="20" valign="middle" /> LinkedIn: [Kaushik K](https://www.linkedin.com/in/kaushik-k-dev)
- <img src="https://skillicons.dev/icons?i=github" width="20" valign="middle" /> GitHub: [Kaushik00007](https://github.com/Kaushik00007)

---

<p align="center">
  <b>EventNexus</b> – Aggregating opportunities for the next generation of developers.<br>
  <img src="https://img.shields.io/static/v1?label=Built%20With&message=React&color=20232A&logo=react&style=for-the-badge" />
  <img src="https://img.shields.io/static/v1?label=Built%20With&message=Supabase&color=3ECF8E&logo=supabase&style=for-the-badge" />
  <img src="https://img.shields.io/static/v1?label=Built%20With&message=Tailwind%20CSS&color=38B2AC&logo=tailwind-css&style=for-the-badge" />
</p>
