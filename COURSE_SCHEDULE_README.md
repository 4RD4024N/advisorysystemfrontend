# Ders Programı (Course Schedule) Sistemi

## 📋 Genel Bakış

Ders Programı modülü, öğrencilerin haftalık ders programlarını oluşturmalarına ve yönetmelerine olanak tanır. Danışmanlar ise danışmanlık yaptıkları öğrencilerin ders programlarını görüntüleyebilir.

## ✨ Özellikler

### Öğrenci Özellikleri
- ✅ Haftalık ders programı görüntüleme (Pazartesi-Pazar)
- ✅ Mevcut derslerden seçim yaparak programa ders ekleme
- ✅ Programdan ders çıkarma
- ✅ Ders bilgilerini görüntüleme (Kod, İsim, Teori/Uygulama saatleri, Kredi, AKTS)
- ✅ Toplam istatistikler (Ders sayısı, Kredi, AKTS, Haftalık saat)
- ✅ Önkoşul kontrolü
- ✅ Ders türü gösterimi (Zorunlu, Seçmeli, vb.)

### Danışman Özellikleri
- ✅ Danışmanlık yapılan öğrencilerin listesi
- ✅ Öğrenci ders programlarını görüntüleme
- ✅ Öğrenci istatistiklerini inceleme

## 🎯 Kullanım

### Öğrenci Kullanımı

#### Ders Ekleme
1. Menüden "Ders Programı" sekmesine gidin
2. "+ Ders Ekle" butonuna tıklayın
3. Açılan listeden bir ders seçin
4. Takvimde boş bir zaman dilimi seçin
5. "Ekle" butonuna tıklayın

#### Ders Çıkarma
1. Programdaki bir dersin üzerine gelin
2. Sağ üst köşedeki "×" butonuna tıklayın
3. Onay mesajını kabul edin

### Danışman Kullanımı

1. Menüden "Ders Programı" sekmesine gidin
2. Üst kısımda yer alan dropdown menüden bir öğrenci seçin
3. Öğrencinin ders programını görüntüleyin

## 📊 İstatistikler

Dashboard'da görüntülenen istatistikler:
- **Toplam Ders**: Programdaki ders sayısı
- **Toplam Kredi**: Tüm derslerin toplam kredisi
- **Toplam AKTS**: Tüm derslerin toplam AKTS değeri
- **Haftalık Saat**: Haftalık toplam ders saati

## 🎨 Görünüm

- **Haftalık Takvim**: 7 gün × 11 saat (08:00-18:00)
- **Renk Kodları**: Her ders için farklı renk
- **Responsive Tasarım**: Mobil uyumlu

## 🔧 Teknik Detaylar

### Dosyalar
- `src/pages/CourseSchedule.jsx` - Ana sayfa bileşeni
- `src/pages/CourseSchedule.css` - Stil dosyası
- `src/services/courseScheduleService.js` - Backend API servisi

### Backend Endpoints (Planlanmış)
```
GET    /api/schedules/my-schedule           - Öğrenci programını getir
GET    /api/schedules/{studentId}           - Belirli öğrenci programını getir
GET    /api/courses/available                - Mevcut dersleri listele
POST   /api/schedules                        - Programa ders ekle
DELETE /api/schedules/{scheduleId}           - Programdan ders sil
GET    /api/schedules/advisor/students       - Danışman öğrenci listesi
GET    /api/schedules/my-statistics          - İstatistikler
POST   /api/courses/{courseId}/validate      - Ders uygunluk kontrolü
```

### Veri Yapısı

#### Ders Bilgisi
```javascript
{
  code: 'BİL101',
  name: 'BİLGİSAYAR YAZILIMI I',
  theory: 3,        // Teorik ders saati
  practice: 1,      // Uygulama ders saati
  credit: 3,        // Kredi
  ects: 5,          // AKTS
  semester: 1,      // Dönem
  type: 'Zorunlu',  // Ders türü
  prerequisite: 'BİL100' // Önkoşul (opsiyonel)
}
```

#### Program Verisi
```javascript
{
  monday: {
    '09:00': {
      code: 'BİL101',
      name: 'BİLGİSAYAR YAZILIMI I',
      duration: 4,    // Toplam süre (theory + practice)
      credit: 3,
      ects: 5
    }
  },
  // ...diğer günler
}
```

## 🚀 Gelecek Özellikler

- [ ] Çakışma kontrolü (Aynı saatte birden fazla ders eklemeyi engelleme)
- [ ] PDF/Excel olarak dışa aktarma
- [ ] Ders önkoşul doğrulama
- [ ] Sürükle-bırak ile ders taşıma
- [ ] Ders notları ve açıklamaları
- [ ] Farklı görünüm modları (Günlük, Haftalık)
- [ ] Ders arama ve filtreleme
- [ ] Program şablonları (Hazır programlar)

## 📝 Notlar

- Şu anda örnek ders verileri kullanılmaktadır
- Backend entegrasyonu için `courseScheduleService.js` hazır
- Ders listesi veritabanından güncellenmelidir
- Önkoşul kontrolü backend tarafında yapılmalıdır

## 🎓 Ders Türleri

1. **Zorunlu Dersler**: Üniversite geneli zorunlu dersler
2. **Yarıyıl Dersleri**: 1-8. yarıyıl dersleri
3. **Teknik Seçmeli**: Teknik seçmeli ders havuzu
4. **Sosyal Seçmeli**: Sosyal seçmeli ders havuzu
5. **Ortak Seçmeli**: Güzel sanatlar ve diğer seçmeli dersler

## 🔐 Yetkilendirme

- **Öğrenci**: Sadece kendi programını görebilir ve düzenleyebilir
- **Danışman**: Kendi öğrencilerinin programlarını görüntüleyebilir
- **Admin**: Tüm öğrencilerin programlarını görüntüleyebilir
