# 🚀 Deployment Guide for AWS

This guide explains how to deploy your **Crop Guidance System** to AWS.
The project consists of two parts that need to be deployed separately but connected:

1.  **Backend (Machine Learning API)**: Deployed to **AWS App Runner** (or Elastic Beanstalk).
2.  **Frontend (React App)**: Deployed to **AWS Amplify**.

---

## 📋 Prerequisites

*   An AWS Account.
*   The project code pushed to a GitHub repository.

---

## 🛠 Step 1: Deploy Backend (Machine Learning API)

We will use **AWS App Runner** because it is the easiest way to deploy a containerized Python app.

1.  **Log in to AWS Console** and search for **"App Runner"**.
2.  Click **Create an App Runner service**.
3.  **Source**:
    *   Select **Source code repository**.
    *   Connect your GitHub account and select your repository (`Crop-Guidance-System`).
    *   **Branch**: `main` (or your active branch).
    *   **Source directory**: Select **Directory** and browse to select the `Machine-Learning` folder.
    *   **Configuration**: Select **python 3** (or similar).
        *   **Build command**: `pip install -r requirements.txt`
        *   **Start command**: `gunicorn --bind 0.0.0.0:8080 app:app`
        *   *Note: App Runner defaults to port 8080. If you keep 8080 here, make sure your app listens on it. However, our Dockerfile exposes 5000. It is often easier to use "Configuration via deployment file" if you have `apprunner.yaml`, but "Configure all settings here" is fine.*
    *   **ALTERNATIVE (Better)**: If the option allows, choose **"Deep inspection"** or just use the **Dockerfile** path if App Runner supports your setup.
    *   **Actually, the Easiest Way with provided Dockerfile**:
        *   In App Runner, choose "Source code repository".
        *   Repository settings: Interface with your repo.
        *   **Deployment settings**:
            *   Runtime: **Python 3**
            *   Build command: `pip install -r requirements.txt`
            *   Start command: `gunicorn --bind 0.0.0.0:8080 app:app` (App Runner expects port 8080 by default)
            *   **Port**: 8080
            *   **Environment Variables**:
                *   Add `PORT=8080` (Important: Flask/Gunicorn needs to know to listen on this port).

4.  **Service Settings**:
    *   Give your service a name (e.g., `crop-prediction-api`).
    *   **Environment variables**: 
        *   `MODEL_VERSION` = `1`
    *   **Port**: 8080.

5.  **Deploy**: Click Create & Deploy.
6.  **Get the URL**: Once deployed (takes 5-10 mins), copy the **Default domain** (e.g., `https://xyz.awsapprunner.com`). 
    *   **Save this URL.** You need it for the frontend.

---

## 💻 Step 2: Deploy Frontend (React + Vite)

We will use **AWS Amplify** which automatically builds and hosts your frontend.

1.  **Log in to AWS Console** and search for **"Amplify"**.
2.  Click **Create new app** -> **GitHub**.
3.  Authorize GitHub and select your repository (`Crop-Guidance-System`).
4.  **Branch**: `main`.
5.  **Build Settings**:
    *   Amplify should auto-detect the settings.
    *   Verify the build command is `npm run build`.
    *   Base directory: `/` (Root).
6.  **Advanced Settings (Environment Variables)**:
    *   You MUST add the backend URL here.
    *   Key: `VITE_CROP_API_URL`
    *   Value: `https://xyz.awsapprunner.com` (The URL you copied from Step 1). Do NOT include a trailing slash `/`.
7.  **Deploy**: Click **Save and Deploy**.

---

## ✅ Step 3: Verify

1.  Wait for Amplify to finish building.
2.  Click the **Domain** link provided by Amplify (e.g., `https://main.d123.amplifyapp.com`).
3.  Go to the **Crop Prediction** page.
4.  Enter values and click Predict.
5.  It should connect to your App Runner backend and return a result.

---

## ℹ️ Important Notes

*   **Models**: The current backend code loads models from the `models/` directory in `Machine-Learning`. Since you might not have committed the huge `.pkl` files to git (due to size limits), the app might run in **MOCK MODE** (random predictions).
    *   To fix this: Ensure you train the models and add the `.pkl` files to your repo (if <100MB) or configure the app to download them from AWS S3 on startup.
*   **CORS**: The backend is configured with `CORS(app)`, which allows all origins by default. This is good for testing but consider restricting it to your Amplify domain in production.
