import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the FAQ block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Build the accordion list before mutating the block.
  const list = document.createElement('div');
  list.className = 'faq-list';

  rows.forEach((row, index) => {
    const cells = [...row.children];
    const questionCell = cells[0];
    const answerCell = cells[1];

    // Skip rows that have no question text.
    const questionText = questionCell ? questionCell.textContent.trim() : '';
    if (!questionText) return;

    const item = document.createElement('div');
    item.className = 'faq-item';
    moveInstrumentation(row, item);

    const questionId = `faq-question-${index}`;
    const answerId = `faq-answer-${index}`;

    const button = document.createElement('button');
    button.className = 'faq-question';
    button.type = 'button';
    button.id = questionId;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', answerId);

    const label = document.createElement('span');
    label.className = 'faq-question-text';
    label.textContent = questionText;

    const chevron = document.createElement('span');
    chevron.className = 'faq-chevron';
    chevron.setAttribute('aria-hidden', 'true');

    button.append(label, chevron);

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.id = answerId;
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', questionId);
    if (answerCell) {
      while (answerCell.firstChild) answer.append(answerCell.firstChild);
    }

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      if (isOpen) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        // Force reflow so the transition animates from the current height.
        requestAnimationFrame(() => {
          answer.style.maxHeight = '0px';
        });
        item.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });

    // Reset inline max-height once the open transition completes so nested
    // content changes don't get clipped.
    answer.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'max-height') return;
      if (item.classList.contains('open')) {
        answer.style.maxHeight = 'none';
      }
    });

    item.append(button, answer);
    list.append(item);
  });

  // Search field filters items by question text.
  const search = document.createElement('div');
  search.className = 'faq-search';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search FAQs';
  input.setAttribute('aria-label', 'Search FAQs');
  search.append(input);

  const noResults = document.createElement('p');
  noResults.className = 'faq-no-results';
  noResults.textContent = 'No matching questions found.';
  noResults.hidden = true;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;
    list.querySelectorAll('.faq-item').forEach((item) => {
      const text = item.querySelector('.faq-question-text');
      const match = !query
        || (text && text.textContent.toLowerCase().includes(query));
      item.hidden = !match;
      if (match) visibleCount += 1;
    });
    noResults.hidden = visibleCount !== 0;
  });

  block.replaceChildren(search, list, noResults);
}
