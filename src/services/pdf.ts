import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { formatCurrency } from '@/utils/formatters';

type QuarterPdfRow = {
  quarter: string;
  range: string;
  hasData: boolean;
  grossIncome: number;
  estimatedTax: number;
};

export type TaxSummaryPdfPayload = {
  year: number;
  currencyCode?: string;
  totalIncome: number;
  totalTax: number;
  quartersFiled: number;
  quarterRows: QuarterPdfRow[];
  nextDeadlineTitle?: string | null;
  nextDeadlineDate?: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildTaxSummaryHtml(payload: TaxSummaryPdfPayload): string {
  const currency = payload.currencyCode ?? 'USD';
  const generatedAt = new Date().toLocaleString();
  const netKept = payload.totalIncome - payload.totalTax;

  const rows = payload.quarterRows
    .map((row) => {
      const income = row.hasData ? formatCurrency(row.grossIncome, currency) : '-';
      const tax = row.hasData ? formatCurrency(row.estimatedTax, currency) : '-';
      const status = row.hasData ? 'Filed' : 'Pending';
      return `
        <tr>
          <td>${escapeHtml(row.quarter)}</td>
          <td>${escapeHtml(row.range)}</td>
          <td>${escapeHtml(status)}</td>
          <td class="amount">${escapeHtml(income)}</td>
          <td class="amount tax">${escapeHtml(tax)}</td>
        </tr>
      `;
    })
    .join('');

  const nextDeadline = payload.nextDeadlineTitle
    ? `<div class="deadline"><strong>Next deadline:</strong> ${escapeHtml(payload.nextDeadlineTitle)} - ${escapeHtml(payload.nextDeadlineDate ?? '')}</div>`
    : '';

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>GigTax Alert Tax Summary ${payload.year}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #101828; margin: 0; padding: 28px; background: #fff; }
      .header { background: linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%); color: #fff; border-radius: 14px; padding: 20px; margin-bottom: 20px; }
      .title { margin: 0; font-size: 26px; font-weight: 700; }
      .subtitle { margin-top: 6px; opacity: 0.9; font-size: 14px; }
      .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
      .card { border: 1px solid #E4E7EC; border-radius: 12px; padding: 12px; background: #F9FAFB; }
      .label { font-size: 12px; color: #475467; margin-bottom: 6px; }
      .value { font-size: 18px; font-weight: 700; color: #101828; }
      .value.tax { color: #B42318; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border-bottom: 1px solid #EAECF0; padding: 10px 8px; font-size: 13px; text-align: left; }
      th { color: #475467; font-weight: 600; background: #F9FAFB; }
      td.amount { text-align: right; font-variant-numeric: tabular-nums; }
      td.tax { color: #B42318; font-weight: 600; }
      .deadline { margin-top: 14px; padding: 10px 12px; border-radius: 10px; background: #FFFAEB; border: 1px solid #FEC84B; color: #7A2E0E; font-size: 13px; }
      .footer { margin-top: 20px; font-size: 11px; color: #667085; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1 class="title">GigTax Alert - Tax Summary</h1>
      <div class="subtitle">${payload.year} Overview • Generated ${escapeHtml(generatedAt)}</div>
    </div>

    <div class="cards">
      <div class="card"><div class="label">Total income</div><div class="value">${escapeHtml(formatCurrency(payload.totalIncome, currency))}</div></div>
      <div class="card"><div class="label">Total tax owed</div><div class="value tax">${escapeHtml(formatCurrency(payload.totalTax, currency))}</div></div>
      <div class="card"><div class="label">Net kept</div><div class="value">${escapeHtml(formatCurrency(netKept, currency))}</div></div>
      <div class="card"><div class="label">Quarters filed</div><div class="value">${payload.quartersFiled} / 4</div></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Quarter</th>
          <th>Range</th>
          <th>Status</th>
          <th style="text-align:right;">Income</th>
          <th style="text-align:right;">Tax</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    ${nextDeadline}

    <div class="footer">
      This report is an estimate for planning purposes only. Consult a qualified tax professional for advice specific to your situation.
    </div>
  </body>
</html>`;
}

export async function generateTaxSummaryPdf(payload: TaxSummaryPdfPayload): Promise<string> {
  const html = buildTaxSummaryHtml(payload);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const targetUri = `${FileSystem.cacheDirectory}Tax_File.pdf`;
  const existing = await FileSystem.getInfoAsync(targetUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(targetUri, { idempotent: true });
  }
  await FileSystem.copyAsync({
    from: uri,
    to: targetUri,
  });

  return targetUri;
}

export async function shareTaxSummaryPdf(payload: TaxSummaryPdfPayload): Promise<void> {
  const uri = await generateTaxSummaryPdf(payload);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Tax Summary PDF',
    UTI: 'com.adobe.pdf',
  });
}
