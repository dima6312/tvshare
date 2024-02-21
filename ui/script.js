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
    if (bookmarkletHref && navigator.clipboard) {
        navigator.clipboard.writeText(bookmarkletHref)
            .then(() => {
                // alert('Copied the bookmarklet code. Browsers remove javascript: before the code for security reaons. Be sure to add javascript: before the copied code manually when creating the bookmark');
            })
            .catch(err => {
                console.error('Error copying bookmarklet code: ', err);
            });
    } else {
        console.error('navigator.clipboard is not supported or globalBookmarkletHref is undefined');
    }


}

(function setInitialTheme() {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeToApply = storedTheme ? storedTheme : (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-bs-theme', themeToApply);
    const toggleButtonText = themeToApply === 'dark' ? 'Light Mode' : 'Dark Mode';
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('darkModeToggle').textContent = toggleButtonText;
    });
})();


document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('darkModeToggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        document.getElementById('darkModeToggle').textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });

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
                cell.colSpan = 2;
            });
    }

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

    const form = document.getElementById('urlForm');
    document.getElementById('urlForm').addEventListener('submit', function (e) {
        e.preventDefault();

        let urlInput = document.getElementById('urlInput').value.trim();

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
                form.reset();
                loadHistory();
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Error submitting URL: " + error);
            });
    });

    // Clear history:
    document.getElementById('clearHistoryButton').addEventListener('click', function () {
        fetch(`${config.apiEndpoint}?action=clearHistory`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log(data.message);
                    loadHistory();
                } else {
                    alert('Failed to clear history');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while trying to clear the history.');
            });
    });

    document.getElementById('refreshBtn').addEventListener('click', function () {
        loadHistory();
    });

    loadHistory();

});
