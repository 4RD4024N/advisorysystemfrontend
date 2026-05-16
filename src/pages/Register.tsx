import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services';
import bedesLogo from '../../bedeslogo.png';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      console.error('Register hatası:', err);
      const errorData = isAxiosError(err) ? err.response?.data : undefined;
      const errorMsg = errorData?.message
        || errorData?.title
        || errorData?.errors
        || 'Kayıt başarısız. Lütfen tekrar deneyin.';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={bedesLogo} alt="BEDES" className="auth-logo" />
          <h2 className="auth-title">Hesap oluştur</h2>
          <p className="auth-subtitle">Kayıt olarak başlayın</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            Kayıt başarılı! Giriş sayfasına yönlendiriliyor...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Ad Soyad</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input"
              placeholder="Ad Soyadınız"
              required
            />
          </div>

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
              minLength={6}
            />
            <p className="text-xs text-muted mt-1">Minimum 6 karakter</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading || success}
          >
            {loading ? <span className="loading"></span> : 'Hesap Oluştur'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Zaten bir hesabınız var mı? <Link to="/login" className="auth-link">Giriş Yap</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
