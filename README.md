# Introduction
This app originated from a personal need for a quicker, more reliable method to share URLs from any device directly to a smart TV, bypassing the often slow and cumbersome manufacturer's apps. Designed with simplicity and efficiency in mind, it enables instant sharing of web content to smart TVs (or any device capable of setting a homepage or using bookmarks) without the hassle of dealing with a mobile app's clunky interface and unreliable keyboard input.

## What Does This App Do?
At its core, the app allows users to instantly share any URL to their smart TV. The TV's web browser is set to open the app's URL as its homepage, which then redirects to the most recently submitted URL. This setup streamlines the process of viewing web content on a larger screen, making it nearly instantaneous to share from phone or computer to TV.

## Demo
You can view a demo of the app (latest **release** version) here:
- UI [https://dimak.pl/demos/tvshare/ui/](https://dimak.pl/demos/tvshare/ui/)
- Redirection link: [https://dimak.pl/demos/tvshare/](https://dimak.pl/demos/tvshare/)

## Practical Use Cases
- **Quick Sharing to TV:** Easily share a cooking recipe, a YouTube video, or a news article from your phone or laptop directly to your TV.
- **Simplifying Presentations:** Share a presentation or document URL for viewing on a conference room's smart display without needing cables or casting devices.
- **Educational Content:** Teachers can quickly share educational resources or websites with students in a classroom equipped with a smart TV.

## How to Use It
### Setup the App on Your Smart TV:
Set the homepage of your smart TV's web browser to the URL of this app. Alternatively, bookmark the URL for easy access when you'd like to be redirected to the saved link.

### Sharing a URL:
- Use the JavaScript bookmarklet provided within the app's UI on your phone or computer to send the current page's URL directly to your smart TV.
- For more integrated experiences, Chrome browser and iOS extensions (not included in this repo) can also be used.
- Manually add a URL via the app's UI or send a URL to the app's endpoint (index.php) using a POST or GET request (with the "save" parameter containing the URL-encoded URL).

## Configuration and Customization
- The app allows adjusting the timeout for how long a shared URL is considered 'active' before defaulting to a preset URL.
- Users can clear the history, refresh the list of shared URLs, and adjust the number of URLs stored in history (default is 10 URLs) through the app's responsive UI.

## Installation
**Requirements:** A web server with PHP support (tested on PHP 7.4 and newer).
### Deploy the App:
1. Upload the files to your server.
2. Rename `config.example.js` to `config.js` and `config.example.php` to `config.php` (if deploying from source code, not a release package)
3. Update `config.php` and `config.js` with your actual configuration values. 
4. Ensure the `url_history.json` file is writable by the server (adjust file permissions as needed) otherwise PHP won't be able to save new URLs.

## Why This App?
Unlike traditional methods that often involve cumbersome typing and app navigation, this solution provides a seamless, efficient way to share content between devices and your smart TV. It's particularly useful for users looking to enhance their home entertainment system's accessibility or simplify the process of sharing content in a professional setting.

The app's minimalist design, built with HTML, JS, CSS, and PHP, ensures compatibility across a wide range of devices while offering both light and dark mode support for an optimal viewing experience regardless of lighting conditions.

## UI built with
[Bootstrap](https://github.com/twbs/bootstrap) - The web framework used for UI components

## Contributing
Contributions are welcome! Feel free to fork the repository, make improvements, and submit pull requests.

## License
This project is open-sourced under the MIT License. See the LICENSE file for more details.
