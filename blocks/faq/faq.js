import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the faq — an expandable list of questions.
 * Each item starts collapsed; clicking a question toggles its answer.
 * Multiple items can be open at once.
 * @param {Element} block The faq block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row, i) => {
    const cells = [...row.children];

    // header row: a single cell containing a heading — leave it as-is
    const isHeader = cells.length === 1 && cells[0].querySelector('h1, h2, h3, h4, h5, h6');
    if (isHeader) {
      row.classList.add('faq-header');
      while (row.firstElementChild.firstElementChild) {
        row.append(row.firstElementChild.firstElementChild);
      }
      row.firstElementChild.remove();
      return;
    }

    // Q&A row: first cell is the question, second is the answer
    const questionCell = cells[0];
    const answerCell = cells[1];
    const item = document.createElement('div');
    item.className = 'faq-item';
    moveInstrumentation(row, item);

    // trigger (clickable question)
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'faq-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    const panelId = `faq-answer-${i}`;
    trigger.setAttribute('aria-controls', panelId);
    const label = document.createElement('span');
    label.className = 'faq-question';
    const heading = questionCell?.querySelector('h1, h2, h3, h4, h5, h6');
    label.textContent = heading
      ? heading.textContent.trim()
      : (questionCell?.textContent.trim() || '');
    trigger.append(label);

    // answer panel (collapsed by default)
    const panel = document.createElement('div');
    panel.className = 'faq-answer';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    const panelInner = document.createElement('div');
    panelInner.className = 'faq-answer-inner';
    if (answerCell) {
      [...answerCell.children].forEach((el) => panelInner.append(el));
      if (!panelInner.children.length && answerCell.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = answerCell.textContent.trim();
        panelInner.append(p);
      }
    }
    panel.append(panelInner);

    trigger.addEventListener('click', () => {
      const open = item.classList.toggle('faq-open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    item.append(trigger, panel);
    row.replaceWith(item);
  });
}
