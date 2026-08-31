export default function decorate(block) {
  const rows = [...block.children];

  const getValue = (index, fallback = '') => {
    if (!rows[index]) return fallback;

    const value = rows[index].textContent.trim();

    return value || fallback;
  };

  const label = getValue(0, 'Safe Banking Tips');
  const title = getValue(1, 'Stay informed. Stay scam-free.');

  const cards = [
    {
      title: getValue(2, 'Verify stays before you pay.'),
      description: getValue(
        3,
        'Fake hotel or rental listings can look real. Check the source before booking.',
      ),
      button: getValue(4, 'Know The Signs'),
    },
    {
      title: getValue(
        5,
        'Discount links that lead to fake payment pages',
      ),
      description: getValue(
        6,
        'A “too good to be true” discount link can redirect you to fake payment pages that steal your money instantly.',
      ),
      button: getValue(7, 'Know The Signs'),
    },
    {
      title: getValue(
        8,
        'Check the source before you scan',
      ),
      description: getValue(
        9,
        'Scanning unknown QR codes can lead to money going out of your account—not coming in.',
      ),
      button: getValue(10, 'Know The Signs'),
    },
    {
      title: getValue(
        11,
        'Save card details only when it’s secure',
      ),
      description: getValue(
        12,
        'Saving your card details on unsecured websites can make you an easy target for unauthorised transactions.',
      ),
      button: getValue(13, 'Know The Signs'),
    },
  ];

  block.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'carouselcardicon-header';

  const labelElement = document.createElement('p');
  labelElement.className = 'carouselcardicon-label';
  labelElement.textContent = label;

  const titleElement = document.createElement('h2');
  titleElement.className = 'carouselcardicon-title';

  const titleParts = title.split('. ');

  if (titleParts.length > 1) {
    titleElement.innerHTML = `${titleParts[0]}.<br>${titleParts.slice(1).join('. ')}`;
  } else {
    titleElement.textContent = title;
  }

  header.append(labelElement, titleElement);

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'carouselcardicon-cards';

  cards.forEach((cardData) => {
    const card = document.createElement('article');
    card.className = 'carouselcardicon-card';

    const icon = document.createElement('div');
    icon.className = 'carouselcardicon-icon';

    icon.innerHTML = `
      <span></span>
      <span></span>
    `;

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'carouselcardicon-card-title';
    cardTitle.textContent = cardData.title;

    const description = document.createElement('p');
    description.className = 'carouselcardicon-card-description';
    description.textContent = cardData.description;

    const button = document.createElement('a');
    button.className = 'carouselcardicon-button';
    button.href = '#';
    button.textContent = cardData.button;

    card.append(
      icon,
      cardTitle,
      description,
      button,
    );

    cardsContainer.append(card);
  });

  block.append(header, cardsContainer);
}
