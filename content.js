// content.js
// Scans the page for basic threats and vulnerabilities.

console.log('[Threat Detector][Content Script] Extension content script running'); // Confirm content script runs

// Add a visible confirmation to the page
(function() {
  try {
    const info = document.createElement('div');
    info.textContent = 'Threat Detector content script loaded!';
    info.style.position = 'fixed';
    info.style.bottom = '8px';
    info.style.right = '8px';
    info.style.background = '#e0f7fa';
    info.style.color = '#00796b';
    info.style.padding = '4px 10px';
    info.style.borderRadius = '6px';
    info.style.zIndex = 99999;
    info.style.fontSize = '12px';
    info.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
    info.id = 'threat-detector-confirm';
    document.body.appendChild(info);
    setTimeout(() => {
      info.remove();
    }, 3000);
  } catch (e) {
    // Ignore errors if DOM is not ready
  }
})();

// Add variables to track danger bar state
let dangerBarDisplayed = false;
let lastDisplayTime = 0;
const DANGER_BAR_COOLDOWN = 10000; // 10 seconds cooldown

// Make the danger bar more persistent
function showDangerBar(totalScore, isSiteFixed = false) {
  const maxScore = 35;
  const pct = Math.min(Math.round((totalScore / maxScore) * 100), 100);
  
  // Check if we should show the bar again
  const currentTime = Date.now();
  if (dangerBarDisplayed || (currentTime - lastDisplayTime < DANGER_BAR_COOLDOWN)) {
    return; // Don't show if already displayed or within cooldown period
  }
  
  // Remove any existing bar just in case
  const oldBar = document.getElementById('threat-detector-bar');
  if (oldBar) oldBar.remove();

  // Create the bar (top right, fixed width)
  const bar = document.createElement('div');
  bar.id = 'threat-detector-bar';
  bar.style.position = 'fixed';
  bar.style.top = '10px';
  bar.style.right = '10px';
  bar.style.width = '180px';
  bar.style.height = '18px';
  bar.style.background = 'linear-gradient(to right, green, yellow, red)';
  bar.style.zIndex = '999999';
  bar.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  bar.style.borderRadius = '8px';
  bar.style.display = 'flex';
  bar.style.alignItems = 'center';
  bar.style.justifyContent = 'center';  // center text horizontally

  // Marker
  const marker = document.createElement('div');
  marker.style.position = 'absolute';
  marker.style.left = `calc(${pct}% - 2px)`;
  marker.style.top = '0';
  marker.style.width = '4px';
  marker.style.height = '100%';
  marker.style.background = '#000';
  marker.style.borderRadius = '2px';
  bar.appendChild(marker);

  // Label with updated score
  const label = document.createElement('span');
  label.textContent = `Danger: ${totalScore}/${maxScore}`;
  if (isSiteFixed) {
    label.textContent += ' (Secured)';
  }
  label.style.position = 'relative';
  label.style.margin = '0 auto';
  label.style.color = '#fff';
  label.style.fontSize = '12px';
  label.style.textShadow = '0 1px 2px #000';
  bar.appendChild(label);

  document.body.appendChild(bar);
  
  // Mark as displayed and record time
  dangerBarDisplayed = true;
  lastDisplayTime = currentTime;

  // Remove the bar after 5 seconds
  setTimeout(() => {
    bar.remove();
    dangerBarDisplayed = false; // Reset the flag when removed
  }, 5000);

  // Store the current time when the bar was displayed
  try {
    localStorage.setItem('threatDetector_' + window.location.hostname + '_lastDisplayed', currentTime);
  } catch (e) {
    console.log('[Threat Detector] Could not store display time:', e);
  }
}

// --- Ensure the danger bar uses the popup score if available ---
function getAuthoritativeScore() {
  // Try to get the score set by the popup (authoritative)
  let score = null;
  try {
    score = localStorage.getItem('threatDetector_' + window.location.hostname + '_popup_score');
    if (score !== null) score = parseInt(score, 10);
  } catch (e) {}
  return score;
}

// --- On page load, use the authoritative score if available ---
window.addEventListener('DOMContentLoaded', function() {
  let score = getAuthoritativeScore();
  if (score !== null) {
    showDangerBar(score, false);
  } else {
    safeDetectThreats();
  }
});

window.addEventListener('load', function() {
  let score = getAuthoritativeScore();
  if (score !== null) {
    showDangerBar(score, false);
  } else {
    safeDetectThreats();
  }
});

