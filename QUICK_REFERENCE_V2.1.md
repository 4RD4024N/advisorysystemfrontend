# 🚀 Quick Reference: Advisor System v2.1 (Frontend)

## 📡 API Service Methods

### advisorService.js

```javascript
// ✅ NEW v2.1 - Assign advisor to student (Admin only)
await advisorService.assignAdvisorToStudent(studentId, advisorId);
// Returns: { message, studentName, advisorName }

// ✅ Get all advisors (Any role)
await advisorService.getAllAdvisors();
// Returns: Array of advisors

// ✅ Get my advisor (Student)
await advisorService.getMyAdvisor();
// Returns: { hasAdvisor: boolean, advisor: {...} | null }

// ✅ Get my students (Advisor)
await advisorService.getMyStudents();
// Returns: { totalStudents: number, students: [...] }

// ✅ Remove advisor from student (Admin)
await advisorService.removeAdvisorFromStudent(studentId);
// Returns: { message }

// ⚠️ DEPRECATED - Old document-based assignment
await advisorService.assignAdvisor({ documentId, advisorUserId });
```

---

## 🎯 Component Usage

### AssignAdvisor.jsx (Admin Only)

**Purpose:** Assign advisors to students

**Features:**
- Search students by email/name
- View current advisor assignments
- Assign/change/remove advisors
- Modal-based selection

**Usage:**
```jsx
import { AssignAdvisor } from './pages/AssignAdvisor';

// Only accessible by Admin role
<Route path="/assign-advisor" element={<AssignAdvisor />} />
```

---

### StudentProfile.jsx (Student)

**Purpose:** View personal profile and advisor

**Features:**
- Edit student profile
- View assigned advisor
- Check prerequisites

**Advisor Display:**
```jsx
{/* Shows advisor card at top */}
<div className="advisor-card has-advisor">
  <h2>👨‍🏫 My Advisor</h2>
  <div className="advisor-name">Prof. Smith</div>
  <div className="advisor-email">prof.smith@university.edu</div>
  <span className="status-badge assigned">✅ Assigned</span>
</div>
```

---

### Dashboard.jsx (All Roles)

**Purpose:** Show role-specific overview

**Student View:**
- Advisor card (if assigned)
- Document stats
- Recent documents

**Advisor View:**
- Student count card
- Document stats
- Recent documents

**Example:**
```jsx
{/* Student sees */}
<div className="card">
  <h2>👨‍🏫 My Advisor</h2>
  <div>{advisor.advisor.userName}</div>
</div>

{/* Advisor sees */}
<div className="card">
  <h2>👥 My Students</h2>
  <div>25</div>
  <p>You are advising 25 students</p>
</div>
```

---

### Students.jsx (Admin)

**Purpose:** Manage all students

**Features:**
- View all students
- Filter by advisor status
- Send notifications
- **NEW:** Display advisor info in student cards

**Advisor Display:**
```jsx
<div className="detail-item">
  <span className="detail-label">👨‍🏫 Advisor:</span>
  {student.hasAdvisor && student.advisor ? (
    <span className="detail-value">{student.advisor.userName}</span>
  ) : (
    <span className="detail-value">Not Assigned</span>
  )}
</div>
```

---

## 🔄 Data Structures

### Student Object (with advisor)
```javascript
{
  id: "student-id-123",
  userName: "john.doe@university.edu",
  email: "john.doe@university.edu",
  hasAdvisor: true,
  advisor: {
    id: "advisor-id-456",
    userName: "prof.smith@university.edu",
    email: "prof.smith@university.edu"
  }
}
```

### Advisor Response (getMyAdvisor)
```javascript
{
  hasAdvisor: true,
  advisor: {
    id: "advisor-id-456",
    userName: "prof.smith@university.edu",
    email: "prof.smith@university.edu"
  }
}
```

### My Students Response (getMyStudents)
```javascript
{
  totalStudents: 15,
  students: [
    {
      id: "student-id-1",
      userName: "student1@university.edu",
      email: "student1@university.edu",
      emailConfirmed: true
    },
    // ... more students
  ]
}
```

---

## 🎨 CSS Classes (StudentProfile.css)

