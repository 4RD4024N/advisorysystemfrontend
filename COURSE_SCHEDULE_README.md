# Ders Programı (Course Schedule) Sistemi

## 📋 Genel Bakış

Ders Programı modülü, öğrencilerin haftalık ders programlarını oluşturmalarına ve yönetmelerine olanak tanır. Danışmanlar ise danışmanlık yaptıkları öğrencilerin ders programlarını görüntüleyebilir.

## ✨ Özellikler

### Öğrenci Özellikleri
- ✅ Haftalık ders programı görüntüleme (Pazartesi-Pazar)
- ✅ Mevcut derslerden seçim yaparak programa ders ekleme
- ✅ **Çakışma kontrolü**: Aynı saatte birden fazla ders eklenemez
- ✅ **Otomatik ders bölme**: Uzun dersler (4+ saat) otomatik olarak oturumlara bölünür
  - 4 saat → 2 + 2 saat
  - 5 saat → 3 + 2 saat
  - 6+ saat → 3'lük gruplara bölünür
- ✅ Programdan ders çıkarma (tek oturum veya tüm oturumlar)
- ✅ Ders bilgilerini görüntüleme (Kod, İsim, Teori/Uygulama saatleri, Kredi, AKTS)
- ✅ **Akıllı istatistikler**: Aynı dersin birden fazla oturumu tek ders olarak sayılır
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
2. Takvimde boş bir zaman dilimini seçin (+ işaretli hücrelere tıklayın)
3. Açılan modal'da bir ders seçin
4. **Çakışma kontrolü**: Eğer seçilen saatte başka bir ders varsa, çakışan ders kırmızı gösterilir
5. **Uzun dersler**: 4+ saatlik dersler otomatik olarak oturumlara bölünür
   - Örnek: 4 saatlik ders → İlk 2 saat eklenir, ardından 2. oturum için soru sorulur
6. "Ekle" butonuna tıklayın
7. Birden fazla oturuma bölünen dersler için ikinci zaman dilimini seçin

#### Ders Çıkarma
1. Programdaki bir dersin üzerine gelin
2. Sağ üst köşedeki "×" butonuna tıklayın
3. **Çoklu oturum**: Ders birden fazla oturuma bölünmüşse:
   - "OK": Sadece bu oturumu kaldır
   - "İptal": Tüm oturumları kaldır

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

- Şu anda örnek ders verileri kullanılmaktadır
- **Çakışma kontrolü aktif**: Aynı saate ders eklenemez
- **Otomatik bölme**: 4+ saatlik dersler otomatik oturumlara ayrılır
- Backend entegrasyonu için `courseScheduleService.js` hazır
- Ders listesi veritabanından güncellenmelidir
- Önkoşul kontrolü backend tarafında yapılmalıdır

### Çakışma Kontrolü Nasıl Çalışır?

1. **Ders eklerken**: Modal'da çakışan dersler kırmızı gösterilir ve tıklanamaz
2. **Disabled slotlar**: Başka bir dersin içinde kalan saatler gri ve disabled gösterilir
3. **Uyarı mesajları**: Çakışma durumunda detaylı uyarı mesajı gösterilir
4. **Çoklu oturum desteği**: Uzun dersler farklı günlere/saatlere yerleştirilebilir

### Ders Bölme Algoritması

```
1-2 saat  → Bölünmez
3 saat    → 2 + 1 saat (2 oturum)
4 saat    → 2 + 2 saat (2 oturum)
5 saat    → 3 + 2 saat (2 oturum)
6+ saat   → 3'lük gruplara bölünür
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
