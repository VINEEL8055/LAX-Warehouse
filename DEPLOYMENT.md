# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Your Supabase credentials

## Step 1: Prepare Your Code

✅ Already done in this project:
- Environment variables configured
- `.env.example` created with required variables
- `.env.local` created for local development
- `.gitignore` configured to ignore `.env.local`

## Step 2: Push to GitHub

```bash
cd /Users/vineelrayapati/LAX\ Warehouse

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "LAX Warehouse - Ready for Vercel deployment"

# Create GitHub repo and push
# (Visit github.com/new to create a new repository)
git remote add origin https://github.com/YOUR_USERNAME/LAX-Warehouse.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. **Visit**: https://vercel.com
2. **Sign up/Login** with GitHub account
3. **Click "Add New Project"**
4. **Select your GitHub repository** (`LAX-Warehouse`)
5. **Configure Project**:
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Environment Variables: **ADD THESE**

## Step 4: Set Environment Variables in Vercel

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```
VITE_SUPABASE_URL = https://phrzbqzrlrykcpycajhp.supabase.co
VITE_SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Copy from your Supabase project settings)

## Step 5: Deploy!

Click **"Deploy"** → Wait 2-3 minutes → Your app goes live! 🚀

## Your Live URL

Once deployed, Vercel will provide a URL like:
```
https://lax-warehouse-xxx.vercel.app
```

## Automatic Deployments

- Every push to `main` branch automatically redeploys
- Preview deployments for pull requests
- Instant rollback to previous versions

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Build fails with "Cannot find module"
- Run `npm install` locally
- Push to GitHub and redeploy

### Supabase errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in Vercel Settings
- Check Supabase CORS settings allow your Vercel domain

### 3D warehouse not loading
- Check browser console for errors
- Verify `warehouse-3d.html` path in production

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
- Supabase Docs: https://supabase.com/docs
