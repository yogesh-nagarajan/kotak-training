import { moveInstrumentation } from '../../scripts/scripts.js';

let producttabInstanceCount = 0;

export default function decorate(block) {
  const items = [...block.children];
  const instanceId = block.id || `producttab-${producttabInstanceCount += 1}`;

  const tabs = document.createElement('div');
  tabs.className = 'producttab-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Products');

  const panels = document.createElement('div');
  panels.className = 'producttab-panels';

  items.forEach((item, index) => {
    const children = [...item.children];

    const tabLabel = children[0]?.textContent.trim() || `Product ${index + 1}`;
    const content = children[1];
    const actions = children[2];
    const image = children[3];

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'producttab-tab';
    tab.setAttribute('role', 'tab');
    tab.textContent = tabLabel;
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tab.setAttribute('aria-controls', `${instanceId}-panel-${index}`);
    tab.id = `${instanceId}-tab-${index}`;
    if (children[0]) moveInstrumentation(children[0], tab);

    const panel = document.createElement('div');
    panel.className = 'producttab-panel';
    panel.id = `${instanceId}-panel-${index}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    moveInstrumentation(item, panel);

    if (index !== 0) {
      panel.hidden = true;
    }

    if (content) {
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'producttab-content';
      moveInstrumentation(content, contentWrapper);

      while (content.firstElementChild) {
        contentWrapper.append(content.firstElementChild);
      }

      panel.append(contentWrapper);
    }

    if (actions) {
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'producttab-actions';
      moveInstrumentation(actions, actionsWrapper);

      while (actions.firstElementChild) {
        actionsWrapper.append(actions.firstElementChild);
      }

      panel.append(actionsWrapper);
    }

    if (image) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'producttab-image';
      moveInstrumentation(image, imageWrapper);

      while (image.firstElementChild) {
        imageWrapper.append(image.firstElementChild);
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
  });

  block.replaceChildren(tabs, panels);
}
