function timeAgo(timestamp) {
    const now = new Date();
    const timestampDate = new Date(timestamp * 1000); // Convert Unix timestamp to JavaScript Date
    const diffInSeconds = Math.floor((now - timestampDate) / 1000);

    if (diffInSeconds < 60) { // Less than a minute
        return 'Just now';
    } else if (diffInSeconds < 3600) { // Less than an hour
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) { // Less than a day
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else { // Days
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

var bookmarkletHref = "javascript:(function(){window.open('" + config.apiEndpoint + "?save=' + encodeURIComponent(document.location.href), 'savePopup', 'width=400,height=550');})();";

function copyBookmarkletCode() {
    // navigator.clipboard.writeText(bookmarkletHref)
    // alert("Copied the bookmarklet code.");

    if (bookmarkletHref && navigator.clipboard) {
        navigator.clipboard.writeText(bookmarkletHref)
            .then(() => {
                alert('Copied the bookmarklet code. Browsers remove javascript: before the code for security reaons. Be sure to add javascript: before the copied code manually when creating the bookmark');
            })
            .catch(err => {
                console.error('Error copying bookmarklet code: ', err);
            });
    } else {
        console.error('navigator.clipboard is not supported or globalBookmarkletHref is undefined');
    }

    
}

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('lastSavedUrl').href = config.apiEndpoint;
    document.getElementById('lastSavedUrl').textContent = config.apiEndpoint;
    document.getElementById('duration').textContent = config.duration;
    document.getElementById('bookmarkletLink').href = bookmarkletHref;
    document.getElementById('bookmarkletCode').textContent = bookmarkletHref;

    const historyTableBody = document.getElementById('historyTable').getElementsByTagName('tbody')[0];

    function loadHistory() {
        const historyTableBody = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
    
        // Clear existing rows
        while (historyTableBody.hasChildNodes()) {
            historyTableBody.removeChild(historyTableBody.lastChild);
        }
    
        document.getElementById('loader').style.display = 'table-row';
    
        fetch(`${config.apiEndpoint}?action=history`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('loader').style.display = 'none';
                if (!data || data.length === 0) { // Check if data is empty or not returned
                    const row = historyTableBody.insertRow();
                    const cell = row.insertCell();
                    cell.textContent = "so empty";
                    cell.colSpan = 2; // Assuming you have 2 columns to span across
                } else {
                    data.forEach((item, index) => {
                        const row = historyTableBody.insertRow();
                        const timeAgoText = timeAgo(item.timestamp);
    
                        // Insert clickable URL
                        const urlCell = row.insertCell();
                        const a = document.createElement('a');
                        a.href = item.url;
                        a.textContent = item.url;
                        a.target = "_blank";
                        urlCell.appendChild(a);
    
                        // Insert "time ago" text
                        const timestampCell = row.insertCell();
                        timestampCell.textContent = timeAgoText;
    
                        // Highlight logic remains unchanged
                        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                        const urlAge = currentTime - item.timestamp;
                        if (index === 0 && urlAge <= 900) {
                            row.classList.add('highlight');
                        }
                        
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching history:', error);
                document.getElementById('loader').style.display = 'none';
                const row = historyTableBody.insertRow();
                const cell = row.insertCell();
                cell.textContent = "oops, something went wrong";
                cell.colSpan = 2; // Adjust based on your table's columns
            });
    }
    
// });

    //Paste text
    let pasteButton = document.getElementById('pasteBtn');
    pasteButton.addEventListener('click', function () {
        console.log("pasting");
        navigator.clipboard
            .readText()
            .then(
                cliptext =>
                    (document.getElementById('urlInput').value = cliptext),
                err => console.log(err)
            );
    });

    //Submit form

    const form = document.getElementById('urlForm');
    document.getElementById('urlForm').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission behavior

        let urlInput = document.getElementById('urlInput').value.trim();

        // Check if the URL starts with "http://" or "https://", prepend "https://" if not
        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            urlInput = 'https://' + urlInput;
        }

        const data = JSON.stringify({ url: urlInput });

        fetch(`${config.apiEndpoint}`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                console.log('Success:', data);
                // Optionally, show a success message or clear the form
                form.reset();
                // window.location.reload();
                loadHistory();
            })
            .catch(error => {
                console.error('Error:', error);
                // Optionally, show an error message
                alert("Error submitting URL: " + error);
            });
    });



    // Clear history:
    document.getElementById('clearHistoryButton').addEventListener('click', function () {
        // if (confirm('Are you sure you want to clear the history? This action cannot be undone.')) {
        fetch(`${config.apiEndpoint}?action=clearHistory`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log(data.message);
                    // Optionally, refresh the page to reflect the cleared history
                    // window.location.reload();
                    loadHistory();
                } else {
                    alert('Failed to clear history');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while trying to clear the history.');
            });
        // }
    });

    function initializeDarkMode() {
        const userPreference = getUserDarkModePreference();
        const body = document.body;
        const table = document.getElementById('historyTable');
    
        if (userPreference === true) {
            body.classList.add('dark-mode');
            table.classList.remove('table-striped');
            table.classList.add('table-dark');
        } else if (userPreference === false) {
            body.classList.remove('dark-mode');
            table.classList.remove('table-dark');
            table.classList.add('table-striped');
        } else {
            // Apply system preference if no user preference is stored
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-mode');
                table.classList.remove('table-striped');
                table.classList.add('table-dark');
            } else {
                body.classList.remove('dark-mode');
                table.classList.remove('table-dark');
                table.classList.add('table-striped');
            }
        }
    }
    function toggleDarkMode() {
        console.log("Toggling dark mode...");
        const body = document.body;
        const table = document.getElementById('historyTable');
        const isDarkMode = body.classList.contains('dark-mode');
    
        if (isDarkMode) {
            body.classList.remove('dark-mode');
            table.classList.remove('table-dark');
            table.classList.add('table-striped');
            setUserDarkModePreference(false);
        } else {
            body.classList.add('dark-mode');
            table.classList.remove('table-striped');
            table.classList.add('table-dark');
            setUserDarkModePreference(true);
        }
    }
    
    function setUserDarkModePreference(darkMode) {
        localStorage.setItem('darkMode', darkMode.toString());
    }

    function getUserDarkModePreference() {
        const storedPreference = localStorage.getItem('darkMode');
        return storedPreference !== null ? storedPreference === 'true' : null;
    }

    // Initialize dark mode based on preference or system setting
    initializeDarkMode();

    // Setup toggle button listener
    document.getElementById('darkModeToggle').addEventListener('click', function () {
        toggleDarkMode();
    });

    //end dark mode

    document.getElementById('refreshBtn').addEventListener('click', function () {
        loadHistory();
    });

    loadHistory();

});