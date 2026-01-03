# Danışman Takip Sistemi (Frontend)

Üniversite öğrencileri için danışman-öğrenci ilişkisini yöneten bir web uygulaması.

## Proje Hakkında

Bu proje bitirme projesi kapsamında geliştirilmiştir. React ile yazılmış frontend kısmıdır.

### Ne Yapıyor?

- Öğrenciler ders programlarını görebilir
- Danışmanlar öğrencilerini takip edebilir
- Admin kullanıcılar sistemi yönetebilir
- Belgeler yüklenip paylaşılabilir

## Kurulum

```bash
# Projeyi indir
git clone https://github.com/kullanici/advisorysystemfrontend.git
cd advisorysystemfrontend

# Paketleri yükle
npm install

# Çalıştır
npm run dev
```

Tarayıcıda `http://localhost:5173` adresine git.

## Test Hesapları

| Rol | Email | Şifre |
|-----|-------|-------|
| Öğrenci | stu@local | Arda123! |
| Danışman | advisor@local | Advisor123! |
| Admin | admin@local | Admin123! |

## Kullanılan Teknolojiler

- React 18
- Vite (build tool)
- Axios (API istekleri)
- React Router (sayfa yönlendirme)

## Proje Yapısı

```
src/
├── components/    # Tekrar kullanılan bileşenler
├── pages/         # Sayfalar
├── services/      # API servisleri
└── utils/         # Yardımcı fonksiyonlar
```

## Sayfalar

- **Dashboard** - Ana sayfa, özet bilgiler
- **Ders Programı** - Haftalık program ve ders seçimi
- **Belgeler** - Dosya yükleme ve paylaşım
- **Profil** - Kullanıcı bilgileri
- **İstatistikler** - Grafikler ve raporlar

## API Bağlantısı

Backend API varsayılan olarak `https://localhost:7175` adresinde çalışıyor.
Değiştirmek için `src/services/api.js` dosyasını düzenle.

## Notlar

- Node.js 18+ gerekli
- Backend'in çalışıyor olması lazım
- Chrome veya Firefox önerilir

