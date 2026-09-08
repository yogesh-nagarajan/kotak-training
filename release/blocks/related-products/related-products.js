import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the related-products block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) {
    block.replaceChildren();
    return;
  }

  const ul = document.createElement('ul');

  rows.forEach((row) => {
    const cells = [...row.children];
    // positional cells: [image, text (title + description), knowMore, apply]
    const [imageCell, textCell, knowMoreCell, applyCell] = cells;

    const li = document.createElement('li');
    li.className = 'related-products-card';
    moveInstrumentation(row, li);

    // image
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'related-products-image';
    const img = imageCell?.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      imageWrapper.append(optimizedPic);
    }
    li.append(imageWrapper);

    // body: richtext with the title (first heading) + description paragraph(s)
    const body = document.createElement('div');
    body.className = 'related-products-body';

    if (textCell) {
      textCell.querySelector('h1, h2, h3, h4, h5, h6')?.classList.add('related-products-title');
      const desc = document.createElement('div');
      desc.className = 'related-products-desc';
      [...textCell.children].forEach((el) => {
        if (el.classList.contains('related-products-title')) body.append(el);
        else desc.append(el);
      });
      if (desc.children.length) body.append(desc);
    }

    // actions
    const actions = document.createElement('div');
    actions.className = 'related-products-actions';

    const knowMoreLink = knowMoreCell?.querySelector('a');
    if (knowMoreLink) {
      knowMoreLink.className = 'related-products-know-more';
      actions.append(knowMoreLink);
    }

    const applyLink = applyCell?.querySelector('a');
    if (applyLink) {
      applyLink.className = 'button primary related-products-apply';
      actions.append(applyLink);
    }

    if (actions.children.length) body.append(actions);
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
