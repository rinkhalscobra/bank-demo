import { normalizeTaxStatus, type TaxStatus } from './taxStatus';

export const TAX_NOTES_MAX_LENGTH = 2000;

export type TaxNote = {
  id: string;
  notes: string;
  updatedAt: string | null;
};

export function getTaxNotes(rows: unknown[]): TaxNote[] {
  const entries = rows.flatMap((value, index) => {
    if (!value || typeof value !== 'object') return [];
    const row = value as Record<string, unknown>;
    const notes = typeof row.notes === 'string' ? row.notes.trim() : '';
    // Older summary records contained an internal placeholder, not a client note.
    if (!notes || notes === 'Managed from CRM tax summary.') return [];
    const timestamp = row.updated_at || row.created_at;
    return [{
      id: typeof row.id === 'string' ? row.id : `tax-note-${index}`,
      status: normalizeTaxStatus(row.status),
      notes,
      updatedAt: typeof timestamp === 'string' && Number.isFinite(Date.parse(timestamp)) ? timestamp : null,
    }];
  }).sort((left, right) => {
    const order: Record<TaxStatus, number> = { pending: 0, on_hold: 1, paid: 2 };
    return order[left.status] - order[right.status];
  });
  if (!entries.length) return [];

  // Preserve existing notes when consolidating the old per-status fields.
  const notes = [...new Set(entries.map((entry) => entry.notes))].join('\n\n');
  const updatedAt = entries.reduce<string | null>((latest, entry) => (
    entry.updatedAt && (!latest || Date.parse(entry.updatedAt) > Date.parse(latest)) ? entry.updatedAt : latest
  ), null);
  return [{ id: 'shared-tax-note', notes, updatedAt }];
}
