# 💸 Free Deployment Guide (Render + Vercel)

You are correct! AWS App Runner is a paid service. If you want to host this project for **FREE**, we recommend using **Render** for the backend and **Vercel** for the frontend.

---

## 1️⃣ Deploy Backend (Flask) on Render [FREE]

Render offers a "Free Tier" for web services (it spins down after inactivity, meaning the first request might take 30-50 seconds, but it's free).

1.  **Push your code** to GitHub.
2.  **Sign up** at [render.com](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Select **Build and deploy from a Git repository**.
5.  Connect your repository (`Crop-Guidance-System`).
6.  **Settings**:
    *   **Name**: `crop-prediction-api`
    *   **Root Directory**: `Machine-Learning` (Important! This tells Render where the python code is).
    *   **Runtime**: **Docker** (Best option since we have a Dockerfile).
    *   **Instance Type**: **Free**.
7.  Click **Create Web Service**.
8.  Wait for deployment to finish.
9.  **Copy the URL** (e.g., `https://crop-app.onrender.com`). You will need this for the frontend.

---

## 2️⃣ Deploy Frontend (React) on Vercel [FREE]

Vercel is the industry standard for hosting React apps for free.

1.  **Sign up** at [vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite (should detect automatically).
    *   **Root Directory**: Click `Edit` and select `Frontend`.
    *   **Environment Variables**:
        *   **Key**: `VITE_CROP_API_URL`
        *   **Value**: The URL you copied from Render (e.g., `https://crop-app.onrender.com`). (Do NOT add a trailing slash `/`).
5.  Click **Deploy**.

---

## 3️⃣ AWS Free Tier Option (EC2)

If you **must** use AWS and want it free, you have to use **EC2 (Elastic Compute Cloud)**.
*   **Pros**: Always running (doesn't sleep).
*   **Cons**: Harder to set up (Manual Linux administration). 
*   **Limit**: Free for 12 months (750 hours/month on `t2.micro` or `t3.micro`).

**Steps:**
1.  Launch a `t2.micro` (Ubuntu based) instance in AWS EC2 Console.
2.  SSH into it.
3.  Install Docker: `sudo apt update && sudo apt install docker.io`.
4.  Clone your repo: `git clone ...`.
5.  Build backend: `cd Machine-Learning && docker build -t backend .`
6.  Run backend: `docker run -d -p 80:5000 backend`.
7.  (You will also need to configure Security Groups to allow port 80/custom ports).

**Recommendation**: Stick to **Render + Vercel** for the easiest experience.
