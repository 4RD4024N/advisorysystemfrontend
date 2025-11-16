# 🌐 Deployment Guide

Deploy your Advisory System Frontend to Azure hosting platform.

## 📋 Table of Contents
- [Azure Static Web Apps (Recommended)](#azure-static-web-apps)
- [Azure App Service](#azure-app-service)
- [Azure Storage Static Website](#azure-storage-static-website)
- [Docker on Azure](#docker-on-azure)
- [Environment Variables](#environment-variables)

---

## 🔵 Azure Static Web Apps (Recommended)

### Why Azure Static Web Apps?
- ✅ Free tier available
- ✅ Integrated with GitHub/Azure DevOps
- ✅ Automatic deployments
- ✅ Free SSL certificates
- ✅ Global CDN
- ✅ Serverless API support
- ✅ Custom domains
- ✅ Staging environments
- ✅ Easy integration with Azure services

### Prerequisites
- Azure account (free tier available)
- GitHub repository
- Azure CLI (optional)

### Method 1: Azure Portal (Easiest)

1. **Create Static Web App**
   - Go to https://portal.azure.com
   - Click "Create a resource"
   - Search for "Static Web Apps"
   - Click "Create"

2. **Configure Basics**
   ```
   Subscription: Your subscription
   Resource Group: Create new "advisory-system-rg"
   Name: advisorysystemfrontend
   Plan type: Free
   Region: West Europe (or closest to you)
   ```

3. **Deployment Details**
   ```
   Source: GitHub
   Organization: Your GitHub username
   Repository: advisorysystemfrontend
   Branch: main
   ```

4. **Build Details**
   ```
   Build Presets: React
   App location: /
   Api location: (leave empty)
   Output location: dist
   ```

5. **Review + Create**
   - Click "Review + create"
   - Click "Create"
   - Wait for deployment (~2 minutes)

6. **Result**
   ```
   🌐 Live URL: https://advisorysystemfrontend.azurestaticapps.net
   ```

### Method 2: Azure CLI

1. **Install Azure CLI**
   ```bash
   # Windows
   winget install -e --id Microsoft.AzureCLI
   
   # Or download from: https://aka.ms/installazurecliwindows
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Install Static Web Apps Extension**
   ```bash
   az extension add --name staticwebapp
   ```

4. **Create Static Web App**
   ```bash
   az staticwebapp create \
     --name advisorysystemfrontend \
     --resource-group advisory-system-rg \
     --source https://github.com/YOUR_USERNAME/advisorysystemfrontend \
     --location "westeurope" \
     --branch main \
     --app-location "/" \
     --output-location "dist" \
     --login-with-github
   ```

### Method 3: VS Code Extension

1. **Install Azure Static Web Apps Extension**
   - Open VS Code
   - Extensions → Search "Azure Static Web Apps"
   - Install the extension

2. **Deploy**
   - Open your project
   - Click Azure icon in sidebar
   - Sign in to Azure
   - Right-click "Static Web Apps" → "Create Static Web App"
   - Follow the prompts

### Environment Variables in Azure

1. **Add in Portal**
   - Go to your Static Web App
   - Settings → Configuration
   - Click "Add"
   - Add variables:
   ```
   Name: VITE_API_URL
   Value: https://your-backend.azurewebsites.net/api
   ```

2. **Add via CLI**
   ```bash
   az staticwebapp appsettings set \
     --name advisorysystemfrontend \
     --setting-names VITE_API_URL=https://your-backend.azurewebsites.net/api
   ```

### Custom Domain on Azure

1. **Add Custom Domain**
   - Settings → Custom domains
   - Click "Add"
   - Enter domain: `advisory.yourdomain.com`
   
2. **Update DNS**
   - Add CNAME record:
   ```
   Name: advisory
   Value: advisorysystemfrontend.azurestaticapps.net
   TTL: 3600
   ```

3. **Validate**
   - Click "Validate" in Azure Portal
   - SSL certificate automatically provisioned

### Staging Environments

Azure automatically creates staging URLs for pull requests:
```
🌐 Production: https://advisorysystemfrontend.azurestaticapps.net
🌐 PR #1: https://advisorysystemfrontend-pr1.azurestaticapps.net
```

### GitHub Actions Workflow

Azure automatically creates `.github/workflows/azure-static-web-apps-xxx.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### Result URLs
```
🌐 Production: https://advisorysystemfrontend.azurestaticapps.net
🌐 Custom: https://advisory.yourdomain.com
📊 Azure Portal: https://portal.azure.com
```

---

## 🟦 Azure App Service

### For more control and server-side features

1. **Create App Service**
   ```bash
   # Create resource group
   az group create --name advisory-system-rg --location westeurope
   
   # Create App Service plan
   az appservice plan create \
     --name advisory-plan \
     --resource-group advisory-system-rg \
     --sku F1 \
     --is-linux
   
   # Create Web App
   az webapp create \
     --name advisorysystemfrontend \
     --resource-group advisory-system-rg \
     --plan advisory-plan \
     --runtime "NODE|18-lts"
   ```

2. **Configure Deployment**
   ```bash
   # Configure GitHub deployment
   az webapp deployment source config \
     --name advisorysystemfrontend \
     --resource-group advisory-system-rg \
     --repo-url https://github.com/YOUR_USERNAME/advisorysystemfrontend \
     --branch main \
     --manual-integration
   ```

3. **Set Build Configuration**
   - Portal → Configuration → Application settings
   - Add:
   ```
   WEBSITE_NODE_DEFAULT_VERSION: 18-lts
   SCM_DO_BUILD_DURING_DEPLOYMENT: true
   ```

4. **Add Startup Command**
   - Configuration → General settings
   - Startup Command:
   ```bash
   pm2 serve /home/site/wwwroot/dist --no-daemon --spa
   ```

### Result
```
🌐 Live URL: https://advisorysystemfrontend.azurewebsites.net
```

---

## 💾 Azure Storage Static Website

### Ultra-cheap option for static sites

1. **Create Storage Account**
   ```bash
   # Create storage account
   az storage account create \
     --name advisorystorage123 \
     --resource-group advisory-system-rg \
     --location westeurope \
     --sku Standard_LRS \
     --kind StorageV2
   
   # Enable static website
   az storage blob service-properties update \
     --account-name advisorystorage123 \
     --static-website \
     --404-document index.html \
     --index-document index.html
   ```

2. **Build and Upload**
   ```bash
   # Build project
   npm run build
   
   # Upload to blob storage
   az storage blob upload-batch \
     --account-name advisorystorage123 \
     --source ./dist \
     --destination '$web'
   ```

3. **Get URL**
   ```bash
   az storage account show \
     --name advisorystorage123 \
     --resource-group advisory-system-rg \
     --query "primaryEndpoints.web" \
     --output tsv
   ```

4. **Setup Azure CDN (Optional)**
   - For better performance
   - Custom domain support
   - HTTPS

### Result
```
🌐 Live URL: https://advisorystorage123.z6.web.core.windows.net
```

---

## 🐳 Docker on Azure

### Deploy containerized app

1. **Create Dockerfile** (already provided in project)

2. **Build and Push to Azure Container Registry**
   ```bash
   # Create ACR
   az acr create \
     --name advisoryacr \
     --resource-group advisory-system-rg \
     --sku Basic
   
   # Login to ACR
   az acr login --name advisoryacr
   
   # Build and push
   az acr build \
     --registry advisoryacr \
     --image advisorysystemfrontend:latest \
     .
   ```

3. **Deploy to Azure Container Instances**
   ```bash
   az container create \
     --name advisorysystemfrontend \
     --resource-group advisory-system-rg \
     --image advisoryacr.azurecr.io/advisorysystemfrontend:latest \
     --dns-name-label advisorysystemfrontend \
     --ports 80 \
     --registry-username $(az acr credential show --name advisoryacr --query username -o tsv) \
     --registry-password $(az acr credential show --name advisoryacr --query passwords[0].value -o tsv)
   ```

### Result
```
🌐 Live URL: http://advisorysystemfrontend.westeurope.azurecontainer.io
```

---

## 🔐 Environment Variables

### Required Variables

Create `.env.production`:
```bash
VITE_API_URL=https://your-backend.azurewebsites.net/api
```

### Azure Static Web Apps Configuration

Add in Azure Portal (Settings → Configuration):
```
VITE_API_URL=https://your-backend.azurewebsites.net/api
```

### Azure App Service Configuration

Add in Portal (Configuration → Application settings):
```
VITE_API_URL=https://your-backend.azurewebsites.net/api
```

---

## 📊 Deployment Comparison

| Platform | Free Tier | Custom Domain | SSL | Auto Deploy | Azure Integration |
|----------|-----------|---------------|-----|-------------|-------------------|
| Azure Static Web Apps | ✅ Yes | ✅ Yes | ✅ | ✅ Yes | ⭐⭐⭐ |
| Azure App Service | ⚠️ Limited | ✅ Yes | ✅ | ✅ Yes | ⭐⭐⭐ |
| Azure Storage | ✅ Yes | ⚠️ Requires CDN | ⚠️ Requires CDN | ⚠️ Manual | ⭐⭐ |
| Azure Container Instances | 💰 Pay per use | ✅ Yes | ⚠️ Manual | ⚠️ Manual | ⭐⭐ |

---

## 🎯 Recommended: Azure Static Web Apps

For this project, **Azure Static Web Apps** is recommended because:
1. ✅ **Free tier** - 100 GB bandwidth/month
2. ✅ **GitHub integration** - Automatic deployments
3. ✅ **Global CDN** - Fast worldwide
4. ✅ **Custom domains** - Free SSL certificates
5. ✅ **Staging environments** - PR preview deployments
6. ✅ **Azure ecosystem** - Easy backend integration
7. ✅ **Enterprise ready** - Production-grade infrastructure
8. ✅ **Perfect for Vite** - Built-in support

---

## 🔄 CI/CD with Azure

### GitHub Actions (Auto-generated by Azure)

Azure Static Web Apps automatically creates a workflow file when you deploy.

The workflow is located at: `.github/workflows/azure-static-web-apps-xxx.yml`

This workflow:
- ✅ Triggers on push to main branch
- ✅ Builds the application
- ✅ Deploys to Azure
- ✅ Creates preview environments for PRs
- ✅ Closes preview environments when PR is merged

### Manual CI/CD Setup

If you want to customize, create `.github/workflows/azure-deploy.yml`:
```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/"
        output_location: "dist"
```

### Azure DevOps Pipeline (Alternative)

Create `azure-pipelines.yml`:
```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm ci
    npm run build
  displayName: 'npm install and build'

- task: AzureStaticWebApp@0
  inputs:
    app_location: '/'
    output_location: 'dist'
    azure_static_web_apps_api_token: $(deployment_token)
```

---

## 🐛 Common Issues

### Azure Static Web Apps Issues

**Build Fails:**
```bash
# Check build logs in Azure Portal
# Common fix: Update package.json engines
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

**API CORS Error:**
- Configure backend CORS to allow Azure domain
- Add `*.azurestaticapps.net` to backend allowed origins
- For .NET backend:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AzurePolicy", policy =>
    {
        policy.WithOrigins(
            "https://advisorysystemfrontend.azurestaticapps.net",
            "https://localhost:5173"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
```

**Environment Variables Not Working:**
- Prefix must be `VITE_`
- Restart deployment after adding variables
- Wait ~5 minutes for propagation

**404 on Refresh (SPA Routing):**
Azure Static Web Apps handles this automatically, but if issues persist:
- Create `staticwebapp.config.json`:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{css,scss,js,png,gif,ico,jpg,svg}"]
  }
}
```

**Deployment Token Issues:**
```bash
# Get new deployment token
az staticwebapp secrets list \
  --name advisorysystemfrontend \
  --query "properties.apiKey"
```

**Slow First Load:**
- Azure CDN warming up
- Usually improves after first few requests
- Consider Azure CDN Premium for better performance

---

## 🌐 Example URLs

After deployment, your app will be available at:

**Azure Static Web Apps (Primary):**
```
Production: https://advisorysystemfrontend.azurestaticapps.net
PR Preview: https://advisorysystemfrontend-pr1.azurestaticapps.net
Custom: https://advisory.yourdomain.com
```

**Azure App Service:**
```
Production: https://advisorysystemfrontend.azurewebsites.net
Staging: https://advisorysystemfrontend-staging.azurewebsites.net
```

**Azure Storage:**
```
Static Website: https://advisorystorage123.z6.web.core.windows.net
With CDN: https://advisory-cdn.azureedge.net
```

**Azure Container Instances:**
```
Container: http://advisorysystemfrontend.westeurope.azurecontainer.io
```

---

## 🔍 Monitoring & Analytics

### Azure Application Insights

1. **Enable in Azure Portal**
   - Go to your Static Web App
   - Settings → Application Insights
   - Click "Enable"

2. **View Metrics**
   - Page views
   - User sessions
   - Performance metrics
   - Error tracking

3. **Add Custom Tracking**
   ```javascript
   // src/services/analytics.js
   import { ApplicationInsights } from '@microsoft/applicationinsights-web';

   const appInsights = new ApplicationInsights({
     config: {
       connectionString: 'your-connection-string'
     }
   });
   appInsights.loadAppInsights();
   appInsights.trackPageView();
   ```

---

## 💡 Tips

1. **Use Azure CLI for automation**
   - Faster than portal for repeated tasks
   - Great for CI/CD pipelines

2. **Enable monitoring from day 1**
   - Application Insights is free tier
   - Helps catch issues early

3. **Use staging environments**
   - Test changes before production
   - PR preview URLs are perfect for this

4. **Keep secrets in Azure Key Vault**
   - More secure than app settings
   - Easy integration with Static Web Apps

5. **Use Azure CDN for better performance**
   - Caches static content globally
   - Reduces load times worldwide

---

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Azure for Students](https://azure.microsoft.com/free/students/)
- [Azure DevOps](https://dev.azure.com/)

---

## 💰 Pricing

### Free Tier Includes:
```
✅ 100 GB bandwidth/month
✅ Unlimited sites
✅ Free SSL certificates
✅ Custom domains
✅ Staging environments
✅ GitHub Actions CI/CD
✅ Global CDN
```

### After Free Tier:
```
Bandwidth: $0.20/GB
Standard plan: $9/month (500 GB included)
```

**Note:** Most graduation projects stay well within free tier limits.

---

## ✅ Deployment Checklist

Before deploying:
- [ ] GitHub repository created
- [ ] All code pushed to main branch
- [ ] Azure account created
- [ ] Backend API URL ready
- [ ] Environment variables identified

After deploying:
- [ ] Site loads correctly
- [ ] Login works
- [ ] API connection established
- [ ] File upload/download works
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Environment variables set
- [ ] Monitoring enabled

---

## 🎉 Success!

Your Advisory System Frontend is now deployed on Microsoft Azure! 🚀

**Live URL:**
```
https://advisorysystemfrontend.azurestaticapps.net
```

For Turkish quick-start guide, see: [AZURE_DEPLOYMENT_TR.md](AZURE_DEPLOYMENT_TR.md)
