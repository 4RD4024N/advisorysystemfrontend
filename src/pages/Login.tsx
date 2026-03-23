import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'stu@local',
    password: 'Arda123!'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Kullanıcıyı sisteme giriş yaptır
    try {
      await authService.login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">BEDES</h1>
          <h2 className="auth-title">Hoşgeldiniz</h2>
          <p className="auth-subtitle">Hesabınıza giriş yapınız</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">E posta</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Şifre</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? <span className="loading"></span> : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Hesabın yok mu?<Link to="/register" className="auth-link">Kayıt Ol</Link></p>
        </div>

        <div className="auth-demo">
          <p className="text-xs text-muted">Demo Hesaplar:</p>
          <p className="text-xs text-muted">Öğrenci: studentnumarası@local / Student123!</p>
          <p className="text-xs text-muted">admin: admin@local / Admin123!</p>
          <p className="text-xs text-muted">Danışman: advisornumarası@local / Advisor123!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
