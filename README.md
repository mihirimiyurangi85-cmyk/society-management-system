# 🏛️ Society Welfare & Fund System

A modern full-stack web application designed to automate member contribution tracking, welfare assistance claims, and financial management for welfare societies.

🚀 **Live Demo:** [https://society-management-system-gamma.vercel.app/](https://society-management-system.vercel.app)

---

## ✨ Key Features

* **Admin Executive Dashboard:** Real-time metrics for total funds, bank vs cash balance, monthly collections, and active members.
* **Member Management:** Add, edit, and track society members and their active/inactive status.
* **Contribution Tracking:** Record monthly payments (LKR 200/month) and keep complete receipt logs.
* **Welfare Assistance Management:** Process and track welfare fund claims and payouts for eligible relatives.
* **Bank Statement Auto-Matching:** Upload bank statement CSVs to automatically verify and mark member contributions.
* **Role-Based Access Control:** Distinct workflows and dashboards for Admins and Members.
* **User Authentication:** Register with a username, email, and password, then sign in with a bcrypt-hashed password and JWT session token.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, TypeScript, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** MySQL / Mock Database
* **Deployment:** Vercel (Frontend)

---

## 💻 How to Run Locally

Install dependencies, then run the frontend and backend in separate terminals:

```bash
npm install
npm run server:dev
npm run dev
```

The frontend runs at `http://localhost:5173` and the authentication API runs at `http://localhost:5001`. User records are persisted in the local ignored file `server/data/users.json`.

For Vercel, deploy the frontend with the included `vercel.json` and set the `VITE_API_URL` environment variable to the public URL where the Express server is deployed. The Express server must be deployed separately because Vercel is hosting the Vite frontend in this configuration.

Demo accounts: `admin` / `admin123` and `M001` / `member123`.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/mihirimiyurangi85-cmyk/society-management-system.git](https://github.com/mihirimiyurangi85-cmyk/society-management-system.git)