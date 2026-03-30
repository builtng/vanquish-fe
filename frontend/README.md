# 💻 Vanquish Frontend (Next.js)

The user interface for the Vanquish Therapy Management System, built with **Next.js 15 (App Router)** and **Tailwind CSS 4**.

## 🏗️ Project Structure

- `app/`: Main App Router directory containing all pages.
- `app/dashboard/`: The primary management hub (protected routes).
- `app/dashboard/trainee-applications/`: The recruitment and onboarding tracker.
- `components/`: Reusable UI components (Modals, Navigation, Tables).
- `contexts/`: React context providers (Auth, Global Settings).
- `lib/`: API service abstraction (`api.js`) and charting utils.

---

## 🚀 Key Modules

### **Recruitment Dashboard**
Location: `app/dashboard/trainee-applications/`
- **List View**: Features advanced filtering by Stage (S1-S4) and Status.
- **Detail View ([id])**: A comprehensive command center for a single candidate. Handles video playback, interview scheduling (Trafft), and the onboarding checklist.

### **Management Panels**
- **Clients**: CRM for tracking therapy progress.
- **Counsellors**: Profile management for practitioners.
- **Inductions**: Mandatory training tracker.

---

## 🎨 Design System

We use **Tailwind CSS 4** for styling.
- **Glassmorphism**: Used in dashboard cards for a premium feel.
- **Transitions**: Smooth HSL-based color shifts and hover effects.
- **Responsiveness**: Mobile-first design for all admin panels.

---

## 🔌 API Integration

All API calls should go through the `fetch` abstraction.
Environment Variable: `NEXT_PUBLIC_API_URL`.

**Pattern for Data Fetching:**
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setData(data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };
  fetchData();
}, []);
```

---

## 🔒 Authentication

Routes are protected by the `PageGuard.jsx` component.
- **Verification**: Checks for a valid JWT in `localStorage`.
- **RBAC**: Redirects users if they don't have the required `menuId` privilege.

---

## 📦 Local Development

**Run the app:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

---
*UI/UX Lead: Antigravity AI*
