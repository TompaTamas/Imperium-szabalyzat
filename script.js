// DOM elemek betöltődésének várása
document.addEventListener('DOMContentLoaded', function() {
    initializeRulebook();
});

// Fő inicializáló függvény
function initializeRulebook() {
    initializeSearchFunction();
    initializeAnimations();
    addEventListeners();
}

// Globális toggle függvény
window.toggleSection = function(sectionId) {
    const content = document.getElementById(sectionId);
    const header = content?.previousElementSibling;
    const toggleIcon = header?.querySelector('.toggle-icon');
    
    if (!content || !header || !toggleIcon) return;
    
    const isCurrentlyOpen = content.classList.contains('active');
    
    if (isCurrentlyOpen) {
        // Bezárás
        content.classList.remove('active');
        toggleIcon.classList.remove('active');
        toggleIcon.textContent = '+';
        header.setAttribute('aria-expanded', 'false');
        
        // Stílus beállítások a bezáráshoz
        content.style.maxHeight = '0px';
        content.style.padding = '0 25px';
        content.style.overflow = 'hidden';
        
    } else {
        // Kinyitás
        content.classList.add('active');
        toggleIcon.classList.add('active');
        toggleIcon.textContent = '−';
        header.setAttribute('aria-expanded', 'true');
        
        // Stílus beállítások a kinyitáshoz
        content.style.maxHeight = content.scrollHeight + 50 + 'px'; // extra hely a paddingnek
        content.style.padding = '25px';
        content.style.overflow = 'visible';
        
        // Smooth scroll a szekcióhoz
        setTimeout(() => {
            header.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }, 100);
    }
};

// Keresési funkció inicializálása
function initializeSearchFunction() {
    const searchInput = document.getElementById('searchInput');
    const ruleSections = document.querySelectorAll('.rule-section');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value.trim().toLowerCase());
        }, 300); // Debounce 300ms
    });
    
    // Keresés törlése Escape gombbal
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            performSearch('');
            this.blur();
        }
    });
}

// Keresés végrehajtása
function performSearch(searchTerm) {
    const ruleSections = document.querySelectorAll('.rule-section');
    const searchResults = [];
    
    // Korábbi kiemelések eltávolítása
    removeHighlights();
    
    if (searchTerm === '') {
        // Üres keresés - minden szekció megjelenítése
        ruleSections.forEach(section => {
            section.style.display = 'block';
            section.style.opacity = '1';
        });
        return;
    }
    
    ruleSections.forEach(section => {
        const sectionText = section.textContent.toLowerCase();
        const hasMatch = sectionText.includes(searchTerm);
        
        if (hasMatch) {
            section.style.display = 'block';
            section.style.opacity = '1';
            
            // Kiemelés hozzáadása
            highlightSearchTerm(section, searchTerm);
            
            searchResults.push(section);
            
            // Szekció automatikus kinyitása találat esetén
            const ruleContent = section.querySelector('.rule-content');
            const ruleHeader = section.querySelector('.rule-header');
            const toggleIcon = ruleHeader?.querySelector('.toggle-icon');
            
            if (ruleContent && !ruleContent.classList.contains('active')) {
                ruleContent.classList.add('active');
                ruleContent.style.maxHeight = ruleContent.scrollHeight + 50 + 'px';
                ruleContent.style.padding = '25px';
                ruleContent.style.overflow = 'visible';
                
                if (toggleIcon) {
                    toggleIcon.classList.add('active');
                    toggleIcon.textContent = '−';
                }
                if (ruleHeader) {
                    ruleHeader.setAttribute('aria-expanded', 'true');
                }
            }
        } else {
            section.style.display = 'none';
            section.style.opacity = '0';
        }
    });
    
    // Első találatra scroll
    if (searchResults.length > 0) {
        setTimeout(() => {
            searchResults[0].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }
    
    // Keresési statisztika (opcionális)
    updateSearchStats(searchResults.length, searchTerm);
}

// Keresési kifejezés kiemelése
function highlightSearchTerm(section, searchTerm) {
    const textNodes = getTextNodes(section);
    
    textNodes.forEach(node => {
        const parentElement = node.parentElement;
        if (parentElement.classList.contains('highlight')) return;
        
        const text = node.textContent;
        const lowerText = text.toLowerCase();
        const index = lowerText.indexOf(searchTerm);
        
        if (index !== -1) {
            const before = text.substring(0, index);
            const match = text.substring(index, index + searchTerm.length);
            const after = text.substring(index + searchTerm.length);
            
            const highlightedHTML = before + 
                '<span class="highlight">' + match + '</span>' + 
                after;
            
            const wrapper = document.createElement('div');
            wrapper.innerHTML = highlightedHTML;
            
            parentElement.replaceChild(wrapper.firstChild || wrapper, node);
        }
    });
}

// Szöveges node-ok megkeresése
function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Kihagyjuk az üres vagy csak szóközt tartalmazó node-okat
                if (node.textContent.trim()) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

// Kiemelések eltávolítása
function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentElement;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

// Keresési statisztika frissítése
function updateSearchStats(resultCount, searchTerm) {
    // Egyszerű konzol log - kibővíthető UI elemmel
    if (searchTerm) {
        console.log(`Keresés: "${searchTerm}" - ${resultCount} találat`);
    }
}

// Animációk inicializálása
function initializeAnimations() {
    // Parallax effekt a header-nél
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            header.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Scroll-based animációk
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Rule szekciók megfigyelése
    const ruleSections = document.querySelectorAll('.rule-section');
    ruleSections.forEach(section => {
        observer.observe(section);
    });
}

// További event listener-ek hozzáadása
function addEventListeners() {
    // Smooth scroll az anchor linkekhez
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
    
    // Billentyűzet navigáció
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K a keresés fókuszálásához
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape a keresés törléséhez
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput === document.activeElement) {
                searchInput.blur();
            }
        }
    });
    
    // Resize event kezelése
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Aktív szekciók magasságának újraszámítása
            const activeContents = document.querySelectorAll('.rule-content.active');
            activeContents.forEach(content => {
                content.style.maxHeight = content.scrollHeight + 'px';
            });
        }, 250);
    });
}

// Utility függvények
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Teljesítmény optimalizáció
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export függvények (ha module rendszerben használnád)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeRulebook,
        toggleSection,
        performSearch
    };
}
