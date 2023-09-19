function showTabContent(tabIndex) {
  // Get all tab elements and content elements
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // Hide all tab contents
  tabContents.forEach(content => {
    content.style.display = 'none';
  });

  // Remove 'active' class from all tabs
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });

  // Show the selected tab content and mark it as active
  tabContents[tabIndex].style.display = 'block';
  tabs[tabIndex].classList.add('active');
}