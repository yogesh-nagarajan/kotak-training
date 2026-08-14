/* eslint-disable */
// One-off generator for content/nav.plain.html from extracted Kotak nav data.
// Icons are referenced by absolute Kotak CDN URL (verified hotlinkable);
// the logo is served locally from content/images.
import { writeFileSync } from 'fs';

const CDN = 'https://www.kotak.bank.in';
const icon = (p) => (p && p.startsWith('/') ? CDN + p : p);

// Top-level menus. `discover` is the megamenu heading label; each category has
// a label/href/icon and a list of {text, href, icon} links.
const MENUS = [
  {
    label: 'Personal', href: '/en/home.html', discover: 'Discover Personal',
    categories: [
      { label: 'Accounts', href: '/en/personal-banking/accounts/savings-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/saving-accounts.png', links: [
        { text: 'Savings Account', href: '/en/personal-banking/accounts/savings-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/saving-accounts.png' },
        { text: 'Salary Account', href: '/en/personal-banking/accounts/corporate-salary-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/solitaire.png' },
        { text: 'Private Banking', href: '/en/kotak-private.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/private-banking.png' },
        { text: 'Privy', href: '/en/privy.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/privy.png' },
        { text: 'Solitaire', href: '/en/solitaire.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/accounts/solitaire.svg' },
        { text: '3-in-1 Account', href: '/en/personal-banking/accounts/bank-demat-trading.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/3-in-1.png' },
      ] },
      { label: 'Cards', href: '/en/personal-banking/cards/credit-cards.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-cards/credit-card.svg', links: [
        { text: 'Credit Card', href: '/en/personal-banking/cards/credit-cards.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-cards/credit-card.svg' },
        { text: 'Debit Card', href: '/en/personal-banking/cards/debit-cards.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-cards/debit-card.svg' },
        { text: 'Forex Card', href: '/en/personal-banking/cards/prepaid-card/forex-card.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-cards/forex-card.svg' },
      ] },
      { label: 'Loans', href: '/en/personal-banking/loans/home-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/hl.png', links: [
        { text: 'Home Loan', href: '/en/personal-banking/loans/home-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/hl.png' },
        { text: 'Personal Loan', href: '/en/personal-banking/loans/personal-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/pl.svg' },
        { text: 'Car Loan', href: '/en/personal-banking/loans/car-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/car-loan.png' },
        { text: 'Gold Loan', href: '/en/personal-banking/loans/gold-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/gl.svg' },
        { text: 'Smart EMI', href: '/en/personal-banking/loans/smart-emi.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/smart-emi.png' },
        { text: 'Loan Against Property', href: '/en/business/loans/loan-against-property.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/lap.png' },
        { text: 'Other Loans', href: '/en/personal-banking/loans.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-loans/other-loan.svg' },
      ] },
      { label: 'Insurance', href: '/en/personal-banking/insurance/life-insurance.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-insurance/li.png', links: [
        { text: 'Life Insurance', href: '/en/personal-banking/insurance/life-insurance.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-insurance/li.png' },
        { text: 'Health Insurance', href: '/en/personal-banking/insurance/health-insurance.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-insurance/hi.png' },
        { text: 'Vehicle Insurance', href: '/en/personal-banking/insurance/car-insurance.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-insurance/vi.png' },
        { text: 'Travel Insurance', href: '/en/personal-banking/insurance/travel-insurance.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/export.png' },
      ] },
      { label: 'Investments', href: '/en/personal-banking/deposits.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-investments/deposits.svg', links: [
        { text: 'Deposits', href: '/en/personal-banking/deposits.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-investments/deposits.svg' },
        { text: 'Mutual Funds', href: '/en/personal-banking/investments/mutual-funds.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-investments/mf.png' },
        { text: 'ASBA Facility', href: '/en/personal-banking/investments/asba-facility.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-investments/asba.png' },
        { text: 'Demat Account', href: '/en/personal-banking/investments/demat-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-investments/demat.png' },
        { text: 'Government Schemes', href: '/en/personal-banking/investments/national-pension-system.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-investments/government.png' },
      ] },
      { label: 'Payments', href: '/en/personal-banking/cards/credit-cards/credit-card-services/kotak-billpay.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-payments/bill-payment.png', links: [
        { text: 'Bill Payments', href: '/en/personal-banking/cards/credit-cards/credit-card-services/kotak-billpay.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-payments/bill-payment.png' },
        { text: 'Fund Transfer', href: '/en/digital-banking/insta-services/money-transfer.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-payments/fund-transfer.png' },
        { text: 'FASTag', href: '/en/personal-banking/cards/prepaid-card/fastag.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-payments/fastag.png' },
        { text: 'Forex & Remittance', href: '/en/digital-banking/insta-services/send-money-abroad.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-payments/forex-remittance.svg' },
        { text: 'Wearable Payments', href: '/en/personal-banking/cards/wearable-payments.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-payments/wearable-payments.png' },
      ] },
    ],
  },
  {
    label: 'Business', href: '/en/business.html', discover: 'Discover Business',
    categories: [
      { label: 'Banking', href: '/en/business/accounts/current-accounts.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/banking/current-account.png', links: [
        { text: 'Current Account', href: '/en/business/accounts/current-accounts.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/banking/current-account.png' },
        { text: 'Retail Institution Account', href: '/en/business/accounts/retail-institutional-accounts.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/banking/retail-ins.png' },
        { text: 'Corporate Salary Solutions', href: '/en/personal-banking/accounts/corporate-salary-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/banking/corporate-sal.png' },
        { text: 'Privy Business', href: '/en/privy/business.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/banking/privy.png' },
        { text: 'Solitaire', href: '/en/solitaire/business.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/accounts/solitaire.svg' },
      ] },
      { label: 'Lending', href: '/en/business/loans/business-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/financing/bl.png', links: [
        { text: 'Business Loan', href: '/en/business/loans/business-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/financing/bl.png' },
        { text: 'Working Capital', href: '/en/business/working-capital.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/financing/working-capital.png' },
        { text: 'Business Credit Card', href: '/en/personal-banking/cards/credit-cards/business-credit-card.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/financing/bcc.png' },
        { text: 'Commercial Vehicle Loan', href: '/en/business/loans/commercial-vehicle-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/financing/commercial-vehicle.png' },
        { text: 'Commercial Equipment Loan', href: '/en/business/loans/construction-equipment.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/financing/commercial-equipment.png' },
        { text: 'Loan Against Property', href: '/en/business/loans/loan-against-property.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/financing/lap.png' },
      ] },
      { label: 'Payment', href: '/en/corporate/solutions.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/payments/payment-solution.svg', links: [
        { text: 'Payment Solutions', href: '/en/corporate/solutions.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/payments/payment-solution.svg' },
        { text: 'Loan/Utility Payment', href: 'https://hexagon.billdesk.com/hgapp-instapay/InstaPayController?BankID=KTK03', icon: '/content/dam/Kotak/svg-icons/navigation/business/payments/loan-utility.png' },
        { text: 'Fund Transfer', href: '/en/digital-banking/insta-services/money-transfer.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-payments/fund-transfer.png' },
        { text: 'Taxes', href: '/en/business/taxes.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/payments/taxes.png' },
      ] },
      { label: 'Trade', href: '/en/business/trade-services/domestic.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/domestic.png', links: [
        { text: 'Domestic', href: '/en/business/trade-services/domestic.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/domestic.png' },
        { text: 'International - Exports', href: '/en/business/trade-services/international-exports.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/export.png' },
        { text: 'International - Imports', href: '/en/business/trade-services/international-imports.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/import.png' },
        { text: 'Bank Guarantee', href: '/en/business/working-capital/non-fund-based/bank-guarantee.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/bank-gurantee.png' },
        { text: 'Letter Of Credit', href: '/en/business/working-capital/non-fund-based/letter-of-credit.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/letter-credit.png' },
        { text: 'Export Credit', href: '/en/business/working-capital/fund-based/export-credit.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/export-credit.png' },
      ] },
      { label: 'Corporate Solutions', href: '/en/corporate/cash-management-services.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/corporate-solution/cash-management.svg', links: [
        { text: 'Cash Management Services', href: '/en/corporate/cash-management-services.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/corporate-solution/cash-management.svg' },
        { text: 'Trade & Supply Chain Finance', href: '/en/corporate/trade-supply-chain-finance.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/corporate-solution/trade-spply-chain.png' },
        { text: 'Trade Service', href: '/en/corporate/trade-services.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/corporate-solution/trade-service.png' },
        { text: 'Sector Based Solutions', href: '/en/corporate/sector-expertise.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/corporate-solution/sector-based-solution.png' },
        { text: 'Corporate Accounts', href: '/en/corporate/sector-expertise.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/corporate-solution/corporate-account.png' },
      ] },
    ],
  },
  {
    label: 'NRI', href: '/en/personal-banking/nri.html', discover: 'Discover NRI',
    categories: [
      { label: 'Accounts', href: '/en/personal-banking/nri/accounts-deposits/saving-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/saving-accounts.png', links: [
        { text: 'Savings Account', href: '/en/personal-banking/nri/accounts-deposits/saving-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/saving-accounts.png' },
        { text: 'Current Account', href: '/en/business/accounts/current-accounts.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/banking/current-account.png' },
        { text: 'Privy', href: '/en/privy.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-accounts/privy.png' },
      ] },
      { label: 'Deposits', href: '/en/personal-banking/nri/accounts-deposits/deposits/nre-fixed-deposit.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/deposits/rupee.svg', links: [
        { text: 'NRE Fixed Deposit', href: '/en/personal-banking/nri/accounts-deposits/deposits/nre-fixed-deposit.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/deposits/rupee.svg' },
        { text: 'NRO Fixed Deposit', href: '/en/personal-banking/nri/accounts-deposits/deposits/nro-fixed-deposit.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/deposits/rupee.svg' },
        { text: 'FCNR Deposits', href: '/en/personal-banking/nri/accounts-deposits/deposits/fcnr-deposit.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/deposits/rupee.svg' },
      ] },
      { label: 'Investment & Insurance', href: '/en/personal-banking/investments/demat-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/investment-insurance/demat-account.svg', links: [
        { text: 'Demat Account', href: '/en/personal-banking/investments/demat-account.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/investment-insurance/demat-account.svg' },
        { text: 'Mutual Funds', href: '/en/personal-banking/investments/mutual-funds.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-investments/mf.png' },
      ] },
      { label: 'Money Transfer', href: '/en/personal-banking/nri/transfer-money/wire-transfer.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/export.png', links: [
        { text: 'Wire Transfer', href: '/en/personal-banking/nri/transfer-money/wire-transfer.html', icon: '/content/dam/Kotak/svg-icons/navigation/business/trade/export.png' },
      ] },
      { label: 'Cards', href: '/en/personal-banking/nri/cards/credit-cards.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-cards/credit-card.svg', links: [
        { text: 'Credit Cards', href: '/en/personal-banking/nri/cards/credit-cards.html', icon: '/content/dam/Kotak/svg-icons/navigation/personal-banking/pb-cards/credit-card.svg' },
      ] },
      { label: 'Loans', href: '/en/personal-banking/nri/loans/nri-home-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/loans/hl.svg', links: [
        { text: 'NRI Home Loan', href: '/en/personal-banking/nri/loans/nri-home-loan.html', icon: '/content/dam/Kotak/svg-icons/navigation/nri/loans/hl.svg' },
      ] },
    ],
  },
  {
    label: 'About Us', href: '/en/about-us.html', discover: 'Our Story',
    categories: [
      { label: 'Our Story', href: '/en/about-us.html', links: [] },
      { label: 'Investors', href: '/en/investor-relations.html', links: [] },
      { label: 'Careers', href: '/en/about-us/careers.html', links: [] },
      { label: 'Media Centre', href: '/en/about-us/media.html', links: [] },
    ],
  },
  {
    label: 'Learn', href: '/en/safe-banking.html', discover: 'Safe Banking',
    categories: [
      { label: 'Safe Banking', href: '/en/safe-banking.html', links: [] },
      { label: 'Digital Banking', href: '/en/digital-banking.html', links: [] },
      { label: 'Calculators', href: '/en/calculators.html', links: [] },
      { label: 'Financial Education', href: '/en/stories-in-focus.html', links: [] },
    ],
  },
  {
    label: 'Help', href: '/en/help-center.html', discover: 'Help Center',
    categories: [
      { label: 'Help Center', href: '/en/help-center.html', links: [] },
      { label: 'Service Requests', href: '/en/customer-service/service-request.html', links: [] },
      { label: 'Locate Us', href: '/en/reach-us.html', links: [] },
      { label: 'Call Us (1800 4100)', href: '/en/customer-service/contact-us.html', links: [] },
      { label: 'Complaints', href: '/en/customer-service/grievance-redressal.html', links: [] },
      { label: 'Download Forms', href: '/en/customer-service/download-forms.html', links: [] },
    ],
  },
];

