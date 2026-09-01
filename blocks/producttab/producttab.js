import { moveInstrumentation } from '../../scripts/scripts.js';

let producttabInstanceCount = 0;

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const instanceId = block.id || `producttab-${producttabInstanceCount += 1}`;

  let tabLabels = [];
  let itemRows = [];

  if (rows.length > 1) {
    const parentRow = rows[0];
    const parentTabsField = parentRow.children[0] || parentRow;
    const rawTabsText = parentTabsField?.textContent?.trim() || '';

    if (rawTabsText) {
      if (rawTabsText.includes('|')) {
        tabLabels = rawTabsText.split('|').map((t) => t.trim()).filter(Boolean);
      } else if (rawTabsText.includes('\n')) {
        tabLabels = rawTabsText.split('\n').map((t) => t.trim()).filter(Boolean);
      } else if (rawTabsText.includes(',')) {
        tabLabels = rawTabsText.split(',').map((t) => t.trim()).filter(Boolean);
      } else {
        tabLabels = [rawTabsText];
      }
    }
    itemRows = rows.slice(1);
  } else if (rows.length === 1) {
    const singleRow = rows[0];
    const rawText = singleRow.textContent?.trim() || '';
    if (rawText.includes('|')) {
      tabLabels = rawText.split('|').map((t) => t.trim()).filter(Boolean);
      itemRows = [];
    } else {
      itemRows = [singleRow];
    }
  }

  const count = Math.max(tabLabels.length, itemRows.length);
  if (count === 0) return;

  const tabs = document.createElement('div');
  tabs.className = 'producttab-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Products');

  const panels = document.createElement('div');
  panels.className = 'producttab-panels';

  for (let index = 0; index < count; index += 1) {
    const item = itemRows[index];
    const tabLabel = tabLabels[index]
      || item?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim()
      || `Product ${index + 1}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'producttab-tab';
    tab.setAttribute('role', 'tab');
    tab.textContent = tabLabel;
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tab.setAttribute('aria-controls', `${instanceId}-panel-${index}`);
    tab.id = `${instanceId}-tab-${index}`;

    const panel = document.createElement('div');
    panel.className = 'producttab-panel';
    panel.id = `${instanceId}-panel-${index}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    if (index !== 0) {
      panel.hidden = true;
    }

    if (item) {
      moveInstrumentation(item, panel);
      const cols = [...item.children];
      const content = cols[0];
      const actions = cols[1];
      const image = cols[2];

      if (content) {
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'producttab-content';
        moveInstrumentation(content, contentWrapper);

        while (content.firstChild) {
          contentWrapper.append(content.firstChild);
        }

        panel.append(contentWrapper);
      }

      if (actions) {
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'producttab-actions';
        moveInstrumentation(actions, actionsWrapper);

        while (actions.firstChild) {
          actionsWrapper.append(actions.firstChild);
        }

        panel.append(actionsWrapper);
      }

      if (image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'producttab-image';
        moveInstrumentation(image, imageWrapper);

        while (image.firstChild) {
          imageWrapper.append(image.firstChild);
        }

        panel.append(imageWrapper);
      }
    }

    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.producttab-tab').forEach((tabButton) => {
        tabButton.setAttribute('aria-selected', 'false');
      });

      panels.querySelectorAll('.producttab-panel').forEach((productPanel) => {
        productPanel.hidden = true;
      });

      tab.setAttribute('aria-selected', 'true');
      panel.hidden = false;
    });

    tab.addEventListener('keydown', (event) => {
      const tabButtons = [...tabs.querySelectorAll('.producttab-tab')];
      const currentIndex = tabButtons.indexOf(tab);
      let nextIndex;

      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabButtons.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabButtons.length - 1;

      if (nextIndex !== undefined) {
        event.preventDefault();
        tabButtons[nextIndex].focus();
        tabButtons[nextIndex].click();
      }
    });

    tabs.append(tab);
    panels.append(panel);
  }

  block.replaceChildren(tabs, panels);
}
