import React, { useState } from 'react';
import {
  authService,
  documentService,
  advisorService,
  commentService,
  submissionService,
  statisticsService,
  searchService,
} from '../services';

const ExampleUsage = () => {
  const [email, setEmail] = useState('stu@local');
  const [password, setPassword] = useState('Arda123!');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);

  // Example: Login
  const handleLogin = async () => {
    try {
      const result = await authService.login({ email, password });
      setToken(result.token);
      setMessage('Login successful!');
    } catch (error) {
      setMessage(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Example: Get My Documents
  const handleGetDocuments = async () => {
    try {
      const documents = await documentService.getMyDocuments();
      setData(documents);
      setMessage('Documents loaded successfully!');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Example: Create Document
  const handleCreateDocument = async () => {
    try {
      const result = await documentService.createDocument({
        title: 'My New Thesis',
        tags: 'research,thesis,software',
      });
      setMessage(`Document created with ID: ${result.id}`);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Example: Get Student Statistics
  const handleGetStats = async () => {
    try {
      const stats = await statisticsService.getStudentSummary();
      setData(stats);
      setMessage('Statistics loaded successfully!');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Example: Search Documents
  const handleSearch = async () => {
    try {
      const results = await searchService.searchDocuments({
        query: 'thesis',
        page: 1,
        pageSize: 10,
      });
      setData(results);
      setMessage('Search completed successfully!');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Example: Get Popular Tags
  const handleGetTags = async () => {
    try {
      const tags = await searchService.getPopularTags(10);
      setData(tags);
      setMessage('Tags loaded successfully!');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Advisory System - API Example Usage</h1>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>1. Authentication</h2>
        <div style={{ marginTop: '10px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button onClick={handleLogin} style={{ padding: '5px 15px' }}>
            Login
          </button>
        </div>
        {token && (
          <div style={{ marginTop: '10px', fontSize: '12px', wordBreak: 'break-all' }}>
            <strong>Token:</strong> {token.substring(0, 50)}...
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>2. Document Operations</h2>
        <button onClick={handleGetDocuments} style={{ padding: '5px 15px', marginRight: '10px' }}>
          Get My Documents
        </button>
        <button onClick={handleCreateDocument} style={{ padding: '5px 15px' }}>
          Create Document
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>3. Statistics & Search</h2>
        <button onClick={handleGetStats} style={{ padding: '5px 15px', marginRight: '10px' }}>
          Get Statistics
        </button>
        <button onClick={handleSearch} style={{ padding: '5px 15px', marginRight: '10px' }}>
          Search Documents
        </button>
        <button onClick={handleGetTags} style={{ padding: '5px 15px' }}>
          Get Popular Tags
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
            border: '1px solid',
            borderColor: message.includes('Error') ? '#f44336' : '#4caf50',
          }}
        >
          <strong>Message:</strong> {message}
        </div>
      )}

      {data && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
          <h3>Response Data:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0' }}>
        <h3>Important Notes:</h3>
        <ul>
          <li>Make sure the backend API is running on https://localhost:7175</li>
          <li>Default credentials: stu@local / Arda123! (Student) or admin@local / Admin123! (Admin)</li>
          <li>The token is automatically stored in localStorage after login</li>
          <li>All authenticated requests automatically include the Bearer token</li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleUsage;
