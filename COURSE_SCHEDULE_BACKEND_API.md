# Ders Programı Backend API Gereksinimleri

## 📋 Genel Bakış

Bu doküman, ders programı sistemi için backend'de yapılması gereken değişiklikleri açıklar.

## 🎯 Sistem Mantığı

### Temel Kurallar
1. **Her dersin önceden tanımlı saatleri vardır**
   - Örnek: BİL101 → Pazartesi 09:00 (2 saat) + Perşembe 09:00 (2 saat)
   - Bu saatler veritabanında saklanır

2. **Her öğrenci her dersi sadece BİR KERE alabilir**
   - Aynı dersin programda birden fazla olması engellenir
   - Ders eklendiğinde tüm oturumları (2+2 gibi) otomatik eklenir

3. **Çakışma kontrolü**
   - Aynı saatte birden fazla ders olamaz
   - Backend de çakışma kontrolü yapmalı

## 📊 Veritabanı Modeli

### 1. Course (Ders) Tablosu

```sql
CREATE TABLE Courses (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    Theory INT NOT NULL,              -- Teorik ders saati
    Practice INT NOT NULL,            -- Uygulama ders saati
    Credit INT NOT NULL,              -- Kredi
    ECTS INT NOT NULL,                -- AKTS
    Semester INT NULL,                -- Dönem (1-8)
    Type NVARCHAR(50) NOT NULL,       -- 'Zorunlu', 'Teknik Seçmeli', 'Sosyal Seçmeli'
    Prerequisite NVARCHAR(50) NULL,   -- Önkoşul ders kodu
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
```

### 2. CourseScheduleSlot (Ders Saatleri) Tablosu

**ÖNEMLİ**: Her dersin önceden belirlenmiş saatleri bu tabloda saklanır.

```sql
CREATE TABLE CourseScheduleSlots (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CourseId INT NOT NULL,
    DayOfWeek NVARCHAR(20) NOT NULL,  -- 'monday', 'tuesday', etc.
    StartTime TIME NOT NULL,           -- '09:00:00'
    Duration INT NOT NULL,             -- Saat cinsinden (1, 2, 3, etc.)
    SessionNumber INT NOT NULL,        -- Oturum numarası (1, 2, etc.)
    
    FOREIGN KEY (CourseId) REFERENCES Courses(Id),
    CONSTRAINT UQ_Course_Slot UNIQUE (CourseId, DayOfWeek, StartTime)
);
```

**Örnek Veri**:
```sql
-- BİL101 dersi 4 saat: 2+2 şeklinde bölünmüş
INSERT INTO CourseScheduleSlots (CourseId, DayOfWeek, StartTime, Duration, SessionNumber)
VALUES 
    (1, 'monday', '09:00:00', 2, 1),      -- İlk oturum
    (1, 'thursday', '09:00:00', 2, 2);    -- İkinci oturum

-- MAT151 dersi 5 saat: 3+2 şeklinde bölünmüş  
INSERT INTO CourseScheduleSlots (CourseId, DayOfWeek, StartTime, Duration, SessionNumber)
VALUES 
    (2, 'monday', '14:00:00', 3, 1),      -- İlk oturum
    (2, 'friday', '11:00:00', 2, 2);      -- İkinci oturum
```

### 3. StudentSchedule (Öğrenci Ders Programı) Tablosu

```sql
CREATE TABLE StudentSchedules (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StudentId INT NOT NULL,
    CourseId INT NOT NULL,
    SlotId INT NOT NULL,               -- CourseScheduleSlot'tan
    AcademicYear NVARCHAR(20) NOT NULL, -- '2024-2025'
    Semester NVARCHAR(10) NOT NULL,     -- 'Fall', 'Spring'
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (StudentId) REFERENCES Users(Id),
    FOREIGN KEY (CourseId) REFERENCES Courses(Id),
    FOREIGN KEY (SlotId) REFERENCES CourseScheduleSlots(Id),
    
    -- Bir öğrenci aynı dersi aynı dönemde sadece bir kere alabilir
    CONSTRAINT UQ_Student_Course UNIQUE (StudentId, CourseId, AcademicYear, Semester)
);
```

## 🔧 Backend API Endpoints

### 1. Ders Listesi (Önceden Tanımlı Saatlerle)

```http
GET /api/courses/available
```

