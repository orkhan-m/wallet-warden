# 🚀 Wallet Warden Deployment Guide

This guide provides step-by-step instructions for deploying Wallet Warden to various platforms.

## 📋 Pre-deployment Checklist

- [ ] Code tested locally (`npm run dev`)
- [ ] Build completed successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Responsive design verified
- [ ] Performance optimized

## 🌐 Deployment Platforms

### 1. Vercel (Recommended)

Vercel offers excellent performance and easy deployment for React applications.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/wallet-warden)

#### Manual Deployment

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy from project directory**

   ```bash
   cd wallet-warden
   vercel --prod
   ```

4. **Configure Environment Variables** (Optional)
   - Go to your project dashboard on Vercel
   - Navigate to Settings → Environment Variables
   - Add your custom configuration

#### Configuration (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Netlify

Perfect for static sites with excellent CI/CD integration.

#### Deploy via Git

1. **Connect Repository**

   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 or higher

#### Deploy via CLI

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   netlify login
   netlify deploy --prod --dir=dist
   ```

#### Configuration (\_redirects)

```
/*    /index.html   200
```

### 3. GitHub Pages

Free hosting directly from your GitHub repository.

1. **Install gh-pages**

   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**

   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Configure vite.config.js**

   ```javascript
   export default defineConfig({
     base: "/wallet-warden/", // Replace with your repo name
     plugins: [react()],
   });
   ```

4. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

### 4. Firebase Hosting

Google's hosting platform with excellent performance.

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**

   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json**

   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### 5. AWS S3 + CloudFront

Scalable solution for high-traffic applications.

1. **Install AWS CLI**

   ```bash
   pip install awscli
   aws configure
   ```

2. **Create S3 Bucket**

   ```bash
   aws s3 mb s3://wallet-warden-app
   ```

3. **Enable Static Website Hosting**

   ```bash
   aws s3 website s3://wallet-warden-app --index-document index.html --error-document index.html
   ```

4. **Deploy**
   ```bash
   npm run build
   aws s3 sync dist/ s3://wallet-warden-app --delete
   ```

## 🔧 Environment Configuration

### Development Environment

```bash
# .env.development
VITE_BLOCKSCOUT_BASE_URL=https://eth.blockscout.com/api/v2
VITE_APP_ENV=development
VITE_API_TIMEOUT=10000
```

### Production Environment

```bash
# .env.production
VITE_BLOCKSCOUT_BASE_URL=https://eth.blockscout.com/api/v2
VITE_APP_ENV=production
VITE_API_TIMEOUT=5000
```

## 📊 Performance Optimization

### Build Optimization

1. **Bundle Analysis**

   ```bash
   npm run build -- --analyze
   ```

2. **Vite Configuration**
   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ["react", "react-dom"],
             charts: ["chart.js", "react-chartjs-2"],
             utils: ["axios", "ethers"],
           },
         },
       },
     },
   });
   ```

### Runtime Optimization

1. **Code Splitting**

   ```javascript
   const LazyComponent = lazy(() => import("./Component"));
   ```

2. **Image Optimization**

   - Use WebP format
   - Implement lazy loading
   - Optimize SVG icons

3. **Caching Strategy**
   ```javascript
   // Service Worker for caching
   self.addEventListener("fetch", (event) => {
     if (event.request.destination === "image") {
       event.respondWith(
         caches.open("images").then((cache) => {
           return cache.match(event.request) || fetch(event.request);
         })
       );
     }
   });
   ```

## 🛡️ Security Considerations

### API Security

1. **Rate Limiting**

   ```javascript
   const rateLimiter = {
     requests: 0,
     window: 60000, // 1 minute
     limit: 60,

     canMakeRequest() {
       // Implementation
     },
   };
   ```

2. **Request Validation**
   ```javascript
   const validateAddress = (address) => {
     return /^0x[a-fA-F0-9]{40}$/.test(address);
   };
   ```

### Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  connect-src 'self' *.blockscout.com;
  img-src 'self' data: https:;
"
/>
```

## 🔍 Monitoring & Analytics

### Error Tracking

1. **Sentry Integration**

   ```bash
   npm install @sentry/react
   ```

   ```javascript
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     environment: import.meta.env.MODE,
   });
   ```

### Performance Monitoring

1. **Web Vitals**

   ```javascript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

## 🚀 Continuous Deployment

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: "--prod"
```

## 📈 Post-Deployment

### Health Checks

1. **Automated Testing**

   ```bash
   # Test main functionality
   curl -f https://your-domain.com/
   curl -f https://your-domain.com/api/health
   ```

2. **Performance Testing**
   - Google PageSpeed Insights
   - GTmetrix analysis
   - WebPageTest.org

### Monitoring

1. **Uptime Monitoring**

   - UptimeRobot
   - Pingdom
   - StatusCake

2. **Analytics Setup**
   - Google Analytics
   - Plausible Analytics
   - Mixpanel (for events)

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **API CORS Issues**

   ```javascript
   // Add proxy in vite.config.js
   export default defineConfig({
     server: {
       proxy: {
         "/api": "https://eth.blockscout.com",
       },
     },
   });
   ```

3. **Routing Issues**
   - Ensure proper redirects configuration
   - Check base URL in vite.config.js
   - Verify HTML5 history API support

### Support

- 📧 Email: support@walletwarden.app
- 💬 Discord: [Community Server]
- 🐛 Issues: [GitHub Issues]
- 📚 Docs: [Documentation Site]

---

**Happy Deploying! 🚀**
