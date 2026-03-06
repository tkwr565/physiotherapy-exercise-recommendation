import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const { t, lang, switchLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-title" onClick={() => navigate('/')}>
          {t('common.appName')}
        </h1>
        <div className="header-actions">
          <button
            className="btn btn-lang"
            onClick={() => switchLanguage(lang === 'en' ? 'zh-TW' : 'en')}
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          {currentUser && (
            <>
              <span className="header-user">
                {t('common.user')}: {currentUser.username}
              </span>
              <button className="btn btn-outline" onClick={handleLogout}>
                {t('common.logout')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
