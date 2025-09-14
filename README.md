# Fundy 🌟

Fundy is a crowdfunding platform that empowers creators and dreamers to bring their ideas to life with community support. Users can create campaigns, back projects, and track progress. Admins can approve or reject campaigns.  

---

## Features 🚀

- Create, view, and manage campaigns  
- Search campaigns by title or description  
- Filter campaigns by category  
- Sort campaigns by goal or amount raised  
- Pledge to campaigns (requires login)  
- Admin approval workflow for new campaigns  
- Responsive layout with carousel and testimonials  

---

## Tech Stack 🛠️

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** JSON Server with `json-server-auth`  
- **Libraries & Tools:**  
  - SweetAlert2 for alerts  
  - Font Awesome for icons  

---

## Project Structure 📂

fundy/
├─ docs/
│   ├─ index.html
│   ├─ about.html
│   ├─ contact.html
│   ├─ admin.html
│   ├─ login.html
│   ├─ register.html
│   ├─ payment.html
│   ├─ profile.html
│   ├─ user.html
│   ├─ css/
│   │   └─ style.css
│   ├─ js/
│   │   ├─ campaign.js
│   │   ├─ hero.js
│   │   ├─ navbar.js
│   │   ├─ admin.js
│   │   ├─ auth.js
│   │   ├─ payment.js
│   │   └─ profile.js
│   └─ images/
│       
├─ server.js
├─ db.json
├─ package.json
├─ .gitignore
├─ node_modules/
└─ README.md



---

## Installation 💻

1. Clone the repository:  
```bash
git clone https://github.com/mennaseif/fundy.git
cd fundy

2. Install dependencies:

npm install json-server json-server-auth


3. Start the server:

node server.js


4. Open index.html in your browser (or use a local server).

Usage 🖱️

View Campaigns: Browse featured campaigns on the homepage

Search & Filter: Use the search bar or category dropdown

Sort Campaigns: Sort by goal or amount raised using the sort dropdown

Create Campaign: Log in and use the create campaign page

Admin Actions: Admin users can approve or reject campaigns

Live Demo:https://mennaseif.github.io/Fundy/

