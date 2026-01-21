'use client';

import TradingViewWidget from '@/components/TradingViewWidget';

export default function TradingViewMini({ symbol }: { symbol: string }) {
  return (
    <div className="pointer-events-none">
      <TradingViewWidget
        scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
        height={80}
        config={{
          symbol: `NASDAQ:${symbol}`,
          width: '100%',
          height: 80,
          locale: 'en',
          dateRange: '1D',
          colorTheme: 'dark',
          isTransparent: true,
          autosize: true,
        }}
      />
    </div>
  );
}
