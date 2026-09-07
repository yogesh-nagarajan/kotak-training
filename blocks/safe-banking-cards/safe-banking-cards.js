export default function decorate(block) {
  block.classList.add('safe-banking-cards');

  const rows = [...block.children];

  if (rows.length >= 1) {
    rows[0].classList.add('safe-banking-cards-header');
  }

  if (rows.length >= 2) {
    rows[1].classList.add('safe-banking-cards-items');
  }
}
