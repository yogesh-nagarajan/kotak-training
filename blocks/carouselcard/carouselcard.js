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
    // Assuming Universal Editor structure passes fields sequentially or as text divs
    const pretitleText = divs[0]?.textContent?.trim();
    const titleText = divs[1]?.textContent?.trim();
    const descText = divs[2]?.textContent?.trim();
    const tabsText = divs[3]?.textContent?.trim();

    if (pretitleText) {
      const pretitle = document.createElement('span');
      pretitle.className = 'pretitle';
      pretitle.textContent = pretitleText;
      headerDiv.appendChild(pretitle);
    }

    if (titleText) {
      const title = document.createElement('h2');
      title.className = 'title';
      title.textContent = titleText;
      headerDiv.appendChild(title);
    }

    if (descText) {
      const desc = document.createElement('p');
      desc.className = 'description';
      desc.textContent = descText;
      headerDiv.appendChild(desc);
    }

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

      // Extract Image
      const picture = cols[0]?.querySelector('picture');
      if (picture) {
        const bgWrapper = document.createElement('div');
        bgWrapper.className = 'card-background';
        bgWrapper.appendChild(picture);
        card.appendChild(bgWrapper);
      }

      // Extract Text Content & Link
      const contentDiv = document.createElement('div');
      contentDiv.className = 'card-content';

      cols.slice(1).forEach((col) => {
        while (col.firstChild) {
          contentDiv.appendChild(col.firstChild);
        }
      });

      card.appendChild(contentDiv);
      track.appendChild(card);
    }
  }

  container.appendChild(track);
  block.textContent = '';
  block.appendChild(container);
}
