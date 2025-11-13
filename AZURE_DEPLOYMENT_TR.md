# 🔵 Azure Deployment - Hızlı Başlangıç

## 🎯 En Kolay Yöntem: Azure Static Web Apps

### 1️⃣ Azure Hesabı Oluştur
- https://azure.microsoft.com/free/ adresine git
- "Ücretsiz başla" butonuna tıkla
- Microsoft hesabınla giriş yap
- Kredi kartı iste (ama ücretsiz tier'da ücret yok)

### 2️⃣ GitHub'a Proje Yükle
- Eğer henüz yüklemediysen GITHUB_KURULUM.md'yi takip et
- Repository: `advisorysystemfrontend`

### 3️⃣ Azure Portal'dan Deploy Et

1. **Azure Portal'a Git**
   ```
   https://portal.azure.com
   ```

2. **Static Web App Oluştur**
   - Sol menüden "+ Create a resource" tıkla
   - "Static Web Apps" ara
   - "Create" butonuna tıkla

3. **Ayarları Yapılandır**
   ```
   Abonelik: Ücretsiz deneme aboneliğiniz
   Kaynak Grubu: Yeni oluştur → "advisory-system-rg"
   Ad: advisorysystemfrontend
   Plan türü: Free (ücretsiz)
   Bölge: West Europe
   ```

4. **GitHub Bağlantısı**
   ```
   Kaynak: GitHub
   GitHub hesabı: Authorize butonuna tıkla
   Organizasyon: Kullanıcı adınız
   Repository: advisorysystemfrontend
   Branch: main
   ```

5. **Build Ayarları**
   ```
   Build Presets: React
   App location: /
   Api location: (boş bırak)
   Output location: dist
   ```

6. **Oluştur**
   - "Review + create" tıkla
   - "Create" butonuna tıkla
   - 2-3 dakika bekle

7. **✅ Tamamlandı!**
   ```
   URL: https://advisorysystemfrontend.azurestaticapps.net
   ```

---

## 🔧 Environment Variables Ekleme

### Backend API URL'ini Ayarla

1. **Azure Portal'da Static Web App'i Aç**
2. **Settings → Configuration** git
3. **"Add" butonuna tıkla**
4. **Değerleri Gir:**
   ```
   Name: VITE_API_URL
   Value: https://your-backend.azurewebsites.net/api
   ```
5. **Save** tıkla
6. **5 dakika bekle** (yayılması için)

---

## 🌐 Custom Domain Ekleme

### Kendi Domain'inizi Bağlayın

1. **Azure Portal'da Custom domains** git
2. **"Add" butonuna tıkla**
3. **Domain gir:** `advisory.yourdomain.com`
4. **DNS ayarlarına git** (domain sağlayıcınızda)
5. **CNAME kaydı ekle:**
   ```
   Tip: CNAME
   Ad: advisory
   Değer: advisorysystemfrontend.azurestaticapps.net
   TTL: 3600
   ```
6. **Azure'da "Validate" tıkla**
7. **SSL otomatik oluşturulur** (10-15 dakika)

---

## 📊 Deployment Sonrası

### URL'leriniz:
```
🌐 Production: https://advisorysystemfrontend.azurestaticapps.net
🔧 Azure Portal: https://portal.azure.com
📊 Monitoring: Portal → your app → Monitoring
```

### Otomatik Olarak:
✅ Her GitHub push'da otomatik deploy  
✅ Pull request'ler için preview URL  
✅ SSL sertifikası (HTTPS)  
✅ Global CDN  
✅ Ücretsiz 100GB bandwidth/ay  

---

## 🔄 Güncelleme Yapmak

### Sadece GitHub'a Push At!

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Azure otomatik olarak:
1. Değişiklikleri algılar
2. Build yapar
3. Deploy eder
4. ~2 dakikada canlıya alır

---

## 💰 Maliyet

### Free Tier Limitleri:
```
✅ 100 GB bandwidth / ay
✅ Sınırsız deployment
✅ Sınırsız preview environment
✅ SSL sertifikası
✅ Custom domain
✅ GitHub Actions dakikaları
```

**Limit aşarsan:** Otomatik ücretlendirme başlar (çok ucuz)

**Öğrenci iseniz:** Azure for Students ile $100 kredi  
https://azure.microsoft.com/free/students/

---

## 🎓 Sunum İçin Bilgiler

### Deployment Bilgileri:
```
Platform: Microsoft Azure
Servis: Azure Static Web Apps
Region: West Europe
CI/CD: GitHub Actions
Build Time: ~2 dakika
Global CDN: ✅
SSL: ✅ Ücretsiz
Auto Deploy: ✅
```

### Avantajları:
```
✅ Microsoft'un bulut altyapısı
✅ Enterprise-grade güvenlik
✅ Otomatik ölçeklendirme
✅ 99.95% uptime SLA
✅ Global CDN (hızlı erişim)
✅ Ücretsiz SSL
✅ Kolay backend entegrasyonu
```

---

## 📸 Screenshot Almayı Unutma!

Azure Portal'dan:
- [ ] Static Web App overview sayfası
- [ ] Deployment history
- [ ] Configuration sayfası
- [ ] Custom domains
- [ ] Metrics/monitoring

Canlı siteden:
- [ ] Homepage
- [ ] Login sayfası
- [ ] Dashboard

---

## ⚙️ Azure CLI ile (Alternatif)

### Windows'ta Kurulum:
```bash
winget install -e --id Microsoft.AzureCLI
```

### Deploy Komutları:
```bash
# Login
az login

# Static Web App oluştur
az staticwebapp create \
  --name advisorysystemfrontend \
  --resource-group advisory-system-rg \
  --source https://github.com/KULLANICI_ADIN/advisorysystemfrontend \
  --location "westeurope" \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

---

## 🐛 Sorun mu Yaşıyorsun?

### Build Hatası
- Azure Portal → Deployment History'den log'ları kontrol et
- package.json'da engines ekle:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

### CORS Hatası
- Backend'de Azure domain'i whiteliste ekle:
  ```
  https://advisorysystemfrontend.azurestaticapps.net
  ```

### 404 Hatası
- `staticwebapp.config.json` dosyası proje root'da olmalı
- GitHub'a push et, tekrar deploy olur

---

## 📞 Yardım

**Azure Dokümantasyon:**  
https://docs.microsoft.com/azure/static-web-apps/

**Azure Support:**  
Portal'dan "Help + support" → "New support request"

**Community:**  
https://stackoverflow.com/questions/tagged/azure-static-web-apps

---

## ✅ Kontrol Listesi

Deploy ettikten sonra:

- [ ] Site açılıyor mu? (URL'i kontrol et)
- [ ] Login çalışıyor mu?
- [ ] API bağlantısı var mı?
- [ ] Dosya upload/download çalışıyor mu?
- [ ] Tüm sayfalar açılıyor mu?
- [ ] Mobile responsive mi?
- [ ] SSL aktif mi? (HTTPS)
- [ ] Custom domain bağlandı mı? (opsiyonel)
- [ ] Environment variables set edildi mi?
- [ ] Otomatik deployment çalışıyor mu?

---

## 🎉 Başarılar!

Artık projen Azure'da canlı! 🚀

**Live URL'ni sunumda kullan:**
```
https://advisorysystemfrontend.azurestaticapps.net
```

**Profesyonel görünüm için:**
- Custom domain ekle
- Monitoring'i aç
- Analytics ekle (Azure Application Insights)

**Kolay gelsin! 💙**
