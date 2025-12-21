# Token Debug Kılavuzu

## 403 Forbidden Hatası Çözümü

### Adım 1: Token'ı Kontrol Et

Tarayıcı console'unda şunu çalıştır:

```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

// Token'ı decode et
const payload = token.split('.')[1];
const decoded = JSON.parse(atob(payload));
console.log('Decoded Token:', decoded);
```

### Adım 2: Role Claim'ini Bul

Token içinde role bilgisinin hangi key ile geldiğini kontrol et. Olası key'ler:
- `role`
- `Role`
- `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`
- `roles`
- başka bir custom claim

### Adım 3: Request Header'ı Kontrol Et

Network tab'ında `/api/advisors/pending-requests` isteğine tıkla ve:
1. **Request Headers** bölümünden `Authorization` header'ını kontrol et
2. `Bearer <token>` formatında olmalı

### Adım 4: Backend Log'larını Kontrol Et

Backend'de:
- Token'ın gelip gelmediğini
- Role claim'inin doğru parse edilip edilmediğini
- Authorization policy'nin doğru çalışıp çalışmadığını kontrol et

### Olası Sorunlar ve Çözümler

#### Sorun 1: Role claim yanlış key ile aranıyor
**Çözüm:** `authService.js` dosyasındaki `getUserInfo` metodunu güncelle

#### Sorun 2: Token header'da eksik
**Çözüm:** `api.js` interceptor'ını kontrol et

#### Sorun 3: Backend authorization policy yanlış
**Çözüm:** Backend'de `[Authorize(Roles = "Advisor")]` kontrolünü yap

#### Sorun 4: Token expire olmuş
**Çözüm:** Yeniden login ol