// Add a readystate change listener for more reliable execution
document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    setTimeout(safeDetectThreats, 500); // Small delay to let page finish rendering
  }
};

// Enhanced safeDetectThreats with logging and retry
function safeDetectThreats() {
  try {
    const result = detectThreats();

    // Only show the danger bar if no authoritative score is present
    // AND the bar isn't currently displayed
    if (getAuthoritativeScore() === null && !dangerBarDisplayed) {
      showDangerBar(result.totalScore, false);
    }
    autoApplyFixes();
    return result;
  } catch (e) {
    // Schedule a retry if detection failed
    setTimeout(function() {
      try {
        detectThreats();
      } catch (retryError) {
        console.error('[Threat Detector] Retry also failed:', retryError);
      }
    }, 2000);

    return null;
  }
}

// The rest of your logic remains unchanged

var fixedIssuesArr = []; // global list of fixed issues

// Ensure danger score calculation uses the most accurate value
function detectThreats() {
  const threats = [];
  const checklist = [
    { category: 'Script Behavior', item: 'Suspicious script injections', weight: 3, detected: false },
    { category: 'Script Behavior', item: 'Clipboard access or hidden keylogging', weight: 4, detected: false },
    { category: 'Script Behavior', item: 'Inline event handlers (onclick, onload, etc.)', weight: 2, detected: false },
    { category: 'Script Behavior', item: 'Missing Subresource Integrity on <script> tags', weight: 2, detected: false },
    { category: 'Network Traffic', item: 'Requests to known malicious domains', weight: 5, detected: false },
    { category: 'Network Traffic', item: 'Mixed-content HTTP resources', weight: 3, detected: false },
    { category: 'Network Traffic', item: 'Large outbound POST requests (exfiltration)', weight: 4, detected: false },
    { category: 'Fingerprinting', item: 'Excessive browser fingerprinting techniques', weight: 2, detected: false },
    { category: 'Permissions', item: 'Attempts to access camera/mic without prompt', weight: 5, detected: false },
    { category: 'Hidden Elements', item: 'Hidden input forms collecting sensitive data', weight: 3, detected: false },
    { category: 'Obfuscation', item: 'Encrypted/obfuscated JavaScript blobs', weight: 3, detected: false },
    { category: 'Known Threat Match', item: 'Match in threat databases', weight: 6, detected: false },
    { category: 'Network Traffic', item: 'Direct download links to executable files', weight: 5, detected: false },
    { category: 'Permissions', item: 'Unusual browser permission requests', weight: 3, detected: false },
    { category: 'Network Traffic', item: 'Suspicious automatic redirects', weight: 3, detected: false },
    { category: 'Network Traffic', item: 'Third-party trackers detected', weight: 4, detected: false },
    { category: 'Cookie Security', item: 'Sensitive cookies accessible to JavaScript', weight: 3, detected: false }
  ];

  // 1. Suspicious script injections
  if (!fixedIssuesArr.includes('Suspicious script injections')) {
    let suspiciousScriptDetected = false;
    let suspiciousScriptCount = 0;
    document.querySelectorAll('script:not([src])').forEach(script => {
      if (script.innerText.match(/document\.write|eval|innerHTML|src\s*=/i)) {
        suspiciousScriptDetected = true;
        suspiciousScriptCount++;
      }
    });
    checklist[0].detected = suspiciousScriptDetected;
    if (suspiciousScriptDetected) {
      threats.push({
        category: 'Script Behavior',
        item: 'Suspicious script injections',
        weight: 3,
        detail: `Inline script${suspiciousScriptCount > 1 ? 's' : ''} with suspicious patterns detected.` +
          (suspiciousScriptCount > 1 ? ` (${suspiciousScriptCount} found)` : '')
      });
    }
  } else {
    checklist[0].detected = false;
  }

  // 2. Clipboard access or hidden keylogging
  if (!fixedIssuesArr.includes('Clipboard access or hidden keylogging')) {
    let clipboardKeylogDetected = false;
    if (document.body.innerHTML.match(/navigator\.clipboard|onkeypress|onkeydown|onkeyup/i)) {
      clipboardKeylogDetected = true;
      threats.push({
        category: 'Script Behavior',
        item: 'Clipboard access or hidden keylogging',
        weight: 4,
        detail: 'Possible clipboard access or keylogging detected.'
      });
    }
    checklist[1].detected = clipboardKeylogDetected;
  } else {
    checklist[1].detected = false;
  }
  
  // 3. Inline event handlers
  let inlineHandlerDetected = false;
  document.querySelectorAll('[onclick],[onload],[onerror],[onmouseover]').forEach(el => {
    inlineHandlerDetected = true;
  });
  checklist.find(i => i.item === 'Inline event handlers (onclick, onload, etc.)').detected = inlineHandlerDetected;
  if (inlineHandlerDetected) {
    threats.push({
      category: 'Script Behavior',
      item: 'Inline event handlers (onclick, onload, etc.)',
      weight: 2,
      detail: 'Elements with inline event handlers detected.'
    });
  }

  // 4. Missing SRI
  let missingSriDetected = false;
  document.querySelectorAll('script[src]').forEach(s => {
    if (!s.hasAttribute('integrity')) {
      missingSriDetected = true;
    }
  });
  checklist.find(i => i.item === 'Missing Subresource Integrity on <script> tags').detected = missingSriDetected;
  if (missingSriDetected) {
    threats.push({
      category: 'Script Behavior',
      item: 'Missing Subresource Integrity on <script> tags',
      weight: 2,
      detail: 'External scripts without SRI attribute.'
    });
  }

  // 5. Requests to known malicious domains
  const knownBadDomains = ['example-malware.com', 'bad-domain.net'];
  let maliciousDomainDetected = false;
  document.querySelectorAll('script[src], img[src], iframe[src], link[href]').forEach(el => {
    const url = el.src || el.href;
    if (url && knownBadDomains.some(domain => url.includes(domain))) {
      maliciousDomainDetected = true;
      threats.push({
        category: 'Network Traffic',
        item: 'Requests to known malicious domains',
        weight: 5,
        detail: `Resource loaded from known malicious domain: ${url}`
      });
    }
  });
  checklist[2].detected = maliciousDomainDetected;

  // 6. Mixed-content HTTP resources
  let mixedContentDetected = false;
  if (location.protocol === 'https:') {
    document.querySelectorAll('script[src], img[src], link[href], iframe[src]').forEach(el => {
      const url = el.src || el.href;
      if (url && url.startsWith('http://')) {
        mixedContentDetected = true;
      }
    });
  }
  checklist.find(i => i.item === 'Mixed-content HTTP resources').detected = mixedContentDetected;
  if (mixedContentDetected) {
    threats.push({
      category: 'Network Traffic',
      item: 'Mixed-content HTTP resources',
      weight: 3,
      detail: 'HTTPS page loading insecure HTTP resources.'
    });
  }

  // 7. Large outbound POST requests (exfiltration)
  let largePostDetected = false;
  document.querySelectorAll('form').forEach(form => {
    let totalHiddenLength = 0;
    form.querySelectorAll('input[type=hidden]').forEach(input => {
      totalHiddenLength += (input.value || '').length;
    });
    if (totalHiddenLength > 1000) {
      largePostDetected = true;
      threats.push({
        category: 'Network Traffic',
        item: 'Large outbound POST requests (exfiltration)',
        weight: 4,
        detail: 'Form contains large hidden fields, possible data exfiltration.'
      });
    }
  });
  checklist[3].detected = largePostDetected;

  // 8. Excessive browser fingerprinting techniques
  const fingerprintPatterns = [
    'canvas.toDataURL', 'navigator.plugins', 'navigator.languages', 'screen.width', 'screen.height'
  ];
  let fingerprintingDetected = false;
  if (fingerprintPatterns.some(pat => document.body.innerHTML.includes(pat))) {
    fingerprintingDetected = true;
    threats.push({
      category: 'Fingerprinting',
      item: 'Excessive browser fingerprinting techniques',
      weight: 2,
      detail: 'Fingerprinting patterns detected in page scripts.'
    });
  }
  checklist[4].detected = fingerprintingDetected;

  // 9. Attempts to access camera/mic without prompt
  let camMicDetected = false;
  if (document.body.innerHTML.match(/getUserMedia|mediaDevices\.getUserMedia/i)) {
    camMicDetected = true;
    threats.push({
      category: 'Permissions',
      item: 'Attempts to access camera/mic without prompt',
      weight: 5,
      detail: 'Camera/mic access API detected.'
    });
  }
  checklist[5].detected = camMicDetected;

  // 10. Hidden input forms collecting sensitive data
  let hiddenSensitiveDetected = false;
  document.querySelectorAll('input[type=hidden]').forEach(input => {
    if (input.name && input.name.match(/pass|card|ssn|secret/i)) {
      hiddenSensitiveDetected = true;
      threats.push({
        category: 'Hidden Elements',
        item: 'Hidden input forms collecting sensitive data',
        weight: 3,
        detail: `Hidden input "${input.name}" may collect sensitive data.`
      });
    }
  });
  checklist[6].detected = hiddenSensitiveDetected;

  // 11. Encrypted/obfuscated JavaScript blobs
  let obfuscatedDetected = false;
  document.querySelectorAll('script:not([src])').forEach(script => {
    if (script.innerText.match(/function\s*\(.*\)\s*\{.*return.*\}/) && script.innerText.length > 2000) {
      obfuscatedDetected = true;
      threats.push({
        category: 'Obfuscation',
        item: 'Encrypted/obfuscated JavaScript blobs',
        weight: 3,
        detail: 'Large, possibly obfuscated inline script detected.'
      });
    }
  });
  checklist[7].detected = obfuscatedDetected;

  // 12. Known Threat Match
  const knownBadHashes = ['badScriptHash123'];
  let knownThreatDetected = false;
  document.querySelectorAll('script:not([src])').forEach(script => {
    if (knownBadHashes.some(hash => script.innerText.includes(hash))) {
      knownThreatDetected = true;
      threats.push({
        category: 'Known Threat Match',
        item: 'Match in threat databases',
        weight: 6,
        detail: 'Script matches known threat signature.'
      });
    }
  });
  checklist[8].detected = knownThreatDetected;

  // 13. Weak or missing Content Security Policy
  const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  let weakCspDetected = false;
  if (!cspHeader || (cspHeader.content && cspHeader.content.includes('unsafe-inline'))) {
    weakCspDetected = true;
    threats.push({
      category: 'Headers',
      item: 'Weak or missing Content Security Policy',
      weight: 4,
      detail: 'Site does not use a strong Content Security Policy header.'
    });
  }
  checklist[9].detected = weakCspDetected;

  // 14. Direct download links to executable files
  let exeDownloadDetected = false;
  document.querySelectorAll('a[href]').forEach(a => {
    if (a.href.match(/\.(exe|scr|bat|msi|cmd|ps1|jar|apk|dmg|sh|appimage)(\?|$)/i)) {
      exeDownloadDetected = true;
      threats.push({
        category: 'Network Traffic',
        item: 'Direct download links to executable files',
        weight: 5,
        detail: `Link to executable file detected: ${a.href}`
      });
    }
  });
  checklist.find(i => i.item === 'Direct download links to executable files').detected = exeDownloadDetected;

  // 15. Unusual browser permission requests
  let unusualPermissionDetected = false;
  const permissionKeywords = [
    'geolocation', 'notifications', 'push', 'background-sync', 'clipboard-write', 'clipboard-read'
  ];
  document.querySelectorAll('script:not([src])').forEach(script => {
    permissionKeywords.forEach(keyword => {
      if (script.innerText.includes(keyword)) {
        unusualPermissionDetected = true;
      }
    });
  });
  // Also check for permission-related API usage in inline event handlers
  document.querySelectorAll('[onclick],[onload],[onerror],[onmouseover]').forEach(el => {
    permissionKeywords.forEach(keyword => {
      if (el.outerHTML.includes(keyword)) {
        unusualPermissionDetected = true;
      }
    });
  });
  checklist.find(i => i.item === 'Unusual browser permission requests').detected = unusualPermissionDetected;
  if (unusualPermissionDetected) {
    threats.push({
      category: 'Permissions',
      item: 'Unusual browser permission requests',
      weight: 3,
      detail: 'Site requests browser permissions like location, notifications, or clipboard access.'
    });
  }

  // 16. Suspicious automatic redirects
  let suspiciousRedirectDetected = false;
  // Check for meta refresh redirects
  document.querySelectorAll('meta[http-equiv="refresh"]').forEach(meta => {
    suspiciousRedirectDetected = true;
    threats.push({
      category: 'Network Traffic',
      item: 'Suspicious automatic redirects',
      weight: 3,
      detail: 'Page uses meta refresh to redirect automatically.'
    });
  });
  // Check for window.location or document.location changes in inline scripts
  document.querySelectorAll('script:not([src])').forEach(script => {
    if (script.innerText.match(/window\.location\s*=\s*['"]/i) ||
        script.innerText.match(/document\.location\s*=\s*['"]/i)) {
      suspiciousRedirectDetected = true;
      threats.push({
        category: 'Network Traffic',
        item: 'Suspicious automatic redirects',
        weight: 3,
        detail: 'Page uses JavaScript to redirect automatically.'
      });
    }
  });
  checklist.find(i => i.item === 'Suspicious automatic redirects').detected = suspiciousRedirectDetected;
  if (suspiciousRedirectDetected) {
    threats.push({
      category: 'Network Traffic',
      item: 'Suspicious automatic redirects',
      weight: 3,
      detail: 'Page uses JavaScript to redirect automatically.'
    });
  }

  // 17. Third-party trackers
  const trackerDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'doubleclick.net',
    'facebook.net',
    'ads.twitter.com',
    'cdn.segment.com'
  ];
  let trackersFound = [];
  document.querySelectorAll('script[src]').forEach(s => {
    trackerDomains.forEach(domain => {
      if (s.src.includes(domain)) {
        trackersFound.push(domain);
      }
    });
  });
  if (trackersFound.length) {
    const unique = [...new Set(trackersFound)];
    threats.push({
      category: 'Network Traffic',
      item: 'Third-party trackers detected',
      weight: 4,
      detail: 'Trackers loaded: ' + unique.join(', ')
    });
    checklist.find(i => i.item === 'Third-party trackers detected').detected = true;
  }

  // 18. Sensitive cookies accessible to JavaScript (HttpOnly missing)
  const cookieNames = (document.cookie || '').split('; ').map(c => c.split('=')[0]);
  const sensitiveCookieDetected = cookieNames.some(name => /session|token|auth|sid/i.test(name));
  checklist.find(i => i.item === 'Sensitive cookies accessible to JavaScript').detected = sensitiveCookieDetected;
  if (sensitiveCookieDetected) {
    threats.push({
      category: 'Cookie Security',
      item: 'Sensitive cookies accessible to JavaScript',
      weight: 3,
      detail: 'Cookies like session or auth are readable via JavaScript, missing HttpOnly flag.'
    });
  }

  // Try to get popup score first before calculating
  let popupScore = null;
  try {
    popupScore = localStorage.getItem('threatDetector_' + window.location.hostname + '_popup_score');
    if (popupScore !== null) {
      popupScore = parseInt(popupScore, 10);
    }
  } catch (e) {
    // If can't access localStorage, continue with normal calculation
  }

  // If popup has provided a score, use that instead of calculating
  const totalScore = popupScore !== null ? popupScore : checklist.reduce((sum, item) => {
    // Only count items that are detected AND not in our fixedIssuesArr
    if (item.detected && !fixedIssuesArr.includes(item.item)) {
      return sum + item.weight;
    }
    return sum;
  }, 0);

  // Predict security level based on adjusted score
  let securityLevel = 'Safe';
  if (totalScore >= 10 && totalScore < 18) securityLevel = 'Moderate';
  if (totalScore >= 18) securityLevel = 'Dangerous';

  // Check if site has been fixed before showing warning
  chrome.runtime.sendMessage({ type: 'GET_FIXED_STATUS', url: window.location.href }, function(resp) {
    const siteFixed = resp && resp.fixed;
    
    // Only show danger warning if site hasn't been fixed
    if (securityLevel === 'Dangerous' && !siteFixed) {
      const banner = document.createElement('div');
      banner.id = 'threat-detector-warning-banner';
      banner.innerText = '⚠ Warning: This site is dangerous!';
      banner.style.position = 'fixed';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.width = '100%';
      banner.style.background = '#ff4d4d';
      banner.style.color = '#ffffff';
      banner.style.padding = '10px';
      banner.style.textAlign = 'center';
      banner.style.zIndex = '999999';
      document.body.appendChild(banner);
    }

    // Show the danger bar with fixed status
    showDangerBar(totalScore, siteFixed);
  });

  return { threats, checklist, totalScore, securityLevel };
}

// Ensure the scan always runs on supported sites, even after switching tabs
function safeDetectThreats() {
  try {
    detectThreats();
    autoApplyFixes(); // reapply fixes if previously marked, even on refresh
  } catch (e) {
    // Fail silently if the DOM is not ready or scanning is not possible
  }
}

// Run the scan automatically on every page load and when the tab becomes active
safeDetectThreats();

document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    safeDetectThreats();
  }
});

