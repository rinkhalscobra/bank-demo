import { useMemo, useState } from 'react';
import { DollarSign, Search, Wallet, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getBalanceStatusClasses, isBalanceAvailable, normalizeBalanceStatus } from '../../../lib/balanceStatus';
import { getLocalizedBalanceCardTitle, getLocalizedBalanceStatusLabel } from '../../../lib/balanceStatusI18n';

export type OverviewAsset = {
  id: string;
  kind: 'fiat' | 'crypto';
  code: string;
  name: string;
  amount: string;
  status: unknown;
  logo?: string;
  icon?: LucideIcon;
};

export default function OverviewAssetLedger({ assets, showBalances }: { assets: OverviewAsset[]; showBalances: boolean }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'fiat' | 'crypto'>('all');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return assets.filter((asset) => (
      (filter === 'all' || asset.kind === filter)
      && (!term || `${asset.code} ${asset.name}`.toLocaleLowerCase().includes(term))
    ));
  }, [assets, filter, query]);

  return (
    <section className="overview-panel overview-ledger" aria-labelledby="overview-assets-title">
      <header className="overview-panel-heading">
        <div className="overview-heading-title">
          <span className="overview-icon"><Wallet size={19} aria-hidden="true" /></span>
          <h2 id="overview-assets-title">{t('dashboardOverview.layout.accounts')}</h2>
          <span className="overview-count">{assets.length}</span>
        </div>
        <label className="overview-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label={t('dashboardOverview.layout.searchAssets')}
            placeholder={t('dashboardOverview.layout.searchAssets')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label={t('dashboardOverview.layout.clearSearch')}><X size={14} /></button>}
        </label>
      </header>

      <div className="overview-asset-tabs" role="group" aria-label={t('dashboardOverview.layout.accounts')}>
        {(['all', 'fiat', 'crypto'] as const).map((kind) => (
          <button key={kind} type="button" aria-pressed={filter === kind} onClick={() => setFilter(kind)}>
            {kind === 'all' ? t('balanceAnalysis.filters.all') : t(`dashboardOverview.sections.${kind === 'fiat' ? 'fiatCurrencies' : 'cryptoAssets'}`)}
            <span>{kind === 'all' ? assets.length : assets.filter((asset) => asset.kind === kind).length}</span>
          </button>
        ))}
      </div>

      <table className="overview-asset-table">
        <thead>
          <tr>
            <th scope="col">{t('dashboardOverview.layout.asset')}</th>
            <th scope="col">{t('dashboardOverview.layout.status')}</th>
            <th scope="col">{t('dashboardOverview.layout.balance')}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((asset) => {
            const Icon = asset.icon || DollarSign;
            const available = isBalanceAvailable(asset.status);
            return (
              <tr key={asset.id}>
                <th scope="row">
                  <div className="overview-asset-identity">
                    <span className={`overview-asset-icon overview-asset-icon--${asset.kind}`}>
                      {asset.logo ? <img src={asset.logo} alt="" loading="lazy" /> : <Icon size={19} aria-hidden="true" />}
                    </span>
                    <span className="overview-asset-name"><strong>{asset.name}</strong><small>{asset.code}</small></span>
                  </div>
                </th>
                <td><span className={`overview-status ${getBalanceStatusClasses(asset.status)}`}><i aria-hidden="true" />{getLocalizedBalanceStatusLabel(t, asset.status)}</span></td>
                <td className="overview-asset-amount">
                  <strong>{showBalances ? asset.amount : '••••'}</strong>
                  {asset.kind === 'crypto' && <small>{asset.code}</small>}
                  {!available && <small className={`overview-restriction overview-restriction--${normalizeBalanceStatus(asset.status)}`}>{getLocalizedBalanceCardTitle(t, asset.status)}</small>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="overview-empty" role="status">
          <Wallet size={28} aria-hidden="true" />
          <p>{t(assets.length ? 'dashboardOverview.layout.noMatches' : 'dashboardOverview.layout.noAssets')}</p>
          {query && <button className="overview-text-link" type="button" onClick={() => setQuery('')}>{t('dashboardOverview.layout.clearSearch')}</button>}
        </div>
      )}
    </section>
  );
}
