# Advisory System Frontend - GitHub Repository Kurulum Rehberi

## 🎯 GitHub'a Yükleme Adımları

### Yöntem 1: GitHub Desktop ile (Önerilen - Kolay)

1. **GitHub Desktop'ı İndir ve Yükle**
   - https://desktop.github.com/ adresinden indir
   - Kurulumu tamamla ve GitHub hesabınla giriş yap

2. **Yeni Repository Oluştur**
   - GitHub Desktop'ı aç
   - File → Add Local Repository
   - "Choose..." butonuna tıkla
   - Bu klasörü seç: `C:\Users\arda0\OneDrive\Masaüstü\advisorysystemfrontend`
   - "create a repository" linkine tıkla

3. **Repository Bilgilerini Gir**
   - **Name:** `advisorysystemfrontend`
   - **Description:** `Modern academic advisory system frontend built with React and Vite`
   - **Local Path:** (zaten seçili)
   - **Initialize with README:** İŞARETLE (README.md zaten var)
   - **Git Ignore:** Node
   - **License:** MIT
   - "Create Repository" butonuna tıkla

4. **GitHub'a Yükle**
   - "Publish repository" butonuna tıkla
   - Repository adını kontrol et: `advisorysystemfrontend`
   - **Keep this code private** KALDIRIN (public olsun)
   - "Publish Repository" butonuna tıkla

5. **✅ Tamamlandı!**
   - Repository URL'niz: `https://github.com/KULLANICI_ADINIZ/advisorysystemfrontend`

---

### Yöntem 2: Git Command Line ile

1. **Git'i Yükle**
   - https://git-scm.com/download/win adresinden Git'i indir ve yükle
   - Kurulum sırasında tüm varsayılan ayarları kabul et

2. **Terminal/PowerShell'i Aç**
   ```bash
   cd C:\Users\arda0\OneDrive\Masaüstü\advisorysystemfrontend
   ```

3. **Git Repository'yi Başlat**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Advisory System Frontend"
   ```

4. **GitHub'da Yeni Repo Oluştur**
   - https://github.com/new adresine git
   - **Repository name:** `advisorysystemfrontend`
   - **Description:** `Modern academic advisory system frontend built with React and Vite`
   - **Public** seç
   - **Add README, .gitignore, license** EKLEME (zaten var)
   - "Create repository" butonuna tıkla

5. **GitHub'a Bağlan ve Yükle**
   ```bash
   git remote add origin https://github.com/KULLANICI_ADINIZ/advisorysystemfrontend.git
   git branch -M main
   git push -u origin main
   ```

6. **✅ Tamamlandı!**
   - Repository URL'niz: `https://github.com/KULLANICI_ADINIZ/advisorysystemfrontend`

---

### Yöntem 3: GitHub Web Üzerinden

1. **GitHub'a Git**
   - https://github.com/new

2. **Repository Oluştur**
   - **Repository name:** `advisorysystemfrontend`
   - **Description:** `Modern academic advisory system frontend built with React and Vite`
   - **Public** seç
   - "Create repository" tıkla

3. **Dosyaları Upload Et**
   - "uploading an existing file" linkine tıkla
   - Tüm proje klasörünü sürükle-bırak
   - Commit message: `Initial commit: Advisory System Frontend`
   - "Commit changes" tıkla

---

## 📝 Repository Bilgileri

### Repository Adı
```
advisorysystemfrontend
```

### Açıklama (Description)
```
Modern academic advisory system frontend built with React and Vite. Features include document management, version control, comment system, and JWT authentication.
```

### Topics (Etiketler)
GitHub'da repository settings'den ekle:
- `react`
- `vite`
- `javascript`
- `frontend`
- `academic`
- `advisory-system`
- `jwt-authentication`
- `document-management`
- `graduation-project`

### About Bölümü
```
🎓 Academic advisory system frontend with document management, version control, and real-time collaboration
```

---

## 🌐 Repository URL'leri

Oluşturulduktan sonra:

- **HTTPS:** `https://github.com/KULLANICI_ADINIZ/advisorysystemfrontend`
- **Clone:** `git clone https://github.com/KULLANICI_ADINIZ/advisorysystemfrontend.git`
- **Web:** `https://github.com/KULLANICI_ADINIZ/advisorysystemfrontend`

---

## 📄 Dahil Edilecek Dosyalar

✅ Tüm dosyalar `.gitignore` kurallarına göre otomatik filtrelenecek:

**Dahil edilecekler:**
- ✅ `src/` klasörü (tüm kaynak kodlar)
- ✅ `public/` klasörü
- ✅ `index.html`
- ✅ `package.json`
- ✅ `vite.config.js`
- ✅ `README.md`
- ✅ `API_QUICK_REFERENCE.md`
- ✅ `.gitignore`

**Dahil EDİLMEYECEKler:**
- ❌ `node_modules/` (otomatik)
- ❌ `dist/` (otomatik)
- ❌ `.env` dosyaları
- ❌ Log dosyaları

---

## 🎨 GitHub Repository Görünümü

### README.md Önizleme
- ✅ Otomatik olarak güzel görünecek
- ✅ Emoji'ler desteklenir
- ✅ Kod blokları syntax highlighting ile
- ✅ Tablo ve listeler düzgün formatlanmış

### Repository Homepage
```
📚 advisorysystemfrontend
Modern academic advisory system frontend built with React and Vite

⭐ Star this repo if you like it!

📖 Topics: react, vite, javascript, frontend, academic
🌐 Website: [Add your deployed URL]
```

---

## 🚀 Sonraki Adımlar

### 1. README Badge'leri Ekle
README.md'nin başına:
```markdown
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vite](https://img.shields.io/badge/Vite-6.0.3-purple)
![License](https://img.shields.io/badge/License-MIT-green)
```

### 2. GitHub Pages ile Deploy (Opsiyonel)
- Settings → Pages → Source: GitHub Actions
- `.github/workflows/deploy.yml` dosyası ekle

### 3. Collaborators Ekle (Opsiyonel)
- Settings → Collaborators → Add people

### 4. Issues ve Discussions Aç
- Settings → Features → Issues ✅
- Settings → Features → Discussions ✅

---

## 📞 Yardım

### GitHub Desktop Yükleme Sorunu
- Alternatif: Git Bash kullan
- Alternatif: VS Code'un built-in Git kullan

### Push Hatası
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### Authentication Hatası
- GitHub Personal Access Token oluştur
- Settings → Developer settings → Personal access tokens

---

## ✅ Kontrol Listesi

Yüklemeden önce kontrol et:

- [ ] README.md güncellendi ✅
- [ ] .gitignore dosyası var ✅
- [ ] package.json doğru ✅
- [ ] node_modules dahil DEĞİL ✅
- [ ] dist/ klasörü dahil DEĞİL ✅
- [ ] Hassas bilgiler (API keys) yok ✅

---

## 🎓 Sunum İçin

Repository oluşturduktan sonra sunum slaytlarında:

```
🌐 GitHub Repository
https://github.com/KULLANICI_ADINIZ/advisorysystemfrontend

📊 Project Stats
- 8 Pages
- 30+ API Endpoints
- 2500+ Lines of Code
- Full Documentation
```

---

**Hazırlayan:** Advisory System Team  
**Tarih:** Kasım 2024  
**Durum:** ✅ GitHub'a Yükleme Hazır
