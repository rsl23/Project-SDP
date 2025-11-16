# 🚀 Deployment Guide - BJM Parts

Panduan lengkap untuk deploy BJM Parts ke production environment.

## 📋 Preparation Checklist

Sebelum deploy, pastikan:

- [ ] Semua fitur sudah di-test di local
- [ ] Environment variables sudah disiapkan
- [ ] Firebase project production sudah ready
- [ ] Admin password sudah diganti
- [ ] Database sudah di-populate dengan data real

## 🌐 Deployment Options

### Option 1: Frontend (Vercel) + Backend (Railway)

**Recommended untuk:**

- Fast deployment
- Auto SSL certificates
- Easy scaling
- Free tier available

#### Frontend → Vercel

**Step 1: Push ke GitHub**

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**Step 2: Deploy via Vercel Dashboard**

1. Login ke https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   ```
   Root Directory: frontend
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

**Step 3: Environment Variables**

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_API_URL=https://your-backend.railway.app
```

**Step 4: Deploy**

- Click "Deploy"
- Wait for build to complete
- Access your site at `https://your-project.vercel.app`

#### Backend → Railway

**Step 1: Login Railway**

```bash
npm install -g @railway/cli
railway login
```

**Step 2: Initialize Project**

```bash
cd backend
railway init
```

**Step 3: Configure**

Di Railway Dashboard:

1. Select your project
2. Settings → Add variables:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
   FIREBASE_UNIVERSE_DOMAIN=googleapis.com
   ```

**Step 4: Deploy**

```bash
railway up
```

**Step 5: Configure Domain**

- Railway akan auto-generate domain: `your-backend.railway.app`
- Update `VITE_API_URL` di Vercel environment variables
- Redeploy frontend

---

### Option 2: Frontend (Netlify) + Backend (Render)

#### Frontend → Netlify

**Step 1: Build Settings**

```toml
# netlify.toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Step 2: Deploy**

```bash
cd frontend
npm install netlify-cli -g
netlify deploy --prod
```

#### Backend → Render

**Step 1: Create render.yaml**

```yaml
# render.yaml (di root project)
services:
  - type: web
    name: bjm-parts-backend
    runtime: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: PORT
        value: 5000
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
      # ... other env vars
```

**Step 2: Deploy via Dashboard**

1. Login https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy

---

## 🔒 Security Configuration

### 1. Update CORS di Backend

```javascript
// backend/src/index.js
const allowedOrigins = [
  "https://your-frontend.vercel.app",
  "https://your-custom-domain.com",
  "http://localhost:5173", // Development
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
```

### 2. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Products - read public, write admin only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Stock - admin only
    match /stock/{stockId} {
      allow read: if request.auth != null &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Orders - users read own, admin read all
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                    (resource.data.userId == request.auth.uid ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Cart - users access own only
    match /cart/{cartId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Categories - read public, write admin
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Testimonials - read approved public, create authenticated, moderate admin
    match /testimonials/{testimonialId} {
      allow read: if resource.data.status == 'approved' ||
                    (request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 3. Firebase Authentication Settings

Di Firebase Console → Authentication → Settings:

1. **Email/Password**

   - ✅ Enable
   - ✅ Email link (passwordless sign-in) - Optional

2. **Google Sign-In**

   - ✅ Enable
   - Add authorized domains: `your-domain.com`, `your-frontend.vercel.app`

3. **Authorized Domains**
   - Add production domain
   - Add staging domain (if any)

---

## 📊 Post-Deployment

### 1. Health Check

**Backend Health Endpoint:**

```bash
curl https://your-backend.railway.app/api/products
```

**Frontend:**

```bash
curl https://your-frontend.vercel.app
```

### 2. Create Production Admin

```bash
# Update create-admin.js dengan production credentials
node create-admin.js
```

### 3. Monitor Logs

**Vercel:**

```bash
vercel logs
```

**Railway:**

```bash
railway logs
```

### 4. Setup Analytics

Di Firebase Console → Analytics:

- Enable Google Analytics
- Monitor user behavior
- Track conversion rates

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions for Auto-Deploy

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - name: Deploy to Vercel
        run: |
          cd frontend
          npm install
          npm run build
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          cd backend
          railway up --token=${{ secrets.RAILWAY_TOKEN }}
```

---

## 🐛 Troubleshooting

### Issue: CORS Error di Production

**Solution:**

```javascript
// Update backend/src/index.js
const allowedOrigins = ["https://your-frontend.vercel.app"];
app.use(cors({ origin: allowedOrigins }));
```

### Issue: Environment Variables Tidak Terbaca

**Solution:**

- Vercel: Redeploy setelah update env vars
- Railway: Restart service
- Cek prefix `VITE_` untuk frontend env vars

### Issue: Firebase Admin SDK Error

**Solution:**

- Verify semua Firebase env vars sudah set
- Cek format FIREBASE_PRIVATE_KEY (harus ada newlines: `\n`)
- Test connection: `railway run node backend/src/index.js`

---

## 📈 Performance Optimization

### 1. Enable Caching

```javascript
// backend/src/index.js
app.use((req, res, next) => {
  if (req.path.startsWith("/api/products")) {
    res.set("Cache-Control", "public, max-age=300"); // 5 minutes
  }
  next();
});
```

### 2. Compress Responses

```bash
npm install compression --workspace=backend
```

```javascript
import compression from "compression";
app.use(compression());
```

### 3. Image Optimization

- Use WebP format
- Compress images before upload
- Use Firebase Storage CDN

---

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel/Netlify
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured
- [ ] CORS updated dengan production domain
- [ ] Firestore security rules applied
- [ ] Admin user created di production
- [ ] Firebase authorized domains updated
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Analytics setup
- [ ] Monitoring & logging enabled
- [ ] Backup strategy in place

---

**🎉 Congratulations! Your application is now live!**

Access:

- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.railway.app`
- Admin Panel: `https://your-frontend.vercel.app/admin`
