/**
 * RGZTEC Marketplace Search Functionality
 *
 * This script adds a live search filter to the marketplace homepage.
 * It listens for input in the search bar and filters the visibility of
 * product cards based on whether their title matches the search term.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Find the search input field in the document
  const searchInput = document.querySelector('.search-input');
  
  // Find all product cards on the page
  const allCards = document.querySelectorAll('.card');
  
  // Find all content sections that contain product grids
  const contentSections = document.querySelectorAll('section[id]');

  // If a search input exists, attach an event listener to it
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchFilter);
  }

  /**
   * Handles the filtering logic when the user types in the search box.
   * @param {Event} event - The input event from the search field.
   */
  function handleSearchFilter(event) {
    // Get the search term, convert to lower case, and trim whitespace
    const searchTerm = event.target.value.toLowerCase().trim();

    // Iterate over each product card to check for a match
    allCards.forEach(card => {
      const titleElement = card.querySelector('.title');
      // Ensure the card has a title before proceeding
      if (titleElement) {
        const title = titleElement.textContent.toLowerCase();
        // Check if the card's title includes the search term
        const shouldShow = title.includes(searchTerm);
        // Add or remove the 'hidden' class based on the match
        card.classList.toggle('hidden', !shouldShow);
      }
    });
    
    // After filtering cards, update the visibility of the sections
    updateSectionVisibility();
  }
  
  /**
   * Checks each section to see if it contains any visible cards.
   * If a section has no visible cards, its header is hidden.
   */
  function updateSectionVisibility() {
    contentSections.forEach(section => {
      // We only care about sections that contain a grid of cards
      if (section.querySelector('.grid.auto-4')) {
        const sectionHeader = section.querySelector('.section-header');
        // Find all cards within this section that are NOT hidden
        const visibleCards = section.querySelectorAll('.card:not(.hidden)');
        
        // If a header exists, toggle its visibility based on visible cards
        if (sectionHeader) {
          sectionHeader.style.display = visibleCards.length > 0 ? 'flex' : 'none';
        }
      }
    });
  }
});
