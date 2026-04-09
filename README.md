# 📧 Email Verification Module (Node.js + Supabase)

A robust **Email Verification System** built with **Node.js, Express, and Supabase**.  
This project demonstrates how to verify email addresses using **SMTP protocol**, detect common typos, and provide structured results for integration into modern applications.

---

## 🚀 Features
- 🔍 **Syntax Validation** with regex and format checks
- 🌐 **DNS MX Lookup** to identify mail servers
- 📡 **SMTP Verification** (RCPT TO command) to check mailbox existence
- 🛠️ **Structured Results** with status codes, subresults, and execution time
- ✨ **"Did You Mean?" Suggestions** using Levenshtein distance for common typos (gmial → gmail, hotmial → hotmail, etc.)
- 🧪 **Unit Tests** with Jest for syntax, SMTP error codes, and edge cases

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** Supabase (Postgres)  
- **Verification:** SMTP protocol + DNS MX lookup  
- **Testing:** Jest  

---

## 🔑 Usage

const { verifyEmail } = require('./controllers/verify');

// Example
const result = await verifyEmail("user@gmial.com");

/*
{
  email: "user@gmial.com",
  result: "invalid",
  resultcode: 6,
  subresult: "typo_detected",
  domain: "gmial.com",
  mxRecords: [],
  executiontime: 2,
  error: null,
  timestamp: "2026-02-11T10:30:00.000Z",
  didyoumean: "user@gmail.com"
}
*/

