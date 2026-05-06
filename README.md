# Node JWT Authentication System

A complete authentication system built using Node.js and JSON Web Tokens (JWT), implementing secure and scalable user authentication workflows.

## 🚀 Features

   - JWT-based Authentication (Access Token & Refresh Token)
   - Email Verification before Login
   - OTP (One-Time Password) Verification System
   - Token Blacklisting (Logout Security)
   - Single Device Login Restriction
   - Session Management
   - Multiple Login Flow Support
   - Secure Token Lifecycle Handling

## 🛠️ Tech Stack

   - Node.js
   - Express.js
   - MongoDB (or your DB)
   - JWT (jsonwebtoken)
   - Nodemailer (for email verification)

## 🔐 Authentication Flow

   1. User registers with email
   2. OTP/email verification is required before login
   3. On successful login:
      - Access Token is generated (short-lived)
      - Refresh Token is generated (long-lived)
   4. Refresh token is used to generate new access tokens
   5. Logout adds token to blacklist
   6. Single device login enforced via session tracking

## 📌 Use Cases

- Secure login systems
- Enterprise authentication flows
- Scalable backend systems requiring JWT authentication

## 📧 Future Improvements

- Role-based access control (RBAC)
- OAuth integration (Google, GitHub login)
- Rate limiting & brute-force protection

---

⭐ Feel free to fork, use, and improve this project!
