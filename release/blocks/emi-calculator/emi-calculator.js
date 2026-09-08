/**
 * EMI Calculator block.
 *
 * Authoring model groups three ranges (principal, interest, tenure) via element
 * grouping; each grouped cell delivers four numbers in order: min, max, step,
 * default. The block builds the interactive calculator and recomputes the EMI,
 * principal/interest split and donut chart live as the sliders move.
 */

const RED = '#ff0042';
const TRACK = '#e9e9e9';

/**
 * Read the 4 numbers (min, max, step, value) from a grouped range cell.
 * Element grouping delivers each value as its own child element (e.g. <p>), so
 * read one number per child; fall back to splitting on whitespace/newlines if
 * the values arrive as loose text.
 */
function readRange(cell, fallback) {
  let tokens = [];
  if (cell) {
    const children = [...cell.children];
    if (children.length) {
      tokens = children.map((el) => el.textContent.trim());
    } else {
      tokens = (cell.textContent || '').split(/\s+/);
    }
  }
  const nums = tokens
    .map((s) => String(s).replace(/[^0-9.-]/g, ''))
    .filter((s) => s !== '')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const [min, max, step, value] = nums;
  return {
    min: Number.isFinite(min) ? min : fallback.min,
    max: Number.isFinite(max) ? max : fallback.max,
    step: Number.isFinite(step) ? step : fallback.step,
    value: Number.isFinite(value) ? value : fallback.value,
  };
}

/** Format a number as Indian-grouped rupees, e.g. 2210000 -> ₹22,10,000. */
function formatRupees(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/** EMI = P·r·(1+r)^n / ((1+r)^n − 1), r monthly rate, n months. */
function computeEmi(principal, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / n;
  const pow = (1 + r) ** n;
  return (principal * r * pow) / (pow - 1);
}

/** Build one labelled slider row with a read-only value display. */
function buildControl(key, labelText, range, formatValue) {
  const control = document.createElement('div');
  control.className = 'emi-calculator-control';

  const label = document.createElement('label');
  label.className = 'emi-calculator-label';
  const name = document.createElement('span');
  name.className = 'emi-calculator-label-text';
  name.textContent = labelText;
  const valueOut = document.createElement('output');
  valueOut.className = 'emi-calculator-value';
  valueOut.textContent = formatValue(range.value);
  label.append(name, valueOut);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'emi-calculator-slider';
  slider.min = range.min;
  slider.max = range.max;
  slider.step = range.step;
  slider.value = range.value;
  slider.setAttribute('aria-label', labelText);
  slider.dataset.key = key;

  control.append(label, slider);
  return { control, slider, valueOut };
}

/** Paint the slider's filled portion to reflect its current value. */
function paintSlider(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const pct = max > min ? ((Number(slider.value) - min) / (max - min)) * 100 : 0;
  slider.style.background = `linear-gradient(to right, ${RED} ${pct}%, ${TRACK} ${pct}%)`;
}

export default function decorate(block) {
  const rows = [...block.children];
  const [principalCell, interestCell, tenureCell] = rows.map((row) => row.firstElementChild);

  const principal = readRange(principalCell, {
    min: 50000, max: 3500000, step: 5000, value: 2210000,
  });
  const interest = readRange(interestCell, {
    min: 10.99, max: 24.99, step: 0.5, value: 10.99,
  });
  const tenure = readRange(tenureCell, {
    min: 1, max: 6, step: 1, value: 5,
  });

  block.textContent = '';

  // header
  const header = document.createElement('div');
  header.className = 'emi-calculator-header';
  const heading = document.createElement('h2');
  heading.className = 'emi-calculator-title';
  heading.textContent = 'Personal Loan EMI Calculator';
  const subtitle = document.createElement('p');
  subtitle.className = 'emi-calculator-subtitle';
  subtitle.textContent = 'Use our Personal Loan Calculator to get insights on your loan plan!';
  header.append(heading, subtitle);

  // body: controls + chart + results
  const body = document.createElement('div');
  body.className = 'emi-calculator-body';

  const form = document.createElement('form');
  form.className = 'emi-calculator-form';
  form.addEventListener('submit', (e) => e.preventDefault());

  const p = buildControl('principal', 'Principal Amount', principal, formatRupees);
  const i = buildControl('interest', 'Interest Rate (% P.A.)', interest, (v) => `${v}%`);
  const t = buildControl('tenure', 'Tenure (in years)', tenure, (v) => `${v} ${v === 1 ? 'Year' : 'Years'}`);
  form.append(p.control, i.control, t.control);

  // donut chart
  const chart = document.createElement('div');
  chart.className = 'emi-calculator-chart';
  const donut = document.createElement('div');
  donut.className = 'emi-calculator-donut';
  chart.append(donut);

  // results / legend
  const results = document.createElement('div');
  results.className = 'emi-calculator-results';
  results.innerHTML = `
    <div class="emi-calculator-legend">
      <div class="emi-calculator-legend-item">
        <span class="emi-calculator-dot emi-calculator-dot-principal"></span>
        <span class="emi-calculator-legend-label">Principal Amount</span>
        <span class="emi-calculator-legend-value" data-out="principal"></span>
      </div>
      <div class="emi-calculator-legend-item">
        <span class="emi-calculator-dot emi-calculator-dot-interest"></span>
        <span class="emi-calculator-legend-label">Interest</span>
        <span class="emi-calculator-legend-value" data-out="interest"></span>
      </div>
    </div>
    <div class="emi-calculator-emi">
      <h3 class="emi-calculator-emi-label">Equated Monthly Installments (EMI)</h3>
      <p class="emi-calculator-emi-value" data-out="emi"></p>
    </div>`;

  body.append(form, chart, results);
  block.append(header, body);

  const principalOut = results.querySelector('[data-out="principal"]');
  const interestOut = results.querySelector('[data-out="interest"]');
  const emiOut = results.querySelector('[data-out="emi"]');

  function recalculate() {
    const pAmt = Number(p.slider.value);
    const rate = Number(i.slider.value);
    const yrs = Number(t.slider.value);

    const emi = computeEmi(pAmt, rate, yrs);
    const totalPayable = emi * yrs * 12;
    const totalInterest = Math.max(totalPayable - pAmt, 0);

    // value read-outs next to each slider
    p.valueOut.textContent = formatRupees(pAmt);
    i.valueOut.textContent = `${rate}%`;
    t.valueOut.textContent = `${yrs} ${yrs === 1 ? 'Year' : 'Years'}`;

    // results
    principalOut.textContent = formatRupees(pAmt);
    interestOut.textContent = formatRupees(totalInterest);
    emiOut.textContent = formatRupees(emi);

    // donut: principal share of total payable
    const principalPct = totalPayable > 0 ? (pAmt / totalPayable) * 100 : 0;
    donut.style.setProperty('--emi-principal-pct', principalPct.toFixed(2));

    [p.slider, i.slider, t.slider].forEach(paintSlider);
  }

  [p.slider, i.slider, t.slider].forEach((s) => s.addEventListener('input', recalculate));
  recalculate();
}
