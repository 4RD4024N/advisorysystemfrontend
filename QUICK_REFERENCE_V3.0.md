# 🚀 Quick Reference: Advisor System v3.0

## 📡 API Changes

### advisorService.js

```javascript
// ✅ v3.0 - Get all advisors (returns object with totalAdvisors)
const data = await advisorService.getAllAdvisors();
// Returns: { totalAdvisors: 5, advisors: [...] }

// ✅ v3.0 - Assign/Update advisor (single endpoint for both)
const result = await advisorService.assignAdvisorToStudent(studentId, advisorId);
// Returns: { message, studentId, studentName, advisorId, advisorName, isUpdate }

// ✅ v3.0 - Remove advisor (new endpoint path)
const result = await advisorService.removeAdvisorFromStudent(studentId);
// Returns: { message, studentId, studentName }
```

---

## 🎨 UI Components

### AssignAdvisor.jsx (v3.0)

**New Features:**
- ✅ Statistics dashboard (4 cards)
- ✅ Filter buttons (All / Unassigned)
- ✅ Enhanced search (name, email, advisor)
- ✅ Document count display
- ✅ Status badges
- ✅ Update detection in modal

**Statistics Cards:**
```jsx
1. Toplam Öğrenci (Blue) - Total students
2. Öğretmeni Olan (Green) - Students with advisor
3. Öğretmeni Olmayan (Yellow) - Students without advisor
4. Toplam Öğretmen (Purple) - Total advisors
```

**Table Columns:**
1. Öğrenci - Student username
2. Email - Student email
3. Belge Sayısı - Document count (badge)
4. Durum - Status (✅ Atandı / ⚠️ Atanmadı)
5. Öğretmen - Advisor details or "Atanmamış"
6. İşlemler - Action buttons

**Action Buttons:**
- **Ata** - Assign new advisor (green)
- **Değiştir** - Update existing advisor (blue)
- **Kaldır** - Remove advisor (red)

---

## 🔄 Common Operations

### 1. Load All Data
```javascript
const loadData = async () => {
  const [studentsData, advisorsData] = await Promise.all([
    studentService.getAllStudents({ pageSize: 1000 }),
    advisorService.getAllAdvisors()
  ]);
  
  const studentsList = studentsData?.students || [];
  const advisorsList = advisorsData?.advisors || [];
  
  setStudents(studentsList);
  setAdvisors(advisorsList);
  
  // Calculate statistics
  const assigned = studentsList.filter(s => s.hasAdvisor).length;
  const unassigned = studentsList.filter(s => !s.hasAdvisor).length;
  
  setStats({
    total: studentsList.length,
    assigned: assigned,
    unassigned: unassigned,
    totalAdvisors: advisorsData?.totalAdvisors || 0
  });
};
```

### 2. Assign New Advisor
```javascript
const handleAssignAdvisor = async () => {
  try {
    const result = await advisorService.assignAdvisorToStudent(
      studentId,
      advisorId
    );
    
    if (result.isUpdate) {
      alert('Öğretmen başarıyla güncellendi');
    } else {
      alert('Öğretmen başarıyla atandı');
    }
    
    await loadData(); // Refresh
  } catch (error) {
    alert(error.response?.data?.error);
  }
};
```

### 3. Remove Advisor
```javascript
const handleRemoveAdvisor = async (student) => {
  if (!confirm(`${student.userName} öğretmen atamasını kaldır?`)) {
    return;
  }
  
  try {
    const result = await advisorService.removeAdvisorFromStudent(student.id);
    alert(result.message);
    await loadData(); // Refresh
  } catch (error) {
    alert(error.response?.data?.error);
  }
};
```

### 4. Filter Students
```javascript
const filteredStudents = students.filter(student => {
  // Filter by type
  if (filterType === 'unassigned' && student.hasAdvisor) {
    return false;
  }
  
  // Filter by search
  if (!searchQuery) return true;
  const query = searchQuery.toLowerCase();
  
  return (
    student.userName?.toLowerCase().includes(query) ||
    student.email?.toLowerCase().includes(query) ||
    (student.hasAdvisor && 
     student.advisor?.userName?.toLowerCase().includes(query))
  );
});
```

---

## 📊 Data Structures

### Student Object (with advisor)
```javascript
{
  id: "student-id-123",
  userName: "john.doe@university.edu",
  email: "john.doe@university.edu",
  emailConfirmed: true,
  documentCount: 5,
  pendingSubmissions: 2,
  hasAdvisor: true,
  advisor: {
    id: "advisor-id-456",
    userName: "prof.smith@university.edu",
    email: "prof.smith@university.edu"
  }
}
```

### Advisors Response (v3.0)
```javascript
{
  totalAdvisors: 5,
  advisors: [
    {
      id: "advisor-id-456",
      userName: "prof.smith@university.edu",
      email: "prof.smith@university.edu",
      emailConfirmed: true
    }
  ]
}
```

