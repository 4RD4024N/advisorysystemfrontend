# Ders Programı (Course Schedule) Sistemi

## 📋 Genel Bakış

Ders Programı modülü, öğrencilerin haftalık ders programlarını oluşturmalarına ve yönetmelerine olanak tanır. Danışmanlar ise danışmanlık yaptıkları öğrencilerin ders programlarını görüntüleyebilir.

## ✨ Özellikler

### Öğrenci Özellikleri
- ✅ Haftalık ders programı görüntüleme (Pazartesi-Pazar)
- ✅ **Önceden tanımlı saatlerle ders ekleme**: Her dersin saati önceden belirlenmiştir
- ✅ **Tek seferlik ekleme**: Her ders sadece BİR KERE eklenebilir, tüm oturumlar otomatik eklenir
- ✅ **Çakışma kontrolü**: Aynı saatte birden fazla ders eklenemez
- ✅ **Otomatik ders bölme**: Backend'de 4+ saatlik dersler oturumlara bölünmüştür
  - 4 saat → 2 + 2 saat (farklı günler)
  - 5 saat → 3 + 2 saat (farklı günler)
- ✅ **Akıllı ders görüntüleme**: Zaten eklenmiş dersler yeşil ile işaretlenir
- ✅ Programdan ders çıkarma (tüm oturumlar birlikte silinir)
- ✅ Ders bilgilerini görüntüleme (Kod, İsim, Teori/Uygulama saatleri, Kredi, AKTS)
- ✅ **Akıllı istatistikler**: Aynı dersin birden fazla oturumu tek ders olarak sayılır
- ✅ **Ders saatleri önizleme**: Modal'da dersin hangi günlerde olduğu gösterilir
- ✅ Önkoşul bilgisi gösterimi
- ✅ Ders türü gösterimi (Zorunlu, Seçmeli, vb.)
- ✅ **Çakışma uyarıları**: Modal'da çakışan dersler kırmızı gösterilir

### Danışman Özellikleri
- ✅ Danışmanlık yapılan öğrencilerin listesi
- ✅ Öğrenci ders programlarını görüntüleme
- ✅ Öğrenci istatistiklerini inceleme

## 🎯 Kullanım

### Öğrenci Kullanımı

#### Ders Ekleme
1. Menüden "Ders Programı" sekmesine gidin
2. **"+ Ders Ekle"** butonuna tıklayın
3. Açılan modal'da ders listesini inceleyin
4. **Her dersin saatleri önceden belirlenmiştir** - Modal'da ders saatleri görüntülenir
5. Bir ders seçtiğinizde:
   - **Çakışma kontrolü**: Çakışan dersler kırmızı gösterilir ve seçilemez
   - **Zaten eklenmiş**: Programda olan dersler yeşil ile işaretlenir
   - **Otomatik ekleme**: Dersin TÜM oturumları (örn: 2+2 saat) otomatik eklenir
6. Derse tıklayın - programa otomatik olarak eklenir
7. **Her ders sadece bir kere eklenebilir**

#### Ders Çıkarma
1. Programdaki bir dersin üzerine gelin
2. Sağ üst köşedeki "×" butonuna tıklayın
3. Onay verin - **Dersin TÜM oturumları** programdan kaldırılır

#### Ders Saatleri
- Her ders önceden belirlenmiş saatlere sahiptir
- Örnek: **BİL101** → Pazartesi 09:00 (2 saat) + Perşembe 09:00 (2 saat)
- Siz sadece dersi seçersiniz, saatler otomatik yerleşir

### Danışman Kullanımı

1. Menüden "Ders Programı" sekmesine gidin
2. Üst kısımda yer alan dropdown menüden bir öğrenci seçin
3. Öğrencinin ders programını görüntüleyin

## 📊 İstatistikler

Dashboard'da görüntülenen istatistikler:
- **Toplam Ders**: Programdaki benzersiz ders sayısı (aynı dersin birden fazla oturumu varsa bir kez sayılır)
- **Toplam Kredi**: Tüm derslerin toplam kredisi (benzersiz dersler için)
- **Toplam AKTS**: Tüm derslerin toplam AKTS değeri (benzersiz dersler için)
- **Haftalık Saat**: Haftalık toplam ders saati (tüm oturumlar dahil)

### Örnek
- **BİL101** (4 saat) → 2 oturum (2+2 saat) → İstatistikte 1 ders, 3 kredi, 5 AKTS, 4 haftalık saat
- **MAT151** (5 saat) → 2 oturum (3+2 saat) → İstatistikte 1 ders, 4 kredi, 6 AKTS, 5 haftalık saat

## 🎨 Görünüm

- **Haftalık Takvim**: 7 gün × 11 saat (08:00-18:00)
- **Renk Kodları**: Her ders için farklı renk
- **Oturum Gösterimi**: Çoklu oturumlar "(1/2)", "(2/2)" şeklinde etiketlenir
- **Çakışma Gösterimi**: 
  - Disabled slotlar gri ve soluk gösterilir (○ işareti)
  - Çakışan dersler modal'da kırmızı border ile gösterilir
  - Çakışma uyarı mesajı görüntülenir
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

- [x] Çakışma kontrolü (Aynı saatte birden fazla ders eklemeyi engelleme)
- [x] Otomatik ders bölme (4+ saatlik dersler için)
- [ ] PDF/Excel olarak dışa aktarma
- [ ] Ders önkoşul doğrulama (backend entegrasyonu)
- [ ] Sürükle-bırak ile ders taşıma
- [ ] Ders notları ve açıklamaları
- [ ] Farklı görünüm modları (Günlük, Haftalık)
- [ ] Ders arama ve filtreleme
- [ ] Program şablonları (Hazır programlar)
- [ ] Önerilen ders programı (AI destekli)

## 📝 Notlar

- **Önemli Değişiklik**: Dersler artık önceden tanımlı saatlere sahiptir
- **Backend Gereksinimi**: Backend'de `CourseScheduleSlots` tablosu ve API endpoint'leri gereklidir
- Detaylı backend gereksinimleri için [COURSE_SCHEDULE_BACKEND_API.md](COURSE_SCHEDULE_BACKEND_API.md) dosyasına bakın
- **Çakışma kontrolü aktif**: Aynı saate ders eklenemez
- **Tek seferlik ekleme**: Her ders sadece bir kere programa eklenebilir
- Backend entegrasyonu için `courseScheduleService.js` hazır
- Ders listesi backend'den `scheduleSlots` array'i ile birlikte gelmelidir

### Sistem Nasıl Çalışır?

1. **Backend'de**: Her dersin saatleri `CourseScheduleSlots` tablosunda tanımlıdır
2. **Frontend'de**: Öğrenci sadece dersi seçer
3. **Otomatik**: Backend dersin tüm oturumlarını programa ekler
4. **Çakışma**: Herhangi bir oturumda çakışma varsa tüm işlem iptal edilir

### Örnek Senaryo

```
Öğrenci BİL101 (4 saat) eklemek istiyor.

Backend'de tanımlı saatler:
- Pazartesi 09:00 - 2 saat
- Perşembe 09:00 - 2 saat

1. Öğrenci "Ders Ekle" butonuna tıklar
2. Modal açılır, BİL101'i gösterir
3. Modal'da ders saatleri görünür
4. Öğrenci BİL101'e tıklar
5. Backend her iki oturumu da ekler
6. Program güncellenir
7. İstatistikler: 1 ders, 3 kredi, 5 AKTS, 4 saat
```

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