// Listen for requests from popup and reply with the scan result
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'THREAT_DETECTOR_REQUEST') {
    const result = detectThreats();
    
    // Don't update the stored score here - let the popup control it
    sendResponse(result);
  }
  
  // Prioritize the score from popup for the danger bar
  if (msg.type === 'UPDATE_DANGER_BAR') {
    if (typeof msg.score === 'number') {
      // Force reset the display state for messages from popup
      dangerBarDisplayed = false;
      
      // First remove any existing danger bar
      const existingBar = document.getElementById('threat-detector-bar');
      if (existingBar) existingBar.remove();
      
      // Show the updated danger bar with the popup's score
      showDangerBar(msg.score, msg.isFixed || false);
      
      // Store this score as the definitive value
      try {
        localStorage.setItem('threatDetector_' + window.location.hostname + '_popup_score', msg.score);
        localStorage.setItem('threatDetector_' + window.location.hostname + '_currentScore', msg.score);
        if (msg.isFixed) {
          localStorage.setItem('threatDetector_' + window.location.hostname + '_score', msg.score);
        }
      } catch (e) {
        console.log('[Threat Detector] Could not store scores:', e);
      }
      
      // Remove warning banner if site is fixed OR score is below dangerous threshold (18)
      const warningBanner = document.getElementById('threat-detector-warning-banner');
      if (warningBanner && (msg.isFixed || msg.score < 18)) {
        warningBanner.remove();
        console.log('[Threat Detector] Removed warning banner - score is now ' + msg.score);
      }
    }
  }
  
  // Add a new message type specifically for removing the warning banner
  if (msg.type === 'REMOVE_WARNING_BANNER') {
    const warningBanner = document.getElementById('threat-detector-warning-banner');
    if (warningBanner) {
      warningBanner.remove();
      console.log('[Threat Detector] Warning banner removed by explicit command');
    }
  }
});

