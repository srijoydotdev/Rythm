'use client'
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/router';

export function withAuth(Component) {
return function ProtectedRoute(props) {
const router = useRouter();
const [loading, setLoading] = useState(true);

useEffect(() => {
supabaseServer.auth.getSession().then(({ data: { session } }) => {
if (!session) router.push('/login');
setLoading(false);
});
}, [router]);

if (loading) return <div>Loading...</div>;
return <Component {...props} />;
};
}