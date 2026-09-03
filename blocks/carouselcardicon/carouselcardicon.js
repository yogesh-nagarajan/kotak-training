import { moveInstrumentation } from '../../scripts/scripts.js';

function transferInstrumentation(sourceRow, targetEl) {
  if (!sourceRow || !targetEl) return;
  const cell = sourceRow.firstElementChild || sourceRow;
  if (
    [...cell.attributes].some(
      (a) => a.nodeName.startsWith('data-aue-') || a.nodeName.startsWith('data-richtext-'),
    )
  ) {
    moveInstrumentation(cell, targetEl);
  } else if (
    [...sourceRow.attributes].some(
      (a) => a.nodeName.startsWith('data-aue-') || a.nodeName.startsWith('data-richtext-'),
    )
  ) {
    moveInstrumentation(sourceRow, targetEl);
  }
}

export default function decorate(block) {
  block.classList.add('carouselcardicon', 'carousel-card-icon');

  // Collect all child rows/cells from authoring output
  const rows = [...block.children];
  if (!rows.length) return;

  // Extract author inputs dynamically
  const labelRow = rows[0];
  const titleRow = rows[1];

  const labelText = labelRow?.textContent?.trim() || '';
  const titleText = titleRow?.textContent?.trim() || '';

  // Header section setup
  const header = document.createElement('div');
  header.className = 'carouselcardicon-header';

  if (labelText) {
    const labelElement = document.createElement('p');
    labelElement.className = 'carouselcardicon-label';
    labelElement.textContent = labelText;
    transferInstrumentation(labelRow, labelElement);
    header.append(labelElement);
  }

  if (titleText) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'carouselcardicon-title';
    const titleParts = titleText.split('. ');
    if (titleParts.length > 1) {
      titleElement.innerHTML = `${titleParts[0]}.<br>${titleParts.slice(1).join('. ')}`;
    } else {
      titleElement.textContent = titleText;
    }
    transferInstrumentation(titleRow, titleElement);
    header.append(titleElement);
  }

  // Cards container setup
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'carouselcardicon-cards';

  // Process authored cards (Group items in chunks of 3: Title, Description, Button)
  const cardRows = rows.slice(2);
  for (let i = 0; i < cardRows.length; i += 3) {
    const cardTitleRow = cardRows[i];
    const cardDescRow = cardRows[i + 1];
    const cardBtnRow = cardRows[i + 2];

    const cardTitleText = cardTitleRow?.textContent?.trim() || '';
    const cardDescText = cardDescRow?.textContent?.trim() || '';
    
    // Check for explicit link or raw text button label
    const linkEl = cardBtnRow?.querySelector('a');
    const cardBtnText = linkEl?.textContent?.trim() || cardBtnRow?.textContent?.trim() || '';
    const cardBtnHref = linkEl?.getAttribute('href') || '#';

    if (cardTitleText || cardDescText || cardBtnText) {
      const card = document.createElement('article');
      card.className = 'carouselcardicon-card';

      // Icon element
      const icon = document.createElement('div');
      icon.className = 'carouselcardicon-icon';
      icon.innerHTML = `
        <span></span>
        <span></span>
      `;

      // Title element
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'carouselcardicon-card-title';
      cardTitle.textContent = cardTitleText;
      if (cardTitleRow) transferInstrumentation(cardTitleRow, cardTitle);

      // Description element
      const description = document.createElement('p');
      description.className = 'carouselcardicon-card-description';
      description.textContent = cardDescText;
      if (cardDescRow) transferInstrumentation(cardDescRow, description);

      // Button element
      const button = document.createElement('a');
      button.className = 'carouselcardicon-button';
      button.href = cardBtnHref;
      button.textContent = cardBtnText || 'Know The Signs';
      if (cardBtnRow) transferInstrumentation(cardBtnRow, button);

      card.append(icon, cardTitle, description, button);
      cardsContainer.append(card);
    }
  }

  block.replaceChildren(header, cardsContainer);
}