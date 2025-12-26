
import WatchlistList from '@/components/WatchlistList';
import { getWatchlistByEmail } from '@/lib/actions/watchlist.action';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/better-auth/auth';

const page = async () => {
  const session = await auth.api.getSession({
      headers: await headers(),
  })
   if(!session?.user) redirect('/sign-in');
  const email = session.user.email as string;
  const items = await getWatchlistByEmail(email);
  return (
    <div>
      <h1 className="watchlist-title">My Watchlist</h1>
      <WatchlistList initialItems={items} />
    </div>
  );
};

export default page;
