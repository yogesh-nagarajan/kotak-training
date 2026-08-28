export default function decorate(block) {
  const rows = [...block.children];

  // First row = section heading
  if (rows.length > 0) {
    rows[0].classList.add('safe-banking-intro');
  }

  // Remaining rows = cards
  rows.slice(1).forEach((row) => {
    row.classList.add('safe-banking-card');

    const cells = [...row.children];

    if (cells[0]) {
      cells[0].classList.add('safe-banking-icon');
    }

    if (cells[1]) {
      cells[1].classList.add('safe-banking-title');
    }

    if (cells[2]) {
      cells[2].classList.add('safe-banking-description');
    }

    if (cells[3]) {
      cells[3].classList.add('safe-banking-button');
    }
  });
}