**Response**:
```json
[
  {
    "code": "BİL101",
    "name": "BİLGİSAYAR YAZILIMI I",
    "theory": 3,
    "practice": 1,
    "credit": 3,
    "ects": 5,
    "semester": 1,
    "type": "Zorunlu",
    "prerequisite": null,
    "scheduleSlots": [
      {
        "id": 1,
        "day": "monday",
        "time": "09:00",
        "duration": 2,
        "sessionNumber": 1
      },
      {
        "id": 2,
        "day": "thursday",
        "time": "09:00",
        "duration": 2,
        "sessionNumber": 2
      }
    ]
  }
]
```

### 2. Öğrenci Programını Getir

```http
GET /api/schedules/my-schedule
GET /api/schedules/{studentId}  (Danışman/Admin)
```

**Response**:
```json
{
  "monday": {
    "09:00": {
      "code": "BİL101",
      "name": "BİLGİSAYAR YAZILIMI I",
      "duration": 2,
      "credit": 3,
      "ects": 5,
      "sessionLabel": "(1/2)",
      "sessionNumber": 1,
      "totalSessions": 2
    }
  },
  "thursday": {
    "09:00": {
      "code": "BİL101",
      "name": "BİLGİSAYAR YAZILIMI I",
      "duration": 2,
      "credit": 3,
      "ects": 5,
      "sessionLabel": "(2/2)",
      "sessionNumber": 2,
      "totalSessions": 2
    }
  }
}
```

### 3. Ders Ekle (Tüm Oturumlarla Birlikte)

```http
POST /api/schedules
```

**Request**:
```json
{
  "courseCode": "BİL101",
  "academicYear": "2024-2025",
  "semester": "Fall"
}
```

**Backend İşlem Akışı**:
1. Dersin tüm slot'larını CourseScheduleSlots'tan al
2. Her slot için çakışma kontrolü yap
3. Öğrenci bu dersi daha önce almış mı kontrol et
4. Sorun yoksa TÜM slot'ları StudentSchedules'a ekle
5. Response dön

**Response**:
```json
{
  "success": true,
  "message": "BİL101 - BİLGİSAYAR YAZILIMI I programınıza eklendi",
  "addedSlots": [
    {
      "day": "monday",
      "time": "09:00",
      "duration": 2
    },
    {
      "day": "thursday",
      "time": "09:00",
      "duration": 2
    }
  ]
}
```

**Hata Durumları**:
```json
// Ders zaten programda
{
  "success": false,
  "error": "Bu ders zaten programınızda mevcut"
}

// Çakışma var
{
  "success": false,
  "error": "Pazartesi 09:00 saatinde MAT151 dersi ile çakışma var"
}

// Önkoşul eksik
{
  "success": false,
  "error": "Bu dersi alabilmek için BİL101 dersini tamamlamış olmanız gerekiyor"
}
```

### 4. Ders Sil (Tüm Oturumları Sil)

```http
DELETE /api/schedules/course/{courseCode}
```

**İşlem**: Öğrencinin programındaki o derse ait TÜM slot'ları sil.

**Response**:
```json
{
  "success": true,
  "message": "BİL101 dersi programınızdan kaldırıldı",
  "removedSlots": 2
}
```

### 5. Çakışma Kontrolü

```http
POST /api/schedules/check-conflict
```

**Request**:
```json
{
  "courseCode": "BİL101"
}
```

**Response**:
```json
{
  "hasConflict": false,
  "conflicts": []
}
```

veya

```json
{
  "hasConflict": true,
  "conflicts": [
    {
      "day": "monday",
      "time": "09:00",
      "conflictingCourse": {
        "code": "MAT151",
        "name": "MATEMATİKSEL ANALİZ I"
      }
    }
  ]
}
```

### 6. İstatistikler

```http
GET /api/schedules/my-statistics
```

**Response**:
```json
{
  "totalCourses": 5,
  "totalCredits": 18,
  "totalECTS": 28,
  "weeklyHours": 20
}
```

## 🔐 İş Kuralları (Business Logic)

### Backend'de Uygulanması Gerekenler

