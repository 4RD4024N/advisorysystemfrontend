# API Services Quick Reference

## 📋 Available Services

### 1️⃣ authService
```javascript
authService.register({ email, password, fullName })
authService.login({ email, password })
authService.logout()
authService.isAuthenticated()
authService.getToken()
```

### 2️⃣ documentService
```javascript
documentService.getMyDocuments()
documentService.createDocument({ title, tags })
documentService.uploadVersion(documentId, file, notes)
documentService.getVersions(documentId)
documentService.downloadFile(versionId)
documentService.downloadAndSaveFile(versionId, fileName)
```

### 3️⃣ advisorService
```javascript
advisorService.getAllAdvisors()
advisorService.assignAdvisor({ documentId, advisorUserId })
```

### 4️⃣ commentService
```javascript
commentService.getCommentsByVersion(versionId)
commentService.createComment({ documentVersionId, content })
commentService.deleteComment(commentId)
```

### 5️⃣ submissionService
```javascript
submissionService.getMySubmissions()
submissionService.createSubmission({ studentId, dueDate })
submissionService.updateStatus(submissionId, status)
```

### 6️⃣ statisticsService
```javascript
statisticsService.getStudentSummary()
statisticsService.getAdvisorSummary()
statisticsService.getAdminOverview()
```

### 7️⃣ searchService
```javascript
searchService.searchDocuments({ query, tags, startDate, endDate, page, pageSize })
searchService.getPopularTags(top)
```

### 8️⃣ debugService (Dev Only)
```javascript
debugService.getAllUsers()
debugService.deleteAllUsers() // ⚠️ DANGEROUS
debugService.getSeedInfo()
debugService.generateToken(email)
```

---

## 🎯 Usage Patterns

### Pattern 1: Simple GET Request
```javascript
const data = await serviceName.methodName();
```

### Pattern 2: POST/PUT/PATCH with Data
```javascript
const result = await serviceName.methodName({ 
  key: 'value' 
});
```

### Pattern 3: With Parameters
```javascript
const result = await serviceName.methodName(id, param1, param2);
```

### Pattern 4: With Query Parameters
```javascript
const results = await searchService.searchDocuments({
  query: 'search term',
  page: 1,
  pageSize: 20
});
```

---

## 💡 Common Workflows

### Workflow 1: User Login
```javascript
import { authService } from './services';

const { token } = await authService.login({
  email: 'stu@local',
  password: 'Arda123!'
});
// Token is automatically stored and used in future requests
```

### Workflow 2: Create and Upload Document
```javascript
import { documentService } from './services';

// 1. Create document
const { id } = await documentService.createDocument({
  title: 'My Thesis',
  tags: 'research,thesis'
});

// 2. Upload file
const { versionNo } = await documentService.uploadVersion(
  id,
  fileInput.files[0],
  'Initial version'
);
```

### Workflow 3: View and Comment
```javascript
import { documentService, commentService } from './services';

// 1. Get document versions
const versions = await documentService.getVersions(docId);

// 2. Get comments for latest version
const comments = await commentService.getCommentsByVersion(
  versions[0].id
);

// 3. Add new comment
await commentService.createComment({
  documentVersionId: versions[0].id,
  content: 'Looks good!'
});
```

### Workflow 4: Download File
```javascript
import { documentService } from './services';

// Automatically triggers browser download
await documentService.downloadAndSaveFile(
  versionId,
  'my-thesis.pdf'
);
```

### Workflow 5: Search and Filter
```javascript
import { searchService } from './services';

// Search with multiple filters
const results = await searchService.searchDocuments({
  query: 'machine learning',
  tags: 'research,AI',
  startDate: '2024-01-01',
  page: 1,
  pageSize: 20
});

console.log(`Found ${results.totalCount} documents`);
```

### Workflow 6: Admin Dashboard
```javascript
import { statisticsService, searchService } from './services';

// Get overview stats
const stats = await statisticsService.getAdminOverview();

// Get popular tags for filtering
const tags = await searchService.getPopularTags(10);
```

---

## ⚠️ Error Handling

### Basic Try-Catch
```javascript
try {
  const data = await documentService.getMyDocuments();
  console.log(data);
} catch (error) {
  console.error('Error:', error.response?.data?.message || error.message);
}
```

### With User Feedback
```javascript
try {
  await documentService.createDocument({ title, tags });
  alert('Document created successfully!');
} catch (error) {
  if (error.response?.status === 401) {
    alert('Please login first');
  } else if (error.response?.status === 403) {
    alert('You do not have permission');
  } else {
    alert('An error occurred: ' + error.message);
  }
}
```

---

## 🔐 Authentication States

```javascript
// Check if user is logged in
if (authService.isAuthenticated()) {
  // User is logged in
  const documents = await documentService.getMyDocuments();
} else {
  // Redirect to login
  window.location.href = '/login';
}

// Logout
const handleLogout = () => {
  authService.logout();
  window.location.href = '/login';
};
```

---

## 📊 Response Type Examples

### Single Object
```javascript
const { id, token, message } = await serviceName.method();
```

### Array
```javascript
const items = await serviceName.method();
items.forEach(item => console.log(item));
```

### Paginated
```javascript
const { documents, totalCount, page, totalPages } = 
  await searchService.searchDocuments({ page: 1 });
```

### File Blob
```javascript
const blob = await documentService.downloadFile(versionId);
// Handle blob...
```

---

## 🚀 Performance Tips

1. **Avoid unnecessary requests**
   ```javascript
   // Bad: Multiple requests
   const doc1 = await documentService.getVersions(1);
   const doc2 = await documentService.getVersions(2);
   
   // Good: Use Promise.all for parallel requests
   const [doc1, doc2] = await Promise.all([
     documentService.getVersions(1),
     documentService.getVersions(2)
   ]);
   ```

2. **Cache data when possible**
   ```javascript
   let cachedDocuments = null;
   
   async function getDocuments(forceRefresh = false) {
     if (!cachedDocuments || forceRefresh) {
       cachedDocuments = await documentService.getMyDocuments();
     }
     return cachedDocuments;
   }
   ```

3. **Use pagination**
   ```javascript
   // Load only what you need
   const results = await searchService.searchDocuments({
     page: 1,
     pageSize: 10  // Start with 10 items
   });
   ```

---

## 🎨 React Hooks Example

```javascript
import { useState, useEffect } from 'react';
import { documentService } from './services';

function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getMyDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  );
}
```

---

## 📱 File Upload in React

```javascript
function FileUpload({ documentId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await documentService.uploadVersion(
        documentId,
        file,
        'New version'
      );
      alert(`Uploaded version ${result.versionNo}`);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

---

**Happy Coding! 🎉**
