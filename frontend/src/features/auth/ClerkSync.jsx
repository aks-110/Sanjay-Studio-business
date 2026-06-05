import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice.js';

export default function ClerkSync() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const dispatch = useDispatch();
  const localAuth = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoaded) return;

    const syncSession = async () => {
      if (isSignedIn && clerkUser) {
        // Avoid redundant sync if already logged in with this Clerk user
        if (localAuth.isAuthenticated && localAuth.user?.id === clerkUser.id) {
          return;
        }

        try {
          const email = clerkUser.primaryEmailAddress?.emailAddress;
          const firstName = clerkUser.firstName || clerkUser.username || 'Gmail User';
          const lastName = clerkUser.lastName || '';
          const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || '';

          const response = await fetch('http://localhost:8000/api/auth/clerk-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: clerkUser.id,
              email,
              first_name: firstName,
              last_name: lastName,
              phone,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync session with backend');
          }

          const data = await response.json();
          dispatch(loginSuccess({ user: data.user, token: data.token }));
          console.log('[ClerkSync] Successfully synchronized session.');
        } catch (err) {
          console.error('[ClerkSync Error] Error syncing with backend:', err.message);
        }
      } else {
        // Clean up local session if signed out of Clerk
        if (localAuth.isAuthenticated) {
          dispatch(logout());
          console.log('[ClerkSync] Logged out local session.');
        }
      }
    };

    syncSession();
  }, [isLoaded, isSignedIn, clerkUser, dispatch, localAuth.isAuthenticated, localAuth.user?.id]);

  return null;
}
