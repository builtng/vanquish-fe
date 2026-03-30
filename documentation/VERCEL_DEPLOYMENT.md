# Vercel Deployment Guide

Complete guide for deploying the Vanquish Next.js frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Backend API**: Your Laravel backend should be deployed and accessible
4. **Stripe Account**: Production Stripe keys (if using payments)

## Quick Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (root of repository)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_API_URL = https://api.your-domain.com/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_... (your production Stripe key)
   ```
   
   **Important**: 
   - Set these for **Production**, **Preview**, and **Development** environments
   - Replace `https://api.your-domain.com/api` with your actual backend API URL
   - Use production Stripe keys for production, test keys for preview/dev

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Deploy

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   ```
   
   Or add them via the Vercel dashboard.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.vanquish.gen6ixx.com/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_51...` |

### Setting Environment Variables

**Via Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select environments (Production, Preview, Development)
4. Save

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
```

## Configuration Files

### vercel.json

The project includes a `vercel.json` configuration file with:
- Build settings
- Framework detection
- Environment variable references

You can customize this file if needed.

### next.config.mjs

The Next.js configuration includes:
- Image optimization
- Security headers
- Compression
- React strict mode

## Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `vanquish.gen6ixx.com`)

2. **Configure DNS**
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add an A record with Vercel's IP addresses
   - Wait for DNS propagation (can take up to 48 hours)

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS will be enabled automatically

## Backend Configuration

After deploying to Vercel, update your Laravel backend `.env`:

```env
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app,https://your-domain.com
SANCTUM_STATEFUL_DOMAINS=your-project.vercel.app,your-domain.com
```

**Important**: 
- Add your Vercel deployment URL to CORS and Sanctum domains
- Use comma-separated list (no spaces)
- Include both `https://your-project.vercel.app` and your custom domain

## Build Settings

Vercel automatically detects Next.js and uses these settings:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: Auto-detected from `package.json` or `.nvmrc`

### Custom Build Settings

If needed, you can override in Vercel dashboard:
- Project Settings → General → Build & Development Settings

## Deployment Workflow

### Automatic Deployments

- **Production**: Deploys on push to `main` branch
- **Preview**: Creates preview deployments for pull requests
- **Development**: Deploys from other branches

### Manual Deployments

1. **Via Dashboard**
   - Go to Deployments
   - Click "Redeploy" on any deployment

2. **Via CLI**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Build Failures

1. **Check Build Logs**
   - Go to Deployment → View Function Logs
   - Look for error messages

2. **Common Issues**
   - Missing environment variables
   - Build timeout (increase in settings)
   - Node version mismatch
   - Dependency installation failures

3. **Fix Build Issues**
   ```bash
   # Test build locally
   npm run build
   
   # Check for errors
   npm run lint
   ```

### Environment Variable Issues

- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Check that variables are set for the correct environment
- Redeploy after adding/updating variables

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS configuration includes Vercel domain
- Ensure backend is accessible from internet
- Check browser console for CORS errors

### CORS Errors

If you see CORS errors:
1. Add Vercel domain to backend `CORS_ALLOWED_ORIGINS`
2. Add Vercel domain to backend `SANCTUM_STATEFUL_DOMAINS`
3. Redeploy backend
4. Clear browser cache

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Edge Network
- ✅ Automatic HTTPS
- ✅ Image Optimization
- ✅ Automatic Compression

### Additional Optimizations

1. **Enable Analytics**
   - Project Settings → Analytics
   - Enable Web Analytics

2. **Configure Caching**
   - Use Next.js caching strategies
   - Configure `Cache-Control` headers

3. **Monitor Performance**
   - Use Vercel Analytics
   - Check Speed Insights

## Security Checklist

- [ ] Environment variables set securely
- [ ] HTTPS enabled (automatic)
- [ ] API keys not exposed in client code
- [ ] CORS properly configured on backend
- [ ] Security headers configured (in `next.config.mjs`)
- [ ] Regular dependency updates

## Monitoring

### Vercel Analytics

1. Enable in Project Settings → Analytics
2. View metrics:
   - Page views
   - Performance metrics
   - User sessions
   - Geographic distribution

### Error Tracking

Consider integrating:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Vercel Logs**: Built-in logging

## Rollback

If deployment fails:

1. **Via Dashboard**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI**
   ```bash
   vercel rollback [deployment-url]
   ```

## Continuous Deployment

Vercel automatically deploys:
- Every push to `main` → Production
- Every PR → Preview deployment
- Other branches → Preview deployment

To disable auto-deploy:
- Project Settings → Git → Production Branch
- Uncheck "Automatically deploy"

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## Quick Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (production)
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs [deployment-url]

# Add environment variable
vercel env add VARIABLE_NAME production

# Remove environment variable
vercel env rm VARIABLE_NAME production
```

---

**Next Steps:**
1. Deploy to Vercel using the steps above
2. Update backend CORS/Sanctum configuration
3. Test the deployment
4. Set up custom domain (optional)
5. Enable monitoring and analytics