const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ind = (n) => '  '.repeat(n);

function renderMenu(m) {
  const lines = [];
  lines.push(`${ind(3)}<li>`);
  lines.push(`${ind(4)}<a href="${m.href}">${esc(m.label)}</a>`);
  lines.push(`${ind(4)}<div>`);
  lines.push(`${ind(5)}<p><a href="${m.href}">${esc(m.discover)}</a></p>`);
  lines.push(`${ind(5)}<ul>`);
  m.categories.forEach((c) => {
    lines.push(`${ind(6)}<li>`);
    const catIcon = c.icon ? `<img src="${icon(c.icon)}" alt="">` : '';
    lines.push(`${ind(7)}<a href="${c.href}">${catIcon}${esc(c.label)}</a>`);
    if (c.links && c.links.length) {
      lines.push(`${ind(7)}<ul>`);
      c.links.forEach((l) => {
        const li = l.icon ? `<img src="${icon(l.icon)}" alt="">` : '';
        lines.push(`${ind(8)}<li><a href="${l.href}">${li}${esc(l.text)}</a></li>`);
      });
      lines.push(`${ind(7)}</ul>`);
    }
    lines.push(`${ind(6)}</li>`);
  });
  lines.push(`${ind(5)}</ul>`);
  lines.push(`${ind(4)}</div>`);
  lines.push(`${ind(3)}</li>`);
  return lines.join('\n');
}

const html = `<div>
  <p><a href="/en/home.html"><img src="images/kmbl-logo.svg" alt="Kotak Mahindra Bank"></a></p>
</div>
<div>
  <ul>
${MENUS.map(renderMenu).join('\n')}
  </ul>
</div>
<div>
  <ul>
    <li><a href="/en/search.html">Search</a></li>
    <li><a href="https://www.kotak.bank.in/en/login.html">Login</a></li>
  </ul>
</div>
`;

writeFileSync(new URL('../../content/nav.plain.html', import.meta.url), html, 'utf-8');
console.log('Wrote content/nav.plain.html —', MENUS.length, 'top menus,',
  MENUS.reduce((a, m) => a + m.categories.length, 0), 'categories.');
