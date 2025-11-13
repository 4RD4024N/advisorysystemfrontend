# 🚀 Quick Start Guide - Advisory System Frontend

## ⚡ 5 Dakikada Başla

### 1️⃣ Proje Dosyalarını Al
Repository'yi clone'la veya ZIP indir:
```bash
git clone https://github.com/KULLANICI_ADIN/advisorysystemfrontend.git
cd advisorysystemfrontend
```

### 2️⃣ Bağımlılıkları Yükle
```bash
npm install
```

### 3️⃣ Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

### 4️⃣ Tarayıcıda Aç
```
http://localhost:5173
```

### 5️⃣ Giriş Yap
**Öğrenci hesabı:**
- Email: `stu@local`
- Şifre: `Arda123!`

**Admin hesabı:**
- Email: `admin@local`
- Şifre: `Admin123!`

---

## ✅ Gereksinimler

- ✅ Node.js 18+ 
- ✅ npm veya yarn
- ✅ Modern web browser
- ✅ Backend API çalışıyor olmalı (`https://localhost:7175`)

---

## 📦 Kurulum Detayları

### Node.js Yükleme
1. https://nodejs.org/ adresine git
2. LTS versiyonunu indir
3. Kurulumu tamamla
4. Terminal'de kontrol et:
```bash
node --version
npm --version
```

### Proje Kurulumu
```bash
# 1. Klasöre git
cd advisorysystemfrontend

# 2. Bağımlılıkları yükle
npm install

# 3. Geliştirme modunda çalıştır
npm run dev

# 4. Production build
npm run build

# 5. Production preview
npm run preview
```

---

## 🔧 Yapılandırma

### API URL Değiştirme
`src/services/api.js` dosyasını düzenle:
```javascript
const API_BASE_URL = 'https://localhost:7175/api';
// Değiştir: 'https://api.yourdomain.com/api'
```

### Port Değiştirme
`vite.config.js` dosyasını düzenle:
```javascript
server: {
  port: 5173,  // İstediğin port
}
```

---

## 🎯 Kullanım

### Temel İşlemler

1. **Login**
   - Login sayfasından giriş yap
   - Token otomatik kaydedilir

2. **Döküman Oluştur**
   - Documents sayfasına git
   - "Create Document" butonuna tıkla
   - Bilgileri doldur

3. **Dosya Yükle**
   - Döküman detayına git
   - Dosya seç ve upload et
   - Not ekleyebilirsin

4. **Yorum Ekle**
   - Bir versiyonu seç
   - Comments bölümüne yorum yaz

5. **İstatistikleri Gör**
   - Statistics sayfasına git
   - Tüm istatistikleri gör

---

## 📁 Proje Yapısı (Kısa)

```
src/
├── components/       # Layout, ProtectedRoute
├── pages/           # Login, Dashboard, Documents, vb.
├── services/        # API servisleri
├── App.jsx          # Router
└── index.css        # Global styles
```

---

## 🐛 Sorun Giderme

### Port zaten kullanımda
```bash
# Windows için port'u öldür
netstat -ano | findstr :5173
taskkill /PID [PID_NUMARASI] /F
```

### Module not found
```bash
# node_modules'ı sil ve yeniden yükle
rm -rf node_modules
npm install
```

### API bağlantı hatası
1. Backend'in çalıştığından emin ol
2. CORS ayarlarını kontrol et
3. API URL'ini kontrol et

### Token expired
- Logout yap
- Tekrar login ol
- Token 2 saat geçerli

---

## 📚 Daha Fazla Bilgi

- **Detaylı Dokümantasyon:** [README.md](./README.md)
- **API Referansı:** [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- **Katkı Rehberi:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Değişiklik Geçmişi:** [CHANGELOG.md](./CHANGELOG.md)

---

## 🎨 Özellikler

✅ 8 farklı sayfa  
✅ JWT authentication  
✅ Dosya upload/download  
✅ Versiyon kontrolü  
✅ Yorum sistemi  
✅ İstatistikler  
✅ Gelişmiş arama  
✅ Responsive tasarım  

---

## 💻 Komutlar Özeti

```bash
npm install          # Bağımlılıkları yükle
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Build'i preview et
```

---

## 🌐 Browser Desteği

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

---

## 📞 Yardım

- GitHub Issues
- Documentation files
- Backend API docs: `https://localhost:7175/swagger`

---

**Kolay gelsin! 🚀**