// Listen for fix commands from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg.type || !msg.type.startsWith('FIX_')) return;

  const knownBadDomains = ['example-malware.com','bad-domain.net'];
  const fingerprintPatterns = ['canvas.toDataURL','navigator.plugins','navigator.languages','screen.width','screen.height'];
  const trackerDomains = ['google-analytics.com','googletagmanager.com','doubleclick.net','facebook.net','ads.twitter.com','cdn.segment.com'];
  const permissionKeywords = ['geolocation','notifications','push','background-sync','clipboard-write','clipboard-read'];
  const knownBadHashes = ['badScriptHash123'];

  switch (msg.type) {
    case 'FIX_Suspicious_script_injections':
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (/document\.write|eval|innerHTML|src\s*=/.test(s.innerText)) s.remove();
      });
      break;

    case 'FIX_Clipboard_access_or_hidden_keylogging':
      // remove inline key events and clipboard API usage
      document.querySelectorAll('[onkeypress],[onkeydown],[onkeyup]').forEach(el => {
        ['onkeypress','onkeydown','onkeyup'].forEach(a => el.removeAttribute(a));
      });
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (s.innerText.includes('navigator.clipboard')) s.remove();
      });
      break;

    case 'FIX_Inline_event_handlers_onclick_onload_etc_':
      // remove inline event attrs
      document.querySelectorAll('[onclick],[onload],[onerror],[onmouseover]').forEach(el => {
        ['onclick','onload','onerror','onmouseover'].forEach(a => el.removeAttribute(a));
      });
      break;

    case 'FIX_Missing_Subresource_Integrity_on__script__tags':
      // cannot auto‐fix SRI headers
      console.log('[Threat Detector] Cannot automatically add SRI.');
      break;

    case 'FIX_Requests_to_known_malicious_domains':
      // remove elements pointing to bad domains
      document.querySelectorAll('script[src],img[src],iframe[src],link[href]').forEach(el => {
        const url = el.src||el.href;
        if (knownBadDomains.some(d=>url.includes(d))) el.remove();
      });
      break;

    case 'FIX_Mixed_content_HTTP_resources':
      document.querySelectorAll('script[src^="http://"], img[src^="http://"], link[href^="http://"]').forEach(el => {
        const url = (el.src||el.href).replace(/^http:\/\//,'https://');
        el.src? el.src=url: el.href=url;
      });
      break;

    case 'FIX_Large_outbound_POST_requests__exfiltration':
      document.querySelectorAll('input[type=hidden]').forEach(i => i.value = '');
      break;

    case 'FIX_Excessive_browser_fingerprinting_techniques':
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (fingerprintPatterns.some(p=>s.innerText.includes(p))) s.remove();
      });
      break;

    case 'FIX_Attempts_to_access_camera_mic_without_prompt':
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (/getUserMedia|mediaDevices\.getUserMedia/.test(s.innerText)) s.remove();
      });
      break;

    case 'FIX_Hidden_input_forms_collecting_sensitive_data':
      document.querySelectorAll('input[type=hidden]').forEach(i => {
        if (i.name && /pass|card|ssn|secret/i.test(i.name)) i.remove();
      });
      break;

    case 'FIX_Encrypted_obfuscated_JavaScript_blobs':
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (s.innerText.length>2000 && /function\s*\(.*\)\s*\{.*return.*\}/.test(s.innerText)) s.remove();
      });
      break;

    case 'FIX_Match_in_threat_databases':
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (knownBadHashes.some(h=>s.innerText.includes(h))) s.remove();
      });
      break;

    case 'FIX_Direct_download_links_to_executable_files':
      document.querySelectorAll('a[href]').forEach(a => {
        if (/\.(exe|scr|bat|msi|cmd|ps1|jar|apk|dmg|sh|appimage)(\?|$)/i.test(a.href)) {
          a.style.pointerEvents='none';
          a.title='Download blocked by Threat Detector';
        }
      });
      break;

    case 'FIX_Unusual_browser_permission_requests':
      // strip permission API usage in scripts and attrs
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (permissionKeywords.some(k=>s.innerText.includes(k))) s.remove();
      });
      document.querySelectorAll('[onclick],[onload],[onerror],[onmouseover]').forEach(el => {
        permissionKeywords.forEach(k => {
          if (el.outerHTML.includes(k)) el.remove();
        });
      });
      break;

    case 'FIX_Suspicious_automatic_redirects':
      document.querySelectorAll('meta[http-equiv="refresh"]').forEach(m=>m.remove());
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (/window\.location\s*=|document\.location\s*=/.test(s.innerText)) s.remove();
      });
      break;

    case 'FIX_Third_party_trackers_detected':
      document.querySelectorAll('script[src]').forEach(s => {
        if (trackerDomains.some(d=>s.src.includes(d))) s.remove();
      });
      break;

    case 'FIX_Sensitive_cookies_accessible_to_JavaScript':
      (document.cookie||'').split('; ').forEach(c => {
        const name = c.split('=')[0];
        if (/session|token|auth|sid/i.test(name)) {
          document.cookie = name+'=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/';
        }
      });
      break;

    case 'FIX_Weak_or_missing_Content_Security_Policy':
      console.log('[Threat Detector] Cannot modify CSP from content script.');
      break;

    case 'FIX_ALL':
      // Array of all fix command types to attempt
      const fixCommands = [
        'FIX_Suspicious_script_injections',
        'FIX_Clipboard_access_or_hidden_keylogging',
        'FIX_Inline_event_handlers_onclick_onload_etc_',
        'FIX_Missing_Subresource_Integrity_on__script__tags',
        'FIX_Requests_to_known_malicious_domains',
        'FIX_Mixed_content_HTTP_resources',
        'FIX_Large_outbound_POST_requests__exfiltration',
        'FIX_Excessive_browser_fingerprinting_techniques',
        'FIX_Attempts_to_access_camera_mic_without_prompt',
        'FIX_Hidden_input_forms_collecting_sensitive_data',
        'FIX_Encrypted_obfuscated_JavaScript_blobs',
        'FIX_Match_in_threat_databases',
        'FIX_Direct_download_links_to_executable_files',
        'FIX_Unusual_browser_permission_requests',
        'FIX_Suspicious_automatic_redirects',
        'FIX_Third_party_trackers_detected',
        'FIX_Sensitive_cookies_accessible_to_JavaScript',
        'FIX_Weak_or_missing_Content_Security_Policy'
      ];
      fixCommands.forEach(cmd => {
        chrome.runtime.sendMessage({ type: cmd });
      });
      break;

    default:
      console.log('[Threat Detector] No fix handler for', msg.type);
  }
});

