import { useAuth } from '../context/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, User } from 'lucide-react';
import styles from './UserBar.module.css';

function UserBar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <Package className={styles.logoIcon} />
            <span>MyPurchaser</span>
          </div>

          {user && (
            <div className={styles.userControls}>
              <div className={styles.userInfo}>
                <User className={styles.userIcon} size={18} />
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <button onClick={handleSignOut} className={styles.signOutBtn}>
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </header>
      </div>
    );
}

export default UserBar;

