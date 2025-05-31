# 🚀 Deployment Guide

Quick deployment guide for Wallet Warden.

## ✅ Pre-deployment

```bash
npm run build  # Ensure build works
```

## 🌐 Deploy to Vercel (Recommended)

**Quick Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/wallet-warden)

**Manual Deploy:**

```bash
npm i -g vercel
vercel --prod
```

## 🌐 Deploy to Netlify

**Via Git:**

1. Go to [Netlify](https://netlify.com)
2. Connect your repository
3. Build command: `npm run build`
4. Publish directory: `dist`

**Via CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

## 🌐 Deploy to GitHub Pages

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

Update `vite.config.js`:

```javascript
export default defineConfig({
  base: "/wallet-warden/", // Your repo name
  plugins: [react()],
});
```

## 🔧 Environment Variables

```bash
# .env.production
VITE_BLOCKSCOUT_BASE_URL=https://eth.blockscout.com/api/v2
VITE_APP_ENV=production
```

## 🛡️ Security

Add to your HTML head:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  connect-src 'self' *.blockscout.com;
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
"
/>
```

---

**That's it! 🎉 Your Wallet Warden is now live.**
