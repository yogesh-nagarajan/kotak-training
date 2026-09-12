export default function decorate(block) {
  block.classList.add('safe-banking-card');

  const rows = [...block.children];

  if (rows[0]) {
    rows[0].classList.add('safe-banking-card-image');
  }

  if (rows[1]) {
    rows[1].classList.add('safe-banking-card-title');
  }

  if (rows[2]) {
    rows[2].classList.add('safe-banking-card-text');
  }

  if (rows[3]) {
    rows[3].classList.add('safe-banking-card-button-label');
  }

  if (rows[4]) {
    rows[4].classList.add('safe-banking-card-button-link');
  }
}