```css
/* Advisor Card */
.advisor-card { /* Base card style */ }
.advisor-card.has-advisor { /* Blue gradient */ }
.advisor-card.no-advisor { /* Yellow gradient */ }

/* Advisor Details */
.advisor-details { /* Flex container */ }
.advisor-info { /* Advisor info section */ }
.advisor-name { /* Advisor name */ }
.advisor-email { /* Advisor email */ }

/* Status */
.advisor-status { /* Status container */ }
.status-badge { /* Badge style */ }
.status-badge.assigned { /* Green assigned badge */ }

/* No Advisor */
.no-advisor-message { /* Center aligned message */ }
.no-advisor-icon { /* Large emoji */ }
```

---

## 🔐 Role-Based Access

### Admin
- ✅ `/assign-advisor` - Assign advisors to students
- ✅ `/students` - View all students with advisors
- ✅ Can assign, change, remove advisors

### Advisor
- ✅ Dashboard shows student count
- ✅ Can view list of assigned students
- ❌ Cannot assign/remove advisors

### Student
- ✅ Dashboard shows assigned advisor
- ✅ Profile shows advisor details
- ❌ Cannot change their advisor

---

## 📝 Common Patterns

### Loading Advisor Data
```javascript
const [advisor, setAdvisor] = useState(null);

useEffect(() => {
  const loadAdvisor = async () => {
    try {
      const data = await advisorService.getMyAdvisor();
      setAdvisor(data);
    } catch (error) {
      console.error('Failed to load advisor:', error);
    }
  };
  loadAdvisor();
}, []);
```

### Assigning Advisor
```javascript
const handleAssignAdvisor = async (studentId, advisorId) => {
  try {
    const result = await advisorService.assignAdvisorToStudent(
      studentId,
      advisorId
    );
    alert(result.message); // "Öğretmen başarıyla atandı"
    loadData(); // Refresh
  } catch (error) {
    alert(error.response?.data?.error);
  }
};
```

### Removing Advisor
```javascript
const handleRemoveAdvisor = async (studentId) => {
  if (!confirm('Are you sure?')) return;
  
  try {
    const result = await advisorService.removeAdvisorFromStudent(studentId);
    alert(result.message); // "Öğretmen ataması kaldırıldı"
    loadData(); // Refresh
  } catch (error) {
    alert(error.response?.data?.error);
  }
};
```

### Checking Advisor Status
```javascript
{advisor && advisor.hasAdvisor ? (
  <div>
    <p>Advisor: {advisor.advisor.userName}</p>
    <p>Email: {advisor.advisor.email}</p>
  </div>
) : (
  <p>No advisor assigned</p>
)}
```

---

## 🧪 Testing Commands

```bash
# Start dev server
npm run dev

# Test as Admin
# Login as admin@local
# Navigate to /assign-advisor
# Search for student
# Assign advisor

# Test as Student
# Login as student@local
# Check dashboard for advisor card
# Check profile for advisor details

# Test as Advisor
# Login as advisor@local
# Check dashboard for student count
```

---

## 🐛 Troubleshooting

### Advisor not showing on student profile
```javascript
// Check if API is returning data
const data = await advisorService.getMyAdvisor();
console.log('Advisor data:', data);
// Should have: { hasAdvisor: true, advisor: {...} }
```

### Assignment not working
```javascript
// Check API response
try {
  const result = await advisorService.assignAdvisorToStudent(
    studentId, 
    advisorId
  );
  console.log('Assignment result:', result);
} catch (error) {
  console.error('Error:', error.response?.data);
}
```

### Student list not showing advisors
```javascript
// Verify API returns advisor data
const students = await studentService.getAllStudents();
console.log('Students:', students.students);
// Each student should have: { hasAdvisor, advisor: {...} }
```

---

## 📚 Related Files

- `src/services/advisorService.js` - API service
- `src/pages/AssignAdvisor.jsx` - Admin assignment page
- `src/pages/StudentProfile.jsx` - Student profile with advisor
- `src/pages/Students.jsx` - Student list with advisors
- `src/pages/Dashboard.jsx` - Role-based dashboard
- `src/pages/StudentProfile.css` - Advisor card styles

---

**Version:** 2.1.0  
**Last Updated:** December 20, 2024
