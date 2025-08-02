# Threat Detector

A lightweight Chrome extension that detects potential security threats and vulnerabilities on websites to help keep your data safe and secure.

## Features

- Real-time security scanning of websites
- Detection of common security vulnerabilities and threats
- Visual indication of site danger level
- Ability to fix detected threats with a single click
- Persistent security status across visits
- Privacy-focused (all processing happens locally)

## Detected Threats

Threat Detector can identify a variety of security issues, including:

- Suspicious script injections
- Clipboard access or hidden keylogging
- Inline event handlers
- Missing Subresource Integrity
- Requests to known malicious domains
- Mixed-content HTTP resources
- Large outbound POST requests
- Excessive browser fingerprinting
- Camera/microphone access attempts
- Hidden input forms collecting sensitive data
- Encrypted/obfuscated JavaScript
- Third-party trackers
- And more...

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the extension directory
5. The Threat Detector icon should now appear in your browser toolbar

## Usage

1. Visit any website you want to scan
2. Click the Threat Detector icon in your browser toolbar
3. The popup will display the security status and any detected threats
4. If threats are found, click "Fix All" to attempt to mitigate them
5. A danger indicator will appear briefly showing the site's threat level

## Understanding Security Levels

- **Safe**: Low danger score, minimal security concerns detected
- **Moderate**: Some potential security issues, but not critical
- **Dangerous**: Serious security concerns detected, caution advised

## Limitations

- This extension provides basic threat detection for informational purposes only
- It is not a replacement for comprehensive security software
- Cannot guarantee complete protection against all threats
- Some legitimate site functionality may be affected when fixing threats

## Privacy

- All data processing happens locally on your device
- No data is transmitted to external servers
- Scanned URLs and results are stored locally for 30 days
- You can clear all stored data at any time via the Privacy Policy page

## Development

### Project Structure

- `manifest.json`: Extension configuration
- `popup.html` & `popup.js`: User interface for the extension
- `content.js`: Scans web pages for threats
- `background.js`: Manages extension state and data retention
- `privacy-policy.html` & `privacy-policy.js`: Privacy policy information

### Building/Testing

This extension doesn't require a build step. To test changes:

1. Make your modifications
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test the changes on various websites

## License

[Insert your chosen license here]

## Contact

For questions or support, contact: ExtensionLabDesigns@gmail.com
