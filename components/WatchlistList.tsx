"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WatchlistButton from '@/components/WatchlistButton';
import { addToWatchlistAction, removeFromWatchlistAction } from '@/lib/actions/watchlist.action';

type Item = { symbol: string; company: string };

export default function WatchlistList({ initialItems }: { initialItems?: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialItems) {
      // No server-side data provided; keep empty until user interacts
      setItems([]);
    }
  }, [initialItems]);

  const handleChange = async (symbol: string, added: boolean, company?: string) => {
    try {
      if (added) {
        const res = await addToWatchlistAction( symbol, company || symbol);
        if (res?.ok) {
          setItems((s) => [...s, { symbol, company: company || symbol }]);
        }
      } else {
        const res = await removeFromWatchlistAction( symbol);
        if (res?.ok) {
          setItems((s) => s.filter((it) => it.symbol !== symbol));
        }
      }
    } catch (err) {
      console.error('watchlist change error', err);
    }
  };

  if (loading) return <div>Loading watchlist…</div>;

  return (
    <div>
      {items.length === 0 ? (
        <div className="text-gray-400">Your watchlist is empty.</div>
      ) : (
        <ul className="space-y-3  gap-15 pt-10">
          {items.map((it) => (
            <li key={it.symbol} className="flex items-center justify-between p-3 border rounded lg:w-md gap-15">
              <Link href={`/stocks/${it.symbol}`} className="">
                <div>
                  <div className="font-medium">{it.symbol}</div>
                  <div className="text-sm text-gray-500">{it.company}</div>
                </div>
              </Link>
              <WatchlistButton 
                symbol={it.symbol}
                company={it.company}
                isInWatchlist={true}
                showTrashIcon={true}
                onWatchlistChange={(sym, added) => handleChange(sym, added, it.company)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
