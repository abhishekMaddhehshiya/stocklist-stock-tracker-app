"use server";

import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(email: string, symbol: string, company: string) {
  if (!email || !symbol || !company) return { ok: false, error: 'Missing fields' };

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return { ok: false, error: 'User not found' };

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return { ok: false, error: 'User id not found' };

    try {
      const item = new Watchlist({ userId, symbol: String(symbol).toUpperCase(), company });
      await item.save();

      const plainItem = {
        _id: item._id.toString(),
        userId: item.userId,
        symbol: item.symbol,
        company: item.company,
        addedAt: item.addedAt,
      };
      return { ok: true, data: plainItem };
    } catch (err: any) {
      if (err?.code === 11000) return { ok: false, error: 'Already in watchlist' };
      throw err;
    }
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { ok: false, error: 'Server error' };
  }
}

export async function removeFromWatchlist(email: string, symbol: string) {
  if (!email || !symbol) return { ok: false, error: 'Missing fields' };

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return { ok: false, error: 'User not found' };

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return { ok: false, error: 'User id not found' };

    const res = await Watchlist.deleteOne({ userId, symbol: String(symbol).toUpperCase() });
    return { ok: true, deletedCount: res.deletedCount || 0 };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { ok: false, error: 'Server error' };
  }
}

export async function getWatchlistByEmail(email: string) {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1, company: 1 }).lean();
    return items.map((i) => ({ symbol: String(i.symbol), company: String((i as any).company || '') }));
  } catch (err) {
    console.error('getWatchlistByEmail error:', err);
    return [];
  }
}



export async function addToWatchlistAction(symbol: string, company: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const email = session?.user?.email;
    if (!email) return { ok: false, error: 'Not authenticated' };
    return await addToWatchlist(email, symbol, company);
  } catch (err) {
    console.error('addToWatchlistAction error:', err);
    return { ok: false, error: 'Server error' };
  }
}

export async function removeFromWatchlistAction(symbol: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const email = session?.user?.email;
    if (!email) return { ok: false, error: 'Not authenticated' };
    return await removeFromWatchlist(email, symbol);
  } catch (err) {
    console.error('removeFromWatchlistAction error:', err);
    return { ok: false, error: 'Server error' };
  }
}