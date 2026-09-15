export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const getVal = (index) => (rows[index] ? rows[index].textContent.trim() : '');
  const getImgSrc = (index) => {
    const img = rows[index] ? rows[index].querySelector('img') : null;
    return img ? img.src : getVal(index);
  };

  // Section Header
  const pretitle = getVal(0);
  const title = getVal(1);

  // Column 1 (Featured)
  const c1Bg = getImgSrc(3);
  const c1Icon = getImgSrc(4);
  const c1Eyebrow = getVal(5);
  const c1Title = getVal(6);
  const c1Desc = getVal(7);
  const c1CtaText = getVal(8);
  const c1CtaLink = getVal(9);

  // Column 2 (Top 45% & Bottom 45%)
  const c2TopIcon = getImgSrc(10);
  const c2TopEyebrow = getVal(11);
  const c2TopTitle = getVal(12);
  const c2TopLink = getVal(13);

  const c2BotIcon = getImgSrc(14);
  const c2BotEyebrow = getVal(15);
  const c2BotTitle = getVal(16);
  const c2BotLink = getVal(17);

  // Column 3 (Top 40%, Middle 40%, Bottom 10%)
  const c3M1Bg = getImgSrc(18);
  const c3M1Icon = getImgSrc(19);
  const c3M1Eyebrow = getVal(20);
  const c3M1Title = getVal(21);
  const c3M1Link = getVal(22);

  const c3M2Icon = getImgSrc(23);
  const c3M2Eyebrow = getVal(24);
  const c3M2Title = getVal(25);
  const c3M2Link = getVal(26);

  const c3CompIcon = getImgSrc(27);
  const c3CompTitle = getVal(28);
  const c3CompLink = getVal(29);

  block.innerHTML = `
    ${pretitle || title ? `
      <div class="bento-header">
        ${pretitle ? `<span class="bento-pretitle">${pretitle}</span>` : ''}
        ${title ? `<h2 class="bento-title">${title}</h2>` : ''}
      </div>` : ''}

    <div class="bento-wrapper">
      <!-- COLUMN 1: Featured Card (100% Height) -->
      <div class="bento-col bento-col-1">
        <div class="bento-card bento-card-featured" style="${c1Bg ? `background-image: url('${c1Bg}'); background-size: cover; background-position: center;` : ''}">
          <div class="bento-card-content">
            ${c1Eyebrow ? `<span class="bento-eyebrow">${c1Eyebrow}</span>` : ''}
            ${c1Title ? `<h3 class="bento-card-title">${c1Title}</h3>` : ''}
            ${c1Desc ? `<p class="bento-card-desc">${c1Desc}</p>` : ''}
          </div>
          ${c1Icon ? `<div class="bento-card-emblem"><img src="${c1Icon}" alt="" /></div>` : ''}
          ${c1CtaText ? `
            <div class="bento-card-cta">
              <a href="${c1CtaLink || '#'}" class="bento-btn-pill">
                <span>${c1CtaText}</span>
              </a>
            </div>` : ''}
        </div>
      </div>

      <!-- COLUMN 2: Two Standard Cards (45% Each, 10% Gap) -->
      <div class="bento-col bento-col-2">
        <${c2TopLink ? `a href="${c2TopLink}"` : 'div'} class="bento-card bento-card-std">
          ${c2TopIcon ? `<span class="bento-card-icon"><img src="${c2TopIcon}" alt="" /></span>` : ''}
          <div class="bento-card-body">
            ${c2TopEyebrow ? `<span class="bento-eyebrow">${c2TopEyebrow}</span>` : ''}
            ${c2TopTitle ? `<h4 class="bento-card-heading">${c2TopTitle}</h4>` : ''}
          </div>
        </${c2TopLink ? 'a' : 'div'}>

        <${c2BotLink ? `a href="${c2BotLink}"` : 'div'} class="bento-card bento-card-std">
          ${c2BotIcon ? `<span class="bento-card-icon"><img src="${c2BotIcon}" alt="" /></span>` : ''}
          <div class="bento-card-body">
            ${c2BotEyebrow ? `<span class="bento-eyebrow">${c2BotEyebrow}</span>` : ''}
            ${c2BotTitle ? `<h4 class="bento-card-heading">${c2BotTitle}</h4>` : ''}
          </div>
        </${c2BotLink ? 'a' : 'div'}>
      </div>

      <!-- COLUMN 3: Two Mini Cards (40% Each) + One Compact Card (10%) -->
      <div class="bento-col bento-col-3">
        <${c3M1Link ? `a href="${c3M1Link}"` : 'div'} class="bento-card bento-card-mini" style="${c3M1Bg ? `background-image: url('${c3M1Bg}'); background-size: cover; background-position: center;` : ''}">
          ${c3M1Icon ? `<span class="bento-card-icon"><img src="${c3M1Icon}" alt="" /></span>` : ''}
          <div class="bento-card-body">
            ${c3M1Eyebrow ? `<span class="bento-eyebrow">${c3M1Eyebrow}</span>` : ''}
            ${c3M1Title ? `<h4 class="bento-card-heading">${c3M1Title}</h4>` : ''}
          </div>
        </${c3M1Link ? 'a' : 'div'}>

        <${c3M2Link ? `a href="${c3M2Link}"` : 'div'} class="bento-card bento-card-mini">
          ${c3M2Icon ? `<span class="bento-card-icon"><img src="${c3M2Icon}" alt="" /></span>` : ''}
          <div class="bento-card-body">
            ${c3M2Eyebrow ? `<span class="bento-eyebrow">${c3M2Eyebrow}</span>` : ''}
            ${c3M2Title ? `<h4 class="bento-card-heading">${c3M2Title}</h4>` : ''}
          </div>
        </${c3M2Link ? 'a' : 'div'}>

        <${c3CompLink ? `a href="${c3CompLink}"` : 'div'} class="bento-card bento-card-compact">
          ${c3CompTitle ? `<h4 class="bento-card-heading">${c3CompTitle}</h4>` : ''}
          ${c3CompIcon ? `<span class="bento-card-icon"><img src="${c3CompIcon}" alt="" /></span>` : ''}
        </${c3CompLink ? 'a' : 'div'}>
      </div>
    </div>
  `;
}