### Assignment Response (v3.0)
```javascript
// New assignment
{
  message: "Öğretmen başarıyla atandı",
  studentId: "student-id-123",
  studentName: "student@university.edu",
  advisorId: "advisor-id-456",
  advisorName: "prof.smith@university.edu",
  isUpdate: false
}

// Update existing
{
  message: "Öğretmen başarıyla güncellendi",
  studentId: "student-id-123",
  studentName: "student@university.edu",
  advisorId: "advisor-id-789",
  advisorName: "prof.johnson@university.edu",
  isUpdate: true
}
```

---

## 🎨 CSS Classes

### Statistics Cards
```css
.bg-gradient-to-br from-blue-500 to-blue-600    /* Total students */
.bg-gradient-to-br from-green-500 to-green-600  /* With advisor */
.bg-gradient-to-br from-yellow-500 to-yellow-600 /* Without advisor */
.bg-gradient-to-br from-purple-500 to-purple-600 /* Total advisors */
```

### Status Badges
```css
.bg-green-100 text-green-800  /* ✅ Atandı */
.bg-yellow-100 text-yellow-800 /* ⚠️ Atanmadı */
.bg-blue-100 text-blue-800     /* Document count */
```

### Buttons
```css
.bg-primary hover:bg-primary-dark  /* Assign/Update */
.bg-red-500 hover:bg-red-600       /* Remove */
.bg-green-500 hover:bg-green-600   /* Refresh */
```

---

## 🔧 Debugging

### Check API Response Format
```javascript
const data = await advisorService.getAllAdvisors();
console.log('Advisors:', data);
// Should have: { totalAdvisors: number, advisors: Array }

const result = await advisorService.assignAdvisorToStudent(studentId, advisorId);
console.log('Assign result:', result);
// Should have: { message, studentId, advisorId, isUpdate }
```

### Verify Student Data
```javascript
const students = await studentService.getAllStudents({ pageSize: 1000 });
console.log('Students:', students);
// Should have: { students: Array, totalCount, page, pageSize }

students.students.forEach(s => {
  console.log(`${s.userName}: hasAdvisor=${s.hasAdvisor}`);
  if (s.hasAdvisor) {
    console.log(`  Advisor: ${s.advisor.userName}`);
  }
});
```

### Check Stats Calculation
```javascript
const assigned = students.filter(s => s.hasAdvisor).length;
const unassigned = students.filter(s => !s.hasAdvisor).length;
console.log(`Assigned: ${assigned}, Unassigned: ${unassigned}`);
```

---

## 🧪 Testing Checklist

### Admin Flow
- [ ] Login as admin
- [ ] Navigate to "Öğretmen Atama"
- [ ] See statistics cards
- [ ] See all students table
- [ ] Search by email works
- [ ] Search by name works
- [ ] Filter "Tümü" works
- [ ] Filter "Öğretmensizler" works
- [ ] Click "Ata" on unassigned student
- [ ] Select advisor and assign
- [ ] See success message
- [ ] Stats update automatically
- [ ] Click "Değiştir" on assigned student
- [ ] See warning message in modal
- [ ] Change advisor
- [ ] See "güncellendi" message
- [ ] Click "Kaldır" on assigned student
- [ ] Confirm removal
- [ ] Student becomes unassigned
- [ ] Click "Yenile" button
- [ ] Data refreshes

---

## 📱 Responsive Breakpoints

```css
/* Mobile (<768px) */
- Single column stats
- Horizontal scroll table
- Stacked buttons

/* Tablet (768-1024px) */
- 2-column stats
- Full table
- Side-by-side buttons

/* Desktop (>1024px) */
- 4-column stats
- Full table
- All features visible
```

---

## ⚡ Performance Tips

1. **Pagination:** Use `pageSize: 1000` for admin view
2. **Parallel Loading:** Load students and advisors together
3. **Client Search:** Filter on frontend for speed
4. **Debounce Search:** Optional for large datasets
5. **Memoize Filters:** Cache filtered results

---

## 🚨 Error Handling

### Common Errors
```javascript
// 404 - Student not found
{ error: "Student not found" }

// 400 - Not a student
{ error: "User is not a student" }

// 404 - Advisor not found
{ error: "Advisor not found" }

// 400 - Not an advisor
{ error: "User is not an advisor" }

// 400 - No advisor to remove
{ error: "Student does not have an advisor" }
```

### Display Errors
```javascript
try {
  await assignAdvisor(studentId, advisorId);
} catch (error) {
  setMessage({
    type: 'error',
    text: error.response?.data?.error || 'Bir hata oluştu'
  });
}
```

---

## 🔗 API Endpoints Reference

```http
GET    /api/advisors                  → { totalAdvisors, advisors }
POST   /api/advisors/assign           → { message, isUpdate, ... }
DELETE /api/advisors/remove/{id}      → { message, studentId, ... }
GET    /api/students?pageSize=1000    → { students, totalCount, ... }
GET    /api/students/without-advisor  → { students, totalCount }
```

---

**Version:** 3.0.0  
**Last Updated:** December 20, 2024  
**Status:** ✅ Production Ready
