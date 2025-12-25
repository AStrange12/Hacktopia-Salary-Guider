# FinAI Advisor: Your Personal Salary Guider

FinAI Advisor is an intelligent web application designed to help users take control of their personal finances. By leveraging the power of generative AI, it provides personalized spending analysis, budget tracking, and actionable financial advice.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

---

## ✨ Key Features

-   **🤖 AI-Powered Financial Advice**: Get personalized, actionable advice from an AI trained to analyze your spending habits and financial goals.
-   **📊 Interactive Dashboard**: A central hub to view your monthly income, total spending, and financial health at a glance.
-   **📈 Real-time Spending Analysis**: See a breakdown of your spending split between "Needs," "Wants," and "Savings" based on the 50/30/20 rule.
-   **🎯 Savings Goal Tracking**: Set, track, and manage your financial goals, from an emergency fund to a vacation.
-   **🧾 Expense Management**: Easily add, edit, and delete expenses, which are automatically categorized to feed the AI analysis.
-   **🔐 Secure Authentication**: User accounts and data are secured using Firebase Authentication with support for email/password and Google Sign-In.
-   **🌓 Dark & Light Mode**: A sleek, modern UI with a theme toggle for user comfort.

---

## 🛠️ Tech Stack & Architecture

This project is built on a modern, serverless technology stack designed for scalability, security, and a great developer experience.

-   **Framework**: **Next.js 14** (with App Router)
-   **UI Library**: **React** & **ShadCN UI**
-   **Styling**: **Tailwind CSS**
-   **Authentication**: **Firebase Authentication**
-   **Database**: **Cloud Firestore**
-   **AI & Generative AI**: **Google Gemini & Genkit**
-   **Deployment**: **Vercel**

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

This project requires a connection to a Firebase project to function.

1.  Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
2.  In your Firebase project settings, create a new "Web App".
3.  Copy the `firebaseConfig` object provided.
4.  Create a new file named `.env.local` in the root of your project.
5.  Add your Firebase credentials to the `.env.local` file. Use the `.env.example` file as a template:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
    ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9000](http://localhost:9000) with your browser to see the result.

---

## 🌐 Deployment

This application is optimized for deployment on **Vercel**. For detailed, step-by-step instructions, please refer to the `DEPLOY.md` file included in this repository.
