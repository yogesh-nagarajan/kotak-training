export default function decorate(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'carouselcard-container';

  // 1. Process Main Header & Tabs (Row 0)
  const headerRow = rows[0];
  const headerDiv = document.createElement('div');
  headerDiv.className = 'carouselcard-header';

  if (headerRow) {
    const divs = [...headerRow.children];
    const pretitleText = divs[0]?.textContent?.trim();
    const titleText = divs[1]?.textContent?.trim();
    const descText = divs[2]?.textContent?.trim();
    const tabsText = divs[3]?.textContent?.trim();

    // Group text elements vertically in a left column container
    const textContentDiv = document.createElement('div');
    textContentDiv.className = 'carouselcard-text-content';

    if (pretitleText) {
      const pretitle = document.createElement('span');
      pretitle.className = 'pretitle';
      pretitle.textContent = pretitleText;
      textContentDiv.appendChild(pretitle);
    }

    if (titleText) {
      const title = document.createElement('h2');
      title.className = 'title';
      title.textContent = titleText;
      textContentDiv.appendChild(title);
    }

    if (descText) {
      const desc = document.createElement('p');
      desc.className = 'description';
      desc.textContent = descText;
      textContentDiv.appendChild(desc);
    }

    headerDiv.appendChild(textContentDiv);

    // Process Navigation Tabs on the right
    if (tabsText) {
      const tabsWrapper = document.createElement('div');
      tabsWrapper.className = 'carouselcard-tabs';
      tabsText.split('|').forEach((tabName, index) => {
        const button = document.createElement('button');
        button.className = index === 0 ? 'tab-btn active' : 'tab-btn';
        button.textContent = tabName.trim();
        tabsWrapper.appendChild(button);
      });
      headerDiv.appendChild(tabsWrapper);
    }
  }

  container.appendChild(headerDiv);

  // 2. Process Child Cards (Remaining rows)
  const track = document.createElement('div');
  track.className = 'carouselcard-track';

  for (let i = 1; i < rows.length; i += 1) {
    const itemRow = rows[i];
    if (itemRow) {
      const card = document.createElement('div');
      card.className = 'carouselcard-item';

      const cols = [...itemRow.children];

      // Extract Background Image
      const picture = cols[0]?.querySelector('picture');
      if (picture) {
        const bgWrapper = document.createElement('div');
        bgWrapper.className = 'card-background';
        bgWrapper.appendChild(picture);
        card.appendChild(bgWrapper);
      }

      // Extract Card Content explicitly to match CSS targets
      const contentDiv = document.createElement('div');
      contentDiv.className = 'card-content';

      const cardTitleText = cols[1]?.textContent?.trim();
      const cardDescText = cols[2]?.textContent?.trim();
      const cardCtaText = cols[3]?.textContent?.trim();

      if (cardTitleText) {
        const h3 = document.createElement('h3');
        h3.textContent = cardTitleText;
        contentDiv.appendChild(h3);
      }

      if (cardDescText) {
        const p = document.createElement('p');
        p.textContent = cardDescText;
        contentDiv.appendChild(p);
      }

      if (cardCtaText) {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = cardCtaText;
        contentDiv.appendChild(a);
      }

      card.appendChild(contentDiv);
      track.appendChild(card);
    }
  }

  container.appendChild(track);
  block.textContent = '';
  block.appendChild(container);
}
