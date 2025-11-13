# 🎉 Advisory System Frontend - Kurulum Tamamlandı!

## ✅ Neler Yapıldı?

### 1. **API Servisleri Oluşturuldu** 📡

Tüm backend endpoint'leri için basit JavaScript servisleri:

- ✅ `authService.js` - Giriş/Kayıt/Çıkış
- ✅ `documentService.js` - Döküman işlemleri ve dosya yükleme
- ✅ `advisorService.js` - Danışman atamaları
- ✅ `commentService.js` - Yorum işlemleri
- ✅ `submissionService.js` - Teslim işlemleri
- ✅ `statisticsService.js` - İstatistikler
- ✅ `searchService.js` - Arama ve tag'ler
- ✅ `debugService.js` - Geliştirici araçları

### 2. **Otomatik Özellikler** 🤖

- ✅ JWT token otomatik localStorage'da saklanır
- ✅ Her istekte otomatik token eklenir
- ✅ 401 hatalarında otomatik login'e yönlendirilir
- ✅ Dosya yükleme/indirme hazır
- ✅ Hata yönetimi yapılmış

### 3. **Örnek Kodlar** 📚

- ✅ Çalışan örnek component (`ExampleUsage.jsx`)
- ✅ Detaylı README dosyası
- ✅ Hızlı referans kılavuzu (`API_QUICK_REFERENCE.md`)

---

## 🚀 Nasıl Kullanılır?

### Adım 1: Projeyi Başlat
```bash
npm run dev
```

Tarayıcıda otomatik olarak `http://localhost:5173` açılacak.

### Adım 2: Backend'i Çalıştır
Backend'in `https://localhost:7175` adresinde çalıştığından emin ol.

### Adım 3: Örnek Sayfayı Test Et
Açılan sayfada hazır butonlarla API'yi test edebilirsin!

---

## 💻 Kodda Nasıl Kullanılır?

### Basit Örnek - Giriş Yap
```javascript
import { authService } from './services';

// Giriş yap
const { token } = await authService.login({
  email: 'stu@local',
  password: 'Arda123!'
});

console.log('Giriş başarılı!');
```

### Basit Örnek - Dökümanları Getir
```javascript
import { documentService } from './services';

// Dökümanlarımı getir
const documents = await documentService.getMyDocuments();

console.log('Döküman sayısı:', documents.length);
```

### Basit Örnek - Döküman Oluştur
```javascript
import { documentService } from './services';

// Yeni döküman oluştur
const { id } = await documentService.createDocument({
  title: 'Tezim',
  tags: 'araştırma,tez,yazılım'
});

console.log('Döküman ID:', id);
```

### Basit Örnek - Dosya Yükle
```javascript
import { documentService } from './services';

// Dosya yükle
const file = document.querySelector('input[type="file"]').files[0];

const { versionNo } = await documentService.uploadVersion(
  documentId,
  file,
  'İlk taslak'
);

console.log('Versiyon numarası:', versionNo);
```

### Basit Örnek - Dosya İndir
```javascript
import { documentService } from './services';

// Dosyayı indir (tarayıcıda otomatik indirilir)
await documentService.downloadAndSaveFile(
  versionId,
  'tezim.pdf'
);
```

### Basit Örnek - Arama Yap
```javascript
import { searchService } from './services';

// Döküman ara
const results = await searchService.searchDocuments({
  query: 'yapay zeka',
  page: 1,
  pageSize: 10
});

console.log('Toplam sonuç:', results.totalCount);
console.log('Dökümanlar:', results.documents);
```

---

## 📁 Dosya Yapısı

```
src/
├── services/              ← API servisleri burası
│   ├── api.js            ← Axios yapılandırması
│   ├── authService.js    ← Giriş/Çıkış
│   ├── documentService.js ← Dökümanlar
│   ├── commentService.js ← Yorumlar
│   └── ... (diğerleri)
│
├── components/           ← React componentleri buraya
│   └── ExampleUsage.jsx ← Örnek component
│
├── App.jsx              ← Ana component
└── main.jsx             ← Başlangıç noktası
```

---

## 🎯 Tüm Servisler

### 1. authService
```javascript
await authService.login({ email, password })
await authService.register({ email, password, fullName })
authService.logout()
authService.isAuthenticated()
```

### 2. documentService
```javascript
await documentService.getMyDocuments()
await documentService.createDocument({ title, tags })
await documentService.uploadVersion(docId, file, notes)
await documentService.getVersions(docId)
await documentService.downloadAndSaveFile(versionId, fileName)
```

### 3. advisorService
```javascript
await advisorService.getAllAdvisors()
await advisorService.assignAdvisor({ documentId, advisorUserId })
```

### 4. commentService
```javascript
await commentService.getCommentsByVersion(versionId)
await commentService.createComment({ documentVersionId, content })
await commentService.deleteComment(commentId)
```

### 5. submissionService
```javascript
await submissionService.getMySubmissions()
await submissionService.createSubmission({ studentId, dueDate })
await submissionService.updateStatus(submissionId, 'Completed')
```

### 6. statisticsService
```javascript
await statisticsService.getStudentSummary()
await statisticsService.getAdvisorSummary()
await statisticsService.getAdminOverview()
```

### 7. searchService
```javascript
await searchService.searchDocuments({ query, page, pageSize })
await searchService.getPopularTags(10)
```

---

## 🔑 Test Hesapları

| Email | Şifre | Rol |
|-------|-------|-----|
| admin@local | Admin123! | Admin |
| stu@local | Arda123! | Öğrenci |

---

## ⚡ Önemli Notlar

1. **Token Otomatik:** Giriş yaptıktan sonra token otomatik olarak localStorage'a kaydedilir ve her istekte kullanılır.

2. **Hata Yönetimi:** 401 (yetkisiz) hatası alındığında otomatik olarak token silinir ve login sayfasına yönlendirilirsiniz.

3. **Dosya Boyutu:** Maksimum dosya boyutu 100MB.

4. **CORS:** Backend'in `http://localhost:5173` adresine izin verdiğinden emin olun.

---

## 📚 Daha Fazla Bilgi

- `README.md` - Detaylı kullanım kılavuzu
- `API_QUICK_REFERENCE.md` - Hızlı referans ve örnekler
- `src/components/ExampleUsage.jsx` - Çalışan örnek kod

---

## 🎨 React Component Örneği

```javascript
import { useState, useEffect } from 'react';
import { documentService } from './services';

function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await documentService.getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>Dökümanlarım ({documents.length})</h2>
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <p>Etiketler: {doc.tags}</p>
          <p>Versiyon sayısı: {doc.versionCount}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🆘 Sorun mu Yaşıyorsun?

### Backend Bağlantı Hatası
- Backend'in çalıştığından emin ol (`https://localhost:7175`)
- CORS ayarlarını kontrol et

### 401 Unauthorized
- Giriş yaptığından emin ol
- Token'ın süresi dolmuş olabilir (2 saat)

### SSL Sertifika Hatası
- Backend self-signed sertifika kullanıyor
- Tarayıcıda sertifikayı kabul et

---

## 🎉 Hazırsın!

Artık tüm API endpoint'lerini kullanabilirsin. İyi çalışmalar!

```bash
# Başlat
npm run dev
```

**Kolay gelsin! 🚀**
