function searchRules() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let accordions = document.querySelectorAll('.accordion, .sub-accordion');
    let sections = document.querySelectorAll('.accordion-content p, .accordion-content table');

    accordions.forEach((acc) => {
        acc.open = false; // Összecsukás alapból
    });

    sections.forEach((section) => {
        if (section.textContent.toLowerCase().includes(input)) {
            section.parentElement.parentElement.open = true; // Nyitás ha találat
            section.style.backgroundColor = 'rgba(255, 215, 0, 0.2)'; // Highlight
        } else {
            section.style.backgroundColor = ''; // Eltávolítás
        }
    });
}