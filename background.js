chrome.runtime.onInstalled.addListener(() => {
  // Extension installed
  console.log('[Threat Detector] Extension installed - basic threat monitoring activated');
  
  // Initialize data retention policy
  initializeDataRetentionPolicy();
  
  // Store privacy policy version and acceptance status
  chrome.storage.local.set({
    privacyPolicyVersion: PRIVACY_POLICY.version,
    privacyPolicyAccepted: false
  });
});

// Privacy Policy Information - used for both code reference and UI display
const PRIVACY_POLICY = {
  version: '1.0',
  lastUpdated: '2023-11-15',
  dataCollected: [
    { type: 'URLs visited', purpose: 'To scan for potential security issues', retention: '30 days' },
    { type: 'Security scan results', purpose: 'To track detection history', retention: '30 days' },
    { type: 'Known threat indicators', purpose: 'To identify potential issues', retention: 'Until browser session ends' }
  ],
  dataSharing: 'This extension does not share any collected data with third parties.',
  userRights: 'Users can clear all stored data at any time via the extension options.',
  limitations: 'This extension provides basic threat detection for informational purposes only. It is not a replacement for comprehensive security software and cannot guarantee complete protection against all threats.'
};

// Data retention configuration
const DATA_RETENTION_DAYS = 30;
let debugMode = false;
let recentScans = []; // { url, score, level, timestamp }
let fixedSites = {};  // Record URLs with FULL FIX (FIX_ALL)
let threatHistory = {}; // Store detected threat items by URL

// Data retention implementation
function initializeDataRetentionPolicy() {
  // Schedule daily cleanup of old data
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  setInterval(purgeOldData, millisecondsPerDay);
  
  // Run initial purge
  purgeOldData();
}

function purgeOldData() {
  const cutoffTime = Date.now() - (DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  
  // Clean recentScans older than retention period
  recentScans = recentScans.filter(scan => !scan.timestamp || scan.timestamp > cutoffTime);
  
  // Clean threatHistory older than retention period
  Object.keys(threatHistory).forEach(url => {
    if (threatHistory[url].timestamp && threatHistory[url].timestamp < cutoffTime) {
      delete threatHistory[url];
    }
  });
  
  console.log('[Threat Detector][Privacy] Performed scheduled data cleanup');
}

// Function to allow users to clear their data
function clearUserData() {
  recentScans = [];
  fixedSites = {};
  threatHistory = {};
  
  // Clear any stored data
  chrome.storage.local.remove(['recentScans', 'fixedSites', 'threatHistory']);
  
  console.log('[Threat Detector][Privacy] All user data cleared');
  return true;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TOGGLE_DEBUG') {
    debugMode = msg.enabled;
    sendResponse({ success: true, debugMode });
  }
  if (msg.type === 'THREAT_DETECTOR_URL') {
    console.log('[Threat Detector][Debug] Scanning URL:', msg.url);
    // Optionally, store the URL with no score yet
    recentScans.unshift({ url: msg.url, score: null, level: null });
    recentScans = recentScans.slice(0, 5);
  }
  if (msg.type === 'THREAT_DETECTOR_RESULTS' && debugMode) {
    console.log('[Threat Detector][Debug]', msg);
  }
  if (msg.type === 'THREAT_DETECTOR_RESULTS') {
    if (msg.url && msg.threats) {
      let currentThreats = msg.threats.map(t => t.item);
      if (threatHistory[msg.url]) {
         threatHistory[msg.url] = Array.from(new Set([...threatHistory[msg.url], ...currentThreats]));
      } else {
         threatHistory[msg.url] = currentThreats;
      }
      // Add timestamp for data retention
      threatHistory[msg.url].timestamp = Date.now();
    }
    // Update score for the most recent scan
    if (msg.securityLevel && typeof msg.totalScore === 'number') {
      const last = recentScans.find(r => r.url === sender.tab?.url);
      if (last) {
        last.score = msg.totalScore;
        last.level = msg.securityLevel;
        last.timestamp = Date.now(); // Add timestamp for data retention
      } else if (sender.tab?.url) {
        recentScans.unshift({ 
          url: sender.tab.url, 
          score: msg.totalScore, 
          level: msg.securityLevel,
          timestamp: Date.now()
        });
        recentScans = recentScans.slice(0, 5);
      }
    }
  }
  if (msg.type === 'GET_RECENT_SCANS') {
    sendResponse({ recentScans });
  }
  if (msg.type === 'THREAT_DETECTOR_FIX_MARK') {
    if (msg.issue === 'FIX_ALL') {
      fixedSites[msg.url] = true;
      console.log('[Threat Detector][Background] Site marked as fully fixed:', msg.url);
    }
  }
  if (msg.type === 'GET_FIXED_STATUS') {
    sendResponse({ fixed: fixedSites[msg.url] === true });
  }
  if (msg.type === 'GET_THREAT_HISTORY') {
    sendResponse({ history: threatHistory[msg.url] || [] });
  }
  if (msg.type === 'GET_PRIVACY_POLICY') {
    sendResponse({ policy: PRIVACY_POLICY });
  }
  if (msg.type === 'ACCEPT_PRIVACY_POLICY') {
    chrome.storage.local.set({ privacyPolicyAccepted: true });
    sendResponse({ success: true });
  }
  if (msg.type === 'CLEAR_USER_DATA') {
    const success = clearUserData();
    sendResponse({ success });
  }
});

const knownBadDomains = ['example-malware.com','bad-domain.net'];

// 🔗 Network Traffic: malicious domains & large POST bodies (non-blocking)
chrome.webRequest.onBeforeSendHeaders.addListener(details => {
  const url = details.url;
  if (knownBadDomains.some(d => url.includes(d))) {
    console.log('[Threat Detector][Network] Potentially malicious domain detected (limited detection):', url);
    // Note: This is a basic detection of known bad domains, not comprehensive protection
  }
  if (details.method === 'POST' && details.requestHeaders) {
    const cl = details.requestHeaders.find(h => h.name.toLowerCase() === 'content-length');
    const size = cl ? parseInt(cl.value, 10) : 0;
    if (size > 1000) {
      console.log('[Threat Detector][Network] Large POST detected, size:', size);
    }
  }
}, { urls: ['<all_urls>'] }, ['requestHeaders']);

// 🔐 Permissions: camera/mic without prompt
chrome.permissions.onAdded.addListener(perm => {
  if (perm.permissions.includes('camera') || perm.permissions.includes('microphone')) {
    console.log('[Threat Detector][Permissions] Camera/mic access requested');
    // ...store or notify as needed...
  }
});

// Add a tab update listener to initialize threat detection on each navigation
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Only run when the page has completed loading
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    console.log('[Threat Detector][Background] Tab updated:', tab.url);
    
    // Tell the content script to run threat detection
    chrome.tabs.sendMessage(tabId, { 
      type: 'THREAT_DETECTOR_TAB_UPDATED',
      url: tab.url
    }).catch(err => {
      // Ignore errors if content script isn't ready yet
      console.log('[Threat Detector][Background] Could not send update message:', err);
    });
  }
});