// Modify autoApplyFixes to store fixed issues locally
function autoApplyFixes() {
  chrome.runtime.sendMessage({ type: 'THREAT_DETECTOR_GET_FIXES', url: window.location.href }, function(resp) {
    if (resp && resp.fixed && resp.fixed.length) {
      fixedIssuesArr = resp.fixed;  // store fixes for later detection
      if (fixedIssuesArr.includes('FIX_ALL')) {
        chrome.runtime.sendMessage({ type: 'FIX_ALL' });
      } else {
        resp.fixed.forEach(issue => {
          if (issue !== 'FIX_ALL') {
            const type = 'FIX_' + issue.replace(/[^A-Za-z0-9]/g, '_');
            chrome.runtime.sendMessage({ type });
          }
        });
      }
    }
  });
}

// Update listener for FIX_ALL to recalculate and store the updated danger score
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'FIX_ALL') {
    // Store all detected threats in fixedIssuesArr
    const allDetected = detectThreats().checklist
      .filter(item => item.detected)
      .map(item => item.item);
    
    fixedIssuesArr = [...new Set([...fixedIssuesArr, ...allDetected])];
    
    // Remove any existing warning banner
    const warningBanner = document.getElementById('threat-detector-warning-banner');
    if (warningBanner) warningBanner.remove();
    
    // Recalculate the score and show updated danger bar
    setTimeout(() => {
      const updatedResult = detectThreats();
      const newScore = updatedResult.totalScore;
      
      // Store the updated score in localStorage for persistence
      try {
        localStorage.setItem('threatDetector_' + window.location.hostname + '_score', newScore);
      } catch (e) {
        console.log('[Threat Detector] Could not store score:', e);
      }
      
      // Remove the warning banner if the score is now below the dangerous threshold
      const warningBanner = document.getElementById('threat-detector-warning-banner');
      if (warningBanner && newScore < 18) {
        warningBanner.remove();
        console.log('[Threat Detector] Removed warning banner - score now below threshold:', newScore);
      }
      
      // Show the updated danger bar with fixed indicator
      showDangerBar(newScore, true);
    }, 1000);
  }
});

