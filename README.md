# 🎶 Kamaru Challenge Project

The **Kamaru Challenge** is a full-stack web application built to support the management and promotion of traditional music festivals. It provides seamless tools for managing users, events, participants, media galleries, and real-time statistics.

This project is powered by a **Flask backend** and a **React + Tailwind CSS frontend**, integrating services like **Cloudinary** for media uploads and **Brevo** for newsletter distribution.

## 📁 Project Structure

kamaru/ 
  ├── kamaru-backend/ 
    │ ├── app/ 
        │ │ ├── init.py 
        │ │ ├── models/ 
        │ │ ├── routes/
        │ │ ├── utils/
        │ ├── migrations/ 
    │ ├── .env 
    │ ├── config.py 
    │ ├── render.yaml 
    │ ├── requirements.txt 
    │└── run.py 
  └── kamaru-frontend/ 
      ├── public/ 
      ├── src/ 
      ├── .env 
      ├── package.json 
      └── tailwind.config.js
