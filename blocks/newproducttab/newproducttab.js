import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

function getLink(element) {
  if (!element) return '';

  const link = element.querySelector('a');

  if (link) {
    return link.href;
  }

  const value = getText(element);

  if (value.startsWith('http') || value.startsWith('/')) {
    return value;
  }

  return '';
}

function getImage(element) {
  if (!element) return null;

  return element.querySelector('picture, img');
}

function createTab(label, index) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'newproducttab-tab';
  button.textContent = label;
  button.setAttribute('aria-controls', `newproducttab-panel-${index}`);
  button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
  button.setAttribute('role', 'tab');

  if (index === 0) {
    button.classList.add('active');
  }

  return button;
}

function createCta(text, href, className) {
  if (!text) return null;

  const link = document.createElement('a');

  link.className = className;
  link.textContent = text;

  if (href) {
    link.href = href;
  }

  return link;
}

function createProductContent(product, index) {
  const panel = document.createElement('div');

  panel.className = 'newproducttab-panel';
  panel.id = `newproducttab-panel-${index}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');

  if (index !== 0) {
    panel.hidden = true;
  }

  const content = document.createElement('div');
  content.className = 'newproducttab-content';

  if (product.title) {
    const title = document.createElement('h2');

    title.textContent = product.title;
    content.append(title);
  }

  if (product.description) {
    const description = document.createElement('div');

    description.className = 'newproducttab-description';
    description.innerHTML = product.description;

    content.append(description);
  }

  const actions = document.createElement('div');

  actions.className = 'newproducttab-actions';

  const primaryCta = createCta(
    product.primaryCtaText,
    product.primaryCta,
    'newproducttab-primary-cta',
  );

  const secondaryCta = createCta(
    product.secondaryCtaText,
    product.secondaryCta,
    'newproducttab-secondary-cta',
  );

  if (primaryCta) {
    actions.append(primaryCta);
  }

  if (secondaryCta) {
    actions.append(secondaryCta);
  }

  if (actions.children.length > 0) {
    content.append(actions);
  }

  panel.append(content);

  if (product.image) {
    const imageWrapper = document.createElement('div');

    imageWrapper.className = 'newproducttab-image';

    const image = product.image.cloneNode(true);

    imageWrapper.append(image);
    panel.append(imageWrapper);
  }

  return panel;
}

export default function decorate(block) {
  const products = [];

  [...block.children].forEach((row) => {
    const fields = [...row.children];

    if (fields.length < 8) return;

    const product = {
      tabLabel: getText(fields[0]),
      title: getText(fields[1]),
      description: fields[2]?.innerHTML?.trim() || '',
      primaryCta: getLink(fields[3]),
      primaryCtaText: getText(fields[4]),
      secondaryCta: getLink(fields[5]),
      secondaryCtaText: getText(fields[6]),
      image: getImage(fields[7]),
      row,
    };

    products.push(product);
  });

  if (products.length === 0) {
    return;
  }

  const navigation = document.createElement('div');

  navigation.className = 'newproducttab-navigation';
  navigation.setAttribute('role', 'tablist');

  const panels = document.createElement('div');

  panels.className = 'newproducttab-panels';

  products.forEach((product, index) => {
    const tab = createTab(product.tabLabel, index);

    const panel = createProductContent(product, index);

    tab.addEventListener('click', () => {
      navigation.querySelectorAll('.newproducttab-tab').forEach((item, itemIndex) => {
        const isActive = itemIndex === index;

        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.querySelectorAll('.newproducttab-panel').forEach((item, itemIndex) => {
        const isActive = itemIndex === index;

        item.hidden = !isActive;
        item.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
    });

    navigation.append(tab);
    panels.append(panel);

    moveInstrumentation(product.row, panel);
  });

  block.replaceChildren(navigation, panels);
}