// When page loads, check if this site was fixed and show the updated danger score
window.addEventListener('load', () => {
  // Check for stored scores
  let storedScore = null;
  try {
    // First try to get popup score (highest priority)
    storedScore = localStorage.getItem('threatDetector_' + window.location.hostname + '_popup_score');
    
    // Then try fixed score (next priority)
    if (storedScore === null) {
      storedScore = localStorage.getItem('threatDetector_' + window.location.hostname + '_score');
    }
    
    // Finally try current score (lowest priority)
    if (storedScore === null) {
      storedScore = localStorage.getItem('threatDetector_' + window.location.hostname + '_currentScore');
    }
    
    if (storedScore !== null) {
      storedScore = parseInt(storedScore, 10);
    }
  } catch (e) {
    console.log('[Threat Detector] Could not retrieve score:', e);
  }
  
  if (storedScore !== null) {
    // Use the stored score
    console.log('[Threat Detector] Using stored danger score:', storedScore);
    showDangerBar(storedScore, true);
    
    // Remove any warning banner for sites with a stored score
    const warningBanner = document.getElementById('threat-detector-warning-banner');
    if (warningBanner) warningBanner.remove();
    
    // Update the fixedIssuesArr to ensure threat detection works correctly
    chrome.runtime.sendMessage({ type: 'GET_FIXED_STATUS', url: window.location.href }, function(resp) {
      if (resp && resp.fixed) {
        // Load fixed issues from background if available
        chrome.runtime.sendMessage({ type: 'THREAT_DETECTOR_GET_FIXES', url: window.location.href }, function(fixResp) {
          if (fixResp && fixResp.fixed && fixResp.fixed.length) {
            fixedIssuesArr = fixResp.fixed;
          }
        });
      }
    });
  } else {
    // No stored score, check if site was fixed
    chrome.runtime.sendMessage({ type: 'GET_FIXED_STATUS', url: window.location.href }, function(resp) {
      if (resp && resp.fixed) {
        // Site was previously fixed, recalculate score with fixed items excluded
        chrome.runtime.sendMessage({ type: 'THREAT_DETECTOR_GET_FIXES', url: window.location.href }, function(fixResp) {
          if (fixResp && fixResp.fixed && fixResp.fixed.length) {
            fixedIssuesArr = fixResp.fixed;
            
            // Re-run threat detection with fixed items excluded
            const result = detectThreats();
            
            // Save this score for future page loads
            try {
              localStorage.setItem('threatDetector_' + window.location.hostname + '_score', result.totalScore);
            } catch (e) {
              console.log('[Threat Detector] Could not store score:', e);
            }
            
            // Make sure the warning banner is removed
            const warningBanner = document.getElementById('threat-detector-warning-banner');
            if (warningBanner) warningBanner.remove();
            
            // Show the updated danger bar
            showDangerBar(result.totalScore, true);
          }
        });
      }
    });
  }
});

// Add listener for background script tab update messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle the tab updated message from background script
  if (msg.type === 'THREAT_DETECTOR_TAB_UPDATED') {
    // Comment out this log
    // console.log('[Threat Detector] Tab updated message received');
    setTimeout(safeDetectThreats, 500);
  }
});