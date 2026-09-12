import { moveInstrumentation } from '../../scripts/scripts.js';

let producttabInstanceCount = 0;

function getProductTabItems(block) {
  const directItems = [...block.querySelectorAll('.producttab-item.block')];
  if (directItems.length) return directItems;

  return [...block.querySelectorAll('.producttab-item')];
}

function getField(item, fieldName) {
  if (!item) return null;

  return item.querySelector(`.${fieldName}, [data-aue-prop="${fieldName}"], [name="${fieldName}"]`);
}

export default function decorate(block) {
  const items = getProductTabItems(block);
  if (!items.length) return;

  const instanceId = block.id || `producttab-${producttabInstanceCount += 1}`;
  const tabs = document.createElement('div');
  const panels = document.createElement('div');

  tabs.className = 'producttab-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Products');

  panels.className = 'producttab-panels';

  items.forEach((item, index) => {
    const tabLabelField = getField(item, 'tabLabel');
    const contentField = getField(item, 'content');
    const actionsField = getField(item, 'actions');
    const imageField = getField(item, 'image');
    const tabLabel = tabLabelField?.textContent?.trim() || `Tab ${index + 1}`;

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

    if (index !== 0) panel.hidden = true;

    if (contentField) {
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'producttab-content';
      moveInstrumentation(contentField, contentWrapper);

      while (contentField.firstChild) {
        contentWrapper.append(contentField.firstChild);
      }

      panel.append(contentWrapper);
    }

    if (actionsField) {
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'producttab-actions';
      moveInstrumentation(actionsField, actionsWrapper);

      while (actionsField.firstChild) {
        actionsWrapper.append(actionsField.firstChild);
      }

      panel.append(actionsWrapper);
    }

    if (imageField) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'producttab-image';
      moveInstrumentation(imageField, imageWrapper);

      while (imageField.firstChild) {
        imageWrapper.append(imageField.firstChild);
      }

      panel.append(imageWrapper);
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

      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabButtons.length;
      }
      if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      }
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
  });

  block.replaceChildren(tabs, panels);
}