1. **Ders Ekleme Kontrolü**:
   ```csharp
   public async Task<Result> AddCourseToSchedule(int studentId, string courseCode)
   {
       // 1. Ders var mı kontrol et
       var course = await _context.Courses
           .Include(c => c.ScheduleSlots)
           .FirstOrDefaultAsync(c => c.Code == courseCode);
       
       if (course == null)
           return Result.Fail("Ders bulunamadı");
       
       // 2. Öğrenci bu dersi zaten almış mı?
       var alreadyExists = await _context.StudentSchedules
           .AnyAsync(s => s.StudentId == studentId && s.CourseId == course.Id);
       
       if (alreadyExists)
           return Result.Fail("Bu ders zaten programınızda mevcut");
       
       // 3. Tüm slot'lar için çakışma kontrolü
       foreach (var slot in course.ScheduleSlots)
       {
           var hasConflict = await CheckConflict(studentId, slot);
           if (hasConflict)
               return Result.Fail($"Çakışma: {slot.DayOfWeek} {slot.StartTime}");
       }
       
       // 4. Önkoşul kontrolü
       if (!string.IsNullOrEmpty(course.Prerequisite))
       {
           var hasPrerequisite = await CheckPrerequisite(studentId, course.Prerequisite);
           if (!hasPrerequisite)
               return Result.Fail($"Önkoşul: {course.Prerequisite} gerekli");
       }
       
       // 5. Tüm slot'ları ekle
       foreach (var slot in course.ScheduleSlots)
       {
           _context.StudentSchedules.Add(new StudentSchedule
           {
               StudentId = studentId,
               CourseId = course.Id,
               SlotId = slot.Id,
               AcademicYear = GetCurrentAcademicYear(),
               Semester = GetCurrentSemester()
           });
       }
       
       await _context.SaveChangesAsync();
       return Result.Success();
   }
   ```

2. **Çakışma Kontrolü**:
   ```csharp
   private async Task<bool> CheckConflict(int studentId, CourseScheduleSlot newSlot)
   {
       var existingSchedules = await _context.StudentSchedules
           .Include(s => s.Slot)
           .Where(s => s.StudentId == studentId)
           .Where(s => s.Slot.DayOfWeek == newSlot.DayOfWeek)
           .ToListAsync();
       
       foreach (var existing in existingSchedules)
       {
           var existingEnd = existing.Slot.StartTime.Add(TimeSpan.FromHours(existing.Slot.Duration));
           var newEnd = newSlot.StartTime.Add(TimeSpan.FromHours(newSlot.Duration));
           
           // Zaman çakışması kontrolü
           if (newSlot.StartTime < existingEnd && newEnd > existing.Slot.StartTime)
               return true;
       }
       
       return false;
   }
   ```

## 📝 Seed Data Örneği

```csharp
// Courses
var bil101 = new Course
{
    Code = "BİL101",
    Name = "BİLGİSAYAR YAZILIMI I",
    Theory = 3,
    Practice = 1,
    Credit = 3,
    ECTS = 5,
    Semester = 1,
    Type = "Zorunlu"
};

context.Courses.Add(bil101);
await context.SaveChangesAsync();

// CourseScheduleSlots
context.CourseScheduleSlots.AddRange(
    new CourseScheduleSlot
    {
        CourseId = bil101.Id,
        DayOfWeek = "monday",
        StartTime = TimeSpan.Parse("09:00"),
        Duration = 2,
        SessionNumber = 1
    },
    new CourseScheduleSlot
    {
        CourseId = bil101.Id,
        DayOfWeek = "thursday",
        StartTime = TimeSpan.Parse("09:00"),
        Duration = 2,
        SessionNumber = 2
    }
);

await context.SaveChangesAsync();
```

## ✅ Frontend-Backend Uyumu

Frontend şu şekilde çalışacak:
1. Sayfa açılınca `/api/courses/available` endpoint'inden dersleri çeker
2. Her ders `scheduleSlots` array'i ile birlikte gelir
3. Öğrenci bir ders seçtiğinde, frontend direkt o dersi eklemek ister
4. Backend tüm slot'ları ekler ve çakışma kontrolü yapar
5. Başarılı olursa schedule güncellenir

## 🔄 Migration Senaryosu

Eğer mevcut bir sistem varsa:

1. `CourseScheduleSlots` tablosunu oluştur
2. Mevcut dersler için manuel/script ile slot'ları ekle
3. `StudentSchedules` tablosunu yeniden yapılandır
4. Eski verileri migrate et

Bu yapı ile sistem tam otomatik çalışacak ve manuel slot seçimine gerek kalmayacak!
