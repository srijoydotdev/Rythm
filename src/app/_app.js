import { useEffect } from 'react';
import { supabaseServer } from '../lib/supabaseServer';
import { syncUserWithPrisma } from '../lib/auth';

function MyApp({ Component, pageProps }) {
useEffect(() => {
supabaseServer.auth.onAuthStateChange((event, session) => {
if (event === 'SIGNED_IN' && session?.user) {
syncUserWithPrisma(session.user);
}
});
}, []);

return <Component {...pageProps} />;
}

export default MyApp;