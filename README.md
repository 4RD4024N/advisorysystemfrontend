# Advisory System Frontend

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0.3-646CFF?logo=vite)
![Azure](https://img.shields.io/badge/Azure-Static%20Web%20Apps-0078D4?logo=microsoft-azure)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

Modern academic advisory system frontend built with React and Vite. Designed for deployment on Microsoft Azure with automatic CI/CD integration.

## ✨ Features

- 🔐 **JWT Authentication** - Secure login/register with token-based auth
- 📄 **Document Management** - Version control, file upload/download
- 👥 **Advisor System** - Assign and manage student advisors
- 💬 **Comments** - Discussion threads on documents
- 📊 **Statistics Dashboard** - Visual analytics and metrics
- 🔍 **Smart Search** - Document search with popular tags
- 📱 **Responsive Design** - Mobile-first UI with modern CSS
- 🌐 **Azure Ready** - Optimized for Azure Static Web Apps deployment

## 🚀 Tech Stack

- **Frontend:** React 18.3.1, React Router DOM 7.1.1
- **Build Tool:** Vite 6.0.3
- **HTTP Client:** Axios 1.7.9
- **Styling:** CSS3 (Variables, Flexbox, Grid)
- **Deployment:** Azure Static Web Apps
- **CI/CD:** GitHub Actions

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/advisorysystemfrontend.git
cd advisorysystemfrontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## 🌐 Deployment on Azure

This project is designed to be deployed on **Microsoft Azure Static Web Apps**:

### Quick Deploy with Azure Portal
1. Go to https://portal.azure.com
2. Create a resource → Static Web Apps
3. Connect your GitHub repository
4. Deploy automatically with CI/CD

### Quick Deploy with Azure CLI
```bash
az staticwebapp create \
  --name advisorysystemfrontend \
  --resource-group advisory-system-rg \
  --source https://github.com/YOUR_USERNAME/advisorysystemfrontend \
  --location "westeurope" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

**📚 Detailed Deployment Guides:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete Azure deployment guide (English)
- [AZURE_DEPLOYMENT_TR.md](AZURE_DEPLOYMENT_TR.md) - Azure quick-start (Turkish)

## 📖 Documentation

- [Quick Start Guide](QUICKSTART.md) - 5-minute setup guide
- [API Reference](API_QUICK_REFERENCE.md) - Backend API documentation
- [Azure Deployment](DEPLOYMENT.md) - Complete deployment guide
- [Azure Quick Start (Turkish)](AZURE_DEPLOYMENT_TR.md) - Turkish deployment guide
- [GitHub Setup (Turkish)](GITHUB_KURULUM.md) - GitHub repository setup
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Changelog](CHANGELOG.md) - Version history

## 🏗️ Project Structure

```
advisorysystemfrontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.jsx     # Main layout with sidebar
│   │   └── ProtectedRoute.jsx  # Auth guard
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Documents.jsx
│   │   └── ...
│   ├── services/          # API service layer
│   │   ├── api.js         # Axios configuration
│   │   ├── authService.js
│   │   ├── documentService.js
│   │   └── ...
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── staticwebapp.config.json  # Azure SWA configuration
└── vite.config.js         # Vite configuration
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for development:
```bash
VITE_API_URL=http://localhost:5000/api
```

For production (Azure), set in Azure Portal:
```
Name: VITE_API_URL
Value: https://your-backend.azurewebsites.net/api
```

### Azure Configuration

The project includes `staticwebapp.config.json` for Azure Static Web Apps:
- SPA routing fallback to `/index.html`
- Cache control headers
- MIME type configuration
- Route protection ready

## 🧪 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### CORS Issues
Configure your backend to allow Azure domain:
```csharp
// .NET backend
builder.Services.AddCors(options => {
    options.AddPolicy("AzurePolicy", policy => {
        policy.WithOrigins(
            "https://advisorysystemfrontend.azurestaticapps.net",
            "http://localhost:5173"
        );
    });
});
```

### Build Fails on Azure
Check `package.json` has correct Node version:
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### 404 on Page Refresh
Azure Static Web Apps handles this automatically via `staticwebapp.config.json`

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting tips.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🔗 Links

- **Live Demo:** https://advisorysystemfrontend.azurestaticapps.net
- **Backend API:** .NET 8.0 Web API with Entity Framework Core
- **Documentation:** See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guides

## 🎓 Academic Project

This is a graduation project for academic advisory system management. Built with modern web technologies and deployed on Microsoft Azure cloud platform.

---

Made with ❤️ using React, Vite, and Azure

