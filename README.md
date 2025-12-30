# OFSAA Unified Manager

A modern, streamlined web application for capturing and managing OFSAA stack and component data.

## 🚀 Features

*   **Unified Data Entry**: Easily record Client Name, Component Type, Product details, Versioning, and Resource allocation.
*   **Supabase Integration**: Secure and scalable cloud storage using Supabase.
*   **Modern UI**: Built with React and Glassmorphism design principles for a premium feel.
*   **Secure**: Database credentials are managed securely via environment variables.

## 🛠️ Technology Stack

*   **Frontend**: React (Vite)
*   **Database**: Supabase (PostgreSQL)
*   **Styling**: Pure CSS3 (CSS Variables, Flexbox, Grid)

## 📦 Installation

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the `client` directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_KEY=your_supabase_anon_key
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

## 🗄️ Database Schema

The application expects a table named `OFSAA_stack` in Supabase with the following schema:
*   `id` (int8, primary key, generated)
*   `clientName` (text)
*   `componentType` (text)
*   `product` (text)
*   `version` (text)
*   `patch` (text)
*   `certified` (text)
*   `supportStatus` (text)
*   `coreComponent` (text)
*   `subApplication` (text)
*   `versionDetails` (text)
*   `vcpu` (text)
*   `ram` (text)
*   `storage` (text)
*   `notes` (text)
*   `createdAt` (timestamptz, default: now())

## 📝 Usage

*   Open the app in your browser (usually `http://127.0.0.1:5173`).
*   Fill in the form fields.
*   Click **Save Record** to submit data to the cloud.

---
*Created with ❤️ by Antigravity*
