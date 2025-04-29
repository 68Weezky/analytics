document.addEventListener('DOMContentLoaded', () => {
    const menuToggler = document.getElementById('menu');
    const subMenu = document.getElementById('sub-menu');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab');

    // Function to hide all tabs
    const hideAllTabs = () => {
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
    };

    // Function to remove 'active' class from all tab buttons
    const deactivateAllButtons = () => {
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
    };

    // Function to show a specific tab and highlight the corresponding button
    const showTab = (tabId) => {
        const tab = document.getElementById(tabId);
        if (tab) {
            hideAllTabs();
            deactivateAllButtons();
            tab.classList.add('active');
            // Find the corresponding button and add 'active' class
            tabButtons.forEach(button => {
                if (button.textContent.trim().toLowerCase().replace(' ', '-') === tabId) {
                    button.classList.add('active');
                }
            });
        }
    };

    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.textContent.trim().toLowerCase().replace(' ', '-');
            showTab(tabId);
        });
    });

    // Initially show the 'home' tab
    showTab('home');

    menuToggler.addEventListener('click', (e) => {
        e.preventDefault();
        // Use a more efficient way to toggle display
        subMenu.classList.toggle('show');
        document.querySelector('.right').classList.toggle('show');
    });

    // Get the element you want to hide
    const element = document.querySelector('.left');

    // Create a new IntersectionObserver instance
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    // Element is out of the viewport, hide it
                    element.style.display = 'none';
                } else {
                    // Element is in the viewport, show it
                    element.style.display = 'block';
                }
            });
        },
        {
            rootMargin: '0px',
            threshold: 0,
        }
    );

    // Start observing the element
    observer.observe(element);
});


