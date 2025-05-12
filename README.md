# Vote Secure

A secure and anonymous voting application built with **Next.js**, **MongoDB**, and **JWT authentication**.

![Vote Secure](https://github.com/user-attachments/assets/16a80e6d-510a-4af9-ad47-bd97d892cbae)


---

## 🚀 Features

* 🔐 **Secure Authentication**: JWT-based authentication with bcrypt password hashing
* 🕵️ **Anonymous Voting**: Vote on polls without exposing your identity
* 📊 **Real-time Results**: View poll results with interactive charts
* 🗳️ **Poll Management**: Create, edit, and delete polls
* 🌭 **Result Manipulation**: Add realistic fake votes and encrypt real votes
* 📱 **Responsive Design**: Works on desktop and mobile devices

---

## 💠 Tech Stack

* **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
* **Backend**: Next.js API Routes (Node.js)
* **Database**: MongoDB
* **Authentication**: JWT, bcrypt
* **Charts**: Recharts

---

## 🧑‍💻 Getting Started

### ✅ Prerequisites

* Node.js v18+
* MongoDB database

### 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/arjun101003/vote-secure.git
   cd vote-secure
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file with the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ENCRYPTION_KEY=your_encryption_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Go to [http://localhost:3000](http://localhost:3000)

---

## 🔍 Features in Detail

### 🔑 Authentication System

* Secure registration and login with JWT tokens
* Password hashing using bcrypt
* Protected routes for authenticated users

### 📋 Poll Creation and Management

* Create polls with multiple voting options
* Edit existing polls
* Delete your own polls

### 🗳️ Voting System

* Anonymous voting mechanism
* One vote per user per poll
* Real-time vote updates

### 📈 Results Visualization

* Interactive pie charts using Recharts
* Displays percentage and total count
* Automatically highlights the winner

### 🔐 Security Features

* Votes are encrypted before storing
* Add realistic fake votes to simulate turnout
* Secure and scalable architecture

---

## 📡 API Endpoints

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| POST   | `/api/auth/register`             | Register a new user            |
| POST   | `/api/auth/login`                | Login and receive JWT token    |
| GET    | `/api/auth/me`                   | Get current authenticated user |
| POST   | `/api/auth/logout`               | Logout and clear token         |
| POST   | `/api/polls`                     | Create a new poll              |
| GET    | `/api/polls`                     | List all polls                 |
| GET    | `/api/polls/[id]`                | Get a specific poll            |
| PUT    | `/api/polls/[id]`                | Update a specific poll         |
| DELETE | `/api/polls/[id]`                | Delete a poll                  |
| POST   | `/api/polls/[id]/vote`           | Submit a vote                  |
| POST   | `/api/polls/[id]/toggle-results` | Show or hide poll results      |
| POST   | `/api/polls/[id]/edit-results`   | Modify poll results            |

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the project and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**Arjun Singh**

* 🌐 [LinkedIn](https://www.linkedin.com/in/arjunxsingh/)
* 💻 [GitHub](https://github.com/arjun101003)
* 📧 [arjun101003@gmail.com](mailto:arjun101003@gmail.com)

