import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const { user } = useAuth();

  return (
    <div>
      {user ? <span>Welcome, {user.username}</span> : <a href="/login">Login</a>}
    </div>
  );
};
