window.onload = function() {
  console.log('[Threat Detector][Popup] Extension popup loaded'); // Confirm popup runs

  const threatsDiv = document.getElementById('threats');

  // Add a visible confirmation message
  const statusDiv = document.createElement('div');
  statusDiv.style.color = 'blue';
  statusDiv.style.marginBottom = '8px';
  document.body.insertBefore(statusDiv, threatsDiv);

  // Create feedback button
//   const feedbackBtn = document.createElement('button');
//   feedbackBtn.textContent = 'Send Feedback';
//   feedbackBtn.style.marginBottom = '10px';
//   feedbackBtn.style.marginRight = '10px';
//   feedbackBtn.style.backgroundColor = '#4285f4';
//   feedbackBtn.style.color = 'white';
//   feedbackBtn.style.border = 'none';
//   feedbackBtn.style.borderRadius = '4px';
//   feedbackBtn.style.padding = '6px 12px';
//   feedbackBtn.style.cursor = 'pointer';
//   feedbackBtn.onclick = function() {
//     showFeedbackForm();
//   };
//   document.body.insertBefore(feedbackBtn, document.body.firstChild);

  // Add feedback form function
  function showFeedbackForm() {
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.style.backgroundColor = 'white';
    formContainer.style.padding = '20px';
    formContainer.style.borderRadius = '8px';
    formContainer.style.width = '90%';
    formContainer.style.maxWidth = '280px';
    formContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    
    // Create form title
    const title = document.createElement('h3');
    title.textContent = 'Send Feedback';
    title.style.marginTop = '0';
    title.style.textAlign = 'center';
    
    // Create email input
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Your Email:';
    emailLabel.style.display = 'block';
    emailLabel.style.marginBottom = '5px';
    emailLabel.style.fontWeight = 'bold';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'your-email@example.com';
    emailInput.style.width = '100%';
    emailInput.style.padding = '8px';
    emailInput.style.boxSizing = 'border-box';
    emailInput.style.marginBottom = '15px';
    emailInput.style.border = '1px solid #ccc';
    emailInput.style.borderRadius = '4px';
    
    // Create feedback textarea
    const feedbackLabel = document.createElement('label');
    feedbackLabel.textContent = 'Feedback:';
    feedbackLabel.style.display = 'block';
    feedbackLabel.style.marginBottom = '5px';
    feedbackLabel.style.fontWeight = 'bold';
    
    const feedbackTextarea = document.createElement('textarea');
    feedbackTextarea.placeholder = 'Please enter your feedback here...';
    feedbackTextarea.style.width = '100%';
    feedbackTextarea.style.padding = '8px';
    feedbackTextarea.style.boxSizing = 'border-box';
    feedbackTextarea.style.minHeight = '100px';
    feedbackTextarea.style.marginBottom = '15px';
    feedbackTextarea.style.border = '1px solid #ccc';
    feedbackTextarea.style.borderRadius = '4px';
    feedbackTextarea.style.resize = 'vertical';
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    
    // Create send button
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.style.backgroundColor = '#4285f4';
    sendButton.style.color = 'white';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '4px';
    sendButton.style.padding = '8px 16px';
    sendButton.style.cursor = 'pointer';
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.backgroundColor = '#f1f1f1';
    cancelButton.style.color = 'black';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.cursor = 'pointer';
    
    // Add cancel button event
    cancelButton.onclick = function() {
      document.body.removeChild(overlay);
    };
    
    // Add send button event
    sendButton.onclick = function() {
      const email = emailInput.value.trim();
      const feedback = feedbackTextarea.value.trim();
      
      // Basic validation
      if (!email) {
        alert('Please enter your email address.');
        emailInput.focus();
        return;
      }
      
      if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return;
      }
      
      if (!feedback) {
        alert('Please enter your feedback.');
        feedbackTextarea.focus();
        return;
      }
      
      // Send the feedback
      sendFeedback(email, feedback, overlay);
    };
    
    // Function to validate email format
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
    
    // Function to send feedback
    function sendFeedback(email, feedback, overlay) {
      // Create a status message
      const statusMessage = document.createElement('div');
      statusMessage.style.marginTop = '10px';
      statusMessage.style.textAlign = 'center';
      statusMessage.textContent = 'Sending feedback...';
      statusMessage.style.color = 'blue';
      
      formContainer.appendChild(statusMessage);
      
      // Since we can't directly send emails from a Chrome extension,
      // we'll open a mailto link with the feedback pre-filled
      const mailtoLink = `mailto:ExtensionLabDesigns@gmail.com?subject=Threat%20Detector%20Feedback&body=From:%20${encodeURIComponent(email)}%0A%0A${encodeURIComponent(feedback)}`;
      
      window.open(mailtoLink);
      
      // Show success message and close form after a short delay
      statusMessage.textContent = 'Feedback sent! Thank you.';
      statusMessage.style.color = 'green';
      
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 2000);
    }
    
    // Assemble the form
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(sendButton);
    
    formContainer.appendChild(title);
    formContainer.appendChild(emailLabel);
    formContainer.appendChild(emailInput);
    formContainer.appendChild(feedbackLabel);
    formContainer.appendChild(feedbackTextarea);
    formContainer.appendChild(buttonsContainer);
    
    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);
    
    // Focus the email input
    emailInput.focus();
  }

  const debugBtn = document.createElement('button');
  debugBtn.textContent = 'Toggle Debug';
  debugBtn.style.marginBottom = '10px';
  let debugEnabled = false;
  debugBtn.onclick = function() {
    debugEnabled = !debugEnabled;
    chrome.runtime.sendMessage({ type: 'TOGGLE_DEBUG', enabled: debugEnabled }, (resp) => {
      if (chrome.runtime.lastError) {
        console.error('[Threat Detector] Error toggling debug mode:', chrome.runtime.lastError);
        return;
      }
      debugBtn.textContent = resp.debugMode ? 'Debug ON' : 'Debug OFF';
    });
  };
  document.body.insertBefore(debugBtn, document.body.firstChild);

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    // Handle case where tabs can't be accessed (protected page)
    if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
      threatsDiv.innerHTML = `
        <span style="color:orange;">
          Cannot scan this page type. The current page appears to be a protected Chrome page.<br>
          Please try on a regular website.
        </span>
      `;
      return;
    }

    const tab = tabs[0];
    const url = tab.url;

    // Early exit for non-scannable URLs (chrome://, chrome-extension://, etc.)
    if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') || 
        url.startsWith('devtools://') || url.startsWith('about:') ||
        url.startsWith('view-source:') || url.startsWith('data:')) {
      threatsDiv.innerHTML = `
        <span style="color:orange;">
          Cannot scan this page type.<br>
          Chrome internal pages and browser extensions cannot be scanned.
        </span>
      `;
      return;
    }

    // Inform background of the URL
    chrome.runtime.sendMessage({ type: 'THREAT_DETECTOR_URL', url });

    // Only attempt on HTTP/HTTPS pages
    if (!/^https?:\/\//.test(url)) {
      threatsDiv.innerHTML = '<span style="color:orange;">Cannot scan this page type.</span>';
      return;
    }

    // Show scanning indicator
    threatsDiv.innerHTML = '<em>Scanning...</em>';
    let scanTimeout = setTimeout(() => {
      threatsDiv.innerHTML = '<span style="color:red;">Scan timed out or failed.</span>';
    }, 5000);

    // After completing the scan and getting results, send the score to update the danger bar
    function handleResult(result) {
      clearTimeout(scanTimeout);

      const threats = result.threats;
      const checklist = result.checklist || [];
      const securityLevel = result.securityLevel || 'Unknown';

      // Compute danger status UI once
      let statusIcon = '';
      let statusColor = 'gray';
      if (securityLevel === 'Safe') {
        statusIcon = '\uD83D\uDFE2'; // 🟢 green circle
        statusColor = 'green';
      } else if (securityLevel === 'Moderate') {
        statusIcon = '\uD83D\uDFE0'; // 🟠 orange circle
        statusColor = 'orange';
      } else if (securityLevel === 'Dangerous') {
        statusIcon = '\uD83D\uDD34'; // 🔴 red circle
        statusColor = 'red';
      }

      // Filter detected items
      const detectedItems = checklist.filter(item => item.detected);

      chrome.runtime.sendMessage({ type: 'GET_THREAT_HISTORY', url }, function(respHistory) {
        let prevThreats = respHistory.history || [];
        const newDetectedItems = checklist.filter(item => item.detected && !prevThreats.includes(item.item));

        // Compute the danger score only for items currently displayed
        const displayScore = newDetectedItems.reduce((sum, item) => sum + item.weight, 0);
        
        // Always send this score to content script - it's the authoritative value
        chrome.tabs.sendMessage(tab.id, { 
          type: 'UPDATE_DANGER_BAR', 
          score: displayScore,
          isFixed: false
        });
        
        // Log the score for debugging
        console.log('[Threat Detector] Popup calculated score:', displayScore);
        
        // Continue with the rest of the function
        let displayLevel = 'Safe';
        if (displayScore >= 10 && displayScore < 18) displayLevel = 'Moderate';
        if (displayScore >= 18) displayLevel = 'Dangerous';
        let displayIcon = '', displayColor = 'gray';
        if (displayLevel === 'Safe') { displayIcon = '\uD83D\uDFE2'; displayColor = 'green'; }
        else if (displayLevel === 'Moderate') { displayIcon = '\uD83D\uDFE0'; displayColor = 'orange'; }
        else if (displayLevel === 'Dangerous') { displayIcon = '\uD83D\uDD34'; displayColor = 'red'; }

        let html = `<div style="font-size:1.2em;margin-bottom:10px;">
          <strong>Site Danger Status:</strong>
          <span style="color:${displayColor};font-weight:bold;">${displayIcon} ${displayLevel}</span>
        </div>`;
        html += `<div><strong>Total Danger Score:</strong> ${displayScore}</div>`;

        // Check if this site has been fixed before and if there are persistent threats
        chrome.runtime.sendMessage({ type: 'GET_FIXED_STATUS', url }, function(resp) {
          const siteFixed = resp.fixed;
          
          // If site was fixed before AND there are any detected items, show the warning message
          if (siteFixed && detectedItems.length > 0) {
            html += `<div style="color:blue;font-size:0.9em;margin-bottom:8px;">
              A detected threat may reappear because it is required for site functionality.
            </div>`;
          }
          
          // Ask background for the fixed status and continue building checklist HTML
          chrome.runtime.sendMessage({ type: 'GET_FIXED_STATUS', url }, function(resp) {
            const siteFixed = resp.fixed;
            if (newDetectedItems.length) {
              if (siteFixed) {
                html += `<div style="margin-top:10px;"><strong>Checklist:</strong>
                          <ul style="padding-left:18px;">`;
                newDetectedItems.forEach((item, idx) => {
                  // ...existing explanation definitions...
                  let explanations = {
                    'Suspicious script injections':
                      'These scripts change page content or behavior. Legitimate uses: widgets, analytics, or interactive features. Risk: attackers can use them to steal data or hijack your session.',
                    'Clipboard access or hidden keylogging':
                      'Used for custom copy/paste or shortcuts (e.g., chat apps, editors). Risk: can secretly record what you type or copy, stealing sensitive info.',
                    'Inline event handlers (onclick, onload, etc.)':
                      'Lets buttons or images react when you click or load them. Legitimate for simple effects or menus. Risk: can hide harmful actions that run without your knowledge.',
                    'Missing Subresource Integrity on <script> tags':
                      'Loads external scripts without a security check. Legitimate if scripts are trusted (e.g., from a major CDN). Risk: attackers can change these scripts to run harmful code.',
                    'Requests to known malicious domains':
                      'May load ads, analytics, or third-party features. Risk: if the domain is flagged for malware, it could infect your device.',
                    'Mixed-content HTTP resources':
                      'Sometimes used for old images or videos. Risk: loading insecure resources on a secure page lets attackers intercept or change what you see.',
                    'Large outbound POST requests (exfiltration)':
                      'Legitimate for uploading files or sending lots of data (e.g., forms, backups). Risk: could be sending your personal info somewhere unsafe.',
                    'Excessive browser fingerprinting techniques':
                      'Used to prevent fraud or personalize your experience. Risk: can track you across sites and invade your privacy.',
                    'Attempts to access camera/mic without prompt':
                      'Needed for video calls or voice chat. Risk: could record you without your consent.',
                    'Hidden input forms collecting sensitive data':
                      'Used for session management or saving settings. Risk: if collecting passwords or card numbers, could be stealing your info.',
                    'Encrypted/obfuscated JavaScript blobs':
                      'Often used to speed up websites or protect code. Risk: can hide malware or make it hard to see what the code does.',
                    'Match in threat databases':
                      'May use popular libraries or code snippets. Risk: if matched to known malware, the site could be compromised.',
                    'Weak or missing Content Security Policy':
                      'A Content Security Policy (CSP) helps protect you from malicious scripts. Some sites skip this for convenience, but it makes you more vulnerable to attacks.',
                    'Direct download links to executable files':
                      'The site has links to files that can run programs on your device (like .exe or .apk). Legitimate for software downloads, but risky if you did not expect it or if the source is untrusted. Downloading and running these files can infect your device with malware.',
                    'Unusual browser permission requests':
                      'The site asks for browser permissions such as your location, notifications, or clipboard access. Legitimate for maps, reminders, or chat features, but risky if you did not expect it or if the site is untrusted. Granting these permissions can expose your private data or allow unwanted popups.',
                    'Third-party trackers detected':
                      'The site loads scripts from tracking services (like Google Analytics or Facebook Pixel). ' +
                      'These are often used for visitor stats and personalized ads, but they also let companies follow you across multiple sites and build detailed profiles of your activity.',
                    'Sensitive cookies accessible to JavaScript':
                      'Some cookies hold login sessions or tokens and should be hidden from page scripts. ' +
                      'If these appear here, they lack the HttpOnly flag and can be stolen by malicious code.'
                  };
                  let infoDetail = typeof item.detail === 'string' ? item.detail : '';
                  html += `<li style="color:red">
                    ${item.category}: ${item.item} (Detected, +${item.weight})
                    <button class="info-btn" title="What is this?" style="border:none;background:none;cursor:pointer;padding:0;margin-left:6px;">
                      <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#e0e0e0;color:#333;line-height:18px;text-align:center;font-weight:bold;font-size:14px;">i</span>
                    </button>
                  </li>`;
                  item._explanation = explanations[item.item] || infoDetail || 'No further information available.';
                });
                html += `</ul></div>`;
              } else {
                // Only include the Fix All button, not individual fix buttons
                html += `<div style="margin-top:10px;"><strong>Checklist:</strong>
                         <button id="fix-all-btn" style="margin-left:10px;">Fix All</button>
                         <ul style="padding-left:18px;">`;
                newDetectedItems.forEach((item, idx) => {
                  let explanations = {
                    'Suspicious script injections':
                      'These scripts change page content or behavior. Legitimate uses: widgets, analytics, or interactive features. Risk: attackers can use them to steal data or hijack your session.',
                    'Clipboard access or hidden keylogging':
                      'Used for custom copy/paste or shortcuts (e.g., chat apps, editors). Risk: can secretly record what you type or copy, stealing sensitive info.',
                    'Inline event handlers (onclick, onload, etc.)':
                      'Lets buttons or images react when you click or load them. Legitimate for simple effects or menus. Risk: can hide harmful actions that run without your knowledge.',
                    'Missing Subresource Integrity on <script> tags':
                      'Loads external scripts without a security check. Legitimate if scripts are trusted (e.g., from a major CDN). Risk: attackers can change these scripts to run harmful code.',
                    'Requests to known malicious domains':
                      'May load ads, analytics, or third-party features. Risk: if the domain is flagged for malware, it could infect your device.',
                    'Mixed-content HTTP resources':
                      'Sometimes used for old images or videos. Risk: loading insecure resources on a secure page lets attackers intercept or change what you see.',
                    'Large outbound POST requests (exfiltration)':
                      'Legitimate for uploading files or sending lots of data (e.g., forms, backups). Risk: could be sending your personal info somewhere unsafe.',
                    'Excessive browser fingerprinting techniques':
                      'Used to prevent fraud or personalize your experience. Risk: can track you across sites and invade your privacy.',
                    'Attempts to access camera/mic without prompt':
                      'Needed for video calls or voice chat. Risk: could record you without your consent.',
                    'Hidden input forms collecting sensitive data':
                      'Used for session management or saving settings. Risk: if collecting passwords or card numbers, could be stealing your info.',
                    'Encrypted/obfuscated JavaScript blobs':
                      'Often used to speed up websites or protect code. Risk: can hide malware or make it hard to see what the code does.',
                    'Match in threat databases':
                      'May use popular libraries or code snippets. Risk: if matched to known malware, the site could be compromised.',
                    'Weak or missing Content Security Policy':
                      'A Content Security Policy (CSP) helps protect you from malicious scripts. Some sites skip this for convenience, but it makes you more vulnerable to attacks.',
                    'Direct download links to executable files':
                      'The site has links to files that can run programs on your device (like .exe or .apk). Legitimate for software downloads, but risky if you did not expect it or if the source is untrusted. Downloading and running these files can infect your device with malware.',
                    'Unusual browser permission requests':
                      'The site asks for browser permissions such as your location, notifications, or clipboard access. Legitimate for maps, reminders, or chat features, but risky if you did not expect it or if the site is untrusted. Granting these permissions can expose your private data or allow unwanted popups.',
                    'Third-party trackers detected':
                      'The site loads scripts from tracking services (like Google Analytics or Facebook Pixel). ' +
                      'These are often used for visitor stats and personalized ads, but they also let companies follow you across multiple sites and build detailed profiles of your activity.',
                    'Sensitive cookies accessible to JavaScript':
                      'Some cookies hold login sessions or tokens and should be hidden from page scripts. ' +
                      'If these appear here, they lack the HttpOnly flag and can be stolen by malicious code.'
                  };
                  let infoDetail = typeof item.detail === 'string' ? item.detail : '';
                  html += `<li style="color:red">
                    ${item.category}: ${item.item} (Detected, +${item.weight})
                    <button class="info-btn" title="What is this?" style="border:none;background:none;cursor:pointer;padding:0;margin-left:6px;">
                      <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#e0e0e0;color:#333;line-height:18px;text-align:center;font-weight:bold;font-size:14px;">i</span>
                    </button>
                  </li>`;
                  item._explanation = explanations[item.item] || infoDetail || 'No further information available.';
                });
                html += `</ul></div>`;
              }
            }

            // Render threats section
            if (!threats || threats.length === 0) {
              html += '<span style="color:green;">No threats detected.</span>';
            } else {
              html += '<h2>Detected Threats</h2>';
              threats.forEach(t => {
                const el = document.createElement('div');
                el.className = 'threat';
                el.innerHTML = t.category
                  ? `<span class="type">${t.category} (${t.item})</span><br>
                     <span class="detail">${t.detail || ''}</span><br>
                     <span class="weight">Danger Weight: ${t.weight}</span>`
                  : `<span class="type">${t.type}</span><br>
                     <span class="detail">${t.detail}</span>`;
                html += el.outerHTML;
              });
            }
            threatsDiv.innerHTML = html;

            // Attach event handlers using newDetectedItems
            threatsDiv.querySelectorAll('.info-btn').forEach((btn, idx) => {
              btn.addEventListener('click', function() {
                const infoItem = newDetectedItems[idx];
                alert(`${infoItem.item}:\n\n${(typeof infoItem.detail === 'string' && infoItem.detail.length > 0)
                      ? infoItem.detail : infoItem._explanation}`);
              });
            });

            if (!siteFixed) {
              const fixAllBtn = document.getElementById('fix-all-btn');
              if (fixAllBtn) {
                fixAllBtn.addEventListener('click', () => {
                  // Disable the button immediately to prevent multiple clicks
                  fixAllBtn.disabled = true;
                  fixAllBtn.style.opacity = '0.5';
                  fixAllBtn.style.cursor = 'not-allowed';
                  fixAllBtn.textContent = 'Fixing...';
                  
                  // Add "Fixed!" label to each checklist item
                  threatsDiv.querySelectorAll('ul li').forEach(item => {
                    // Check if item doesn't already have a "Fixed!" label
                    if (!item.innerHTML.includes('Fixed!')) {
                      item.innerHTML += '<span style="color:green;font-weight:bold;margin-left:6px;">Fixed!</span>';
                    }
                  });
                  
                  // Continue with existing fix-all logic
                  chrome.tabs.sendMessage(tab.id, { type: 'FIX_ALL' });
                  let fixedList = newDetectedItems.map(item => item.item);
                  newDetectedItems.forEach(item => {
                    chrome.runtime.sendMessage({ type: 'THREAT_DETECTOR_FIX_MARK', url, issue: item.item });
                  });
                  chrome.runtime.sendMessage({ type: 'THREAT_DETECTOR_FIX_MARK', url, issue: 'FIX_ALL' });
                  
                  setTimeout(() => {
                    // Update button to show completed state
                    fixAllBtn.textContent = 'All Fixed';
                    
                    // Request a new scan to get the updated score
                    chrome.tabs.sendMessage(tab.id, { type: 'THREAT_DETECTOR_REQUEST' }, function(newResult) {
                      if (chrome.runtime.lastError) return;
                      
                      // Calculate the revised score
                      let revisedScore = newResult.checklist
                        .filter(item => item.detected && !fixedList.includes(item.item))
                        .reduce((sum, item) => sum + item.weight, 0);
                      
                      console.log('[Threat Detector] Popup calculated revised score after fix:', revisedScore);
                      
                      // Send the revised score as the authoritative value
                      // Mark the site as fixed and explicitly indicate if score is below danger threshold
                      chrome.tabs.sendMessage(tab.id, { 
                        type: 'UPDATE_DANGER_BAR', 
                        score: revisedScore,
                        isFixed: true
                      });
                      
                      // Explicitly request to remove the warning banner if score is now below dangerous threshold
                      if (revisedScore < 18) {
                        chrome.tabs.sendMessage(tab.id, {
                          type: 'REMOVE_WARNING_BANNER'
                        });
                      }
                      
                      // Also store it for persistence
                      chrome.tabs.sendMessage(tab.id, {
                        type: 'STORE_FIXED_SCORE',
                        score: revisedScore
                      });
                      
                      // Update the popup UI with revised score info
                      const newStatusDiv = document.createElement('div');
                      newStatusDiv.style.fontSize = '1.2em';
                      newStatusDiv.style.marginBottom = '10px';
                      
                      let revisedLevel = 'Safe';
                      if (revisedScore >= 10 && revisedScore < 18) revisedLevel = 'Moderate';
                      if (revisedScore >= 18) revisedLevel = 'Dangerous';
                      let revisedIcon = '', revisedColor = 'gray';
                      if (revisedLevel === 'Safe') { revisedIcon = '\uD83D\uDFE2'; revisedColor = 'green'; }
                      else if (revisedLevel === 'Moderate') { revisedIcon = '\uD83D\uDFE0'; revisedColor = 'orange'; }
                      else if (revisedLevel === 'Dangerous') { revisedIcon = '\uD83D\uDD34'; revisedColor = 'red'; }
                      
                      newStatusDiv.innerHTML = `<strong>Updated Site Danger Status:</strong>
                                               <span style="color:${revisedColor};font-weight:bold;">${revisedIcon} ${revisedLevel}</span>
                                               <br/><strong>Revised Danger Score:</strong> ${revisedScore}`;
                      
                      let persistentFound = newResult.checklist.some(item => item.detected && fixedList.includes(item.item));
                      if (persistentFound) {
                        newStatusDiv.innerHTML += `<div style="color:blue;font-size:0.9em;">
                                                A detected threat may reappear because it is required for site functionality.
                                              </div>`;
                      }
                      
                      threatsDiv.insertAdjacentElement('afterbegin', newStatusDiv);
                    });
                  }, 1000);
                });
              }
            }
            chrome.runtime.sendMessage(Object.assign({ type: 'THREAT_DETECTOR_RESULTS', url }, result));

            // ERROR FIX: totalScore is not defined - use displayScore instead
            const maxScore = 35;
            const pct = Math.min(Math.round((displayScore / maxScore) * 100), 100);
            const marker = document.getElementById('danger-scale-marker');
            if (marker) {
              marker.style.left = `calc(${pct}% - 2px)`;
            }
          });
        });
      });
    }

    // Send the scan request to the content script with proper error handling
    chrome.tabs.sendMessage(tab.id, { type: 'THREAT_DETECTOR_REQUEST' }, function(response) {
      if (chrome.runtime.lastError) {
        console.log("[Threat Detector] Content script communication error:", chrome.runtime.lastError.message);
        
        // If we get "cannot be scripted" error, show more specific message
        if (chrome.runtime.lastError.message.includes("cannot be scripted")) {
          threatsDiv.innerHTML = `
            <span style="color:orange;">
              Cannot scan this page. Chrome doesn't allow extensions to access this page.<br>
              This is usually a protected browser page (extensions gallery, settings, etc.).
            </span>
          `;
          clearTimeout(scanTimeout);
          return;
        }
        
        // Fallback: inject content.js then retry
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, () => {
          // Check for scripting execution errors
          if (chrome.runtime.lastError) {
            console.error('[Threat Detector] Script injection error:', chrome.runtime.lastError);
            threatsDiv.innerHTML = `
              <span style="color:red;">
                Cannot scan this page type.<br>
                Chrome doesn't allow extensions to access this page.<br>
                Please try on a regular website.
              </span>
            `;
            clearTimeout(scanTimeout);
            return;
          }
          
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { type: 'THREAT_DETECTOR_REQUEST' }, function(resp2) {
              if (chrome.runtime.lastError) {
                threatsDiv.innerHTML = `
                  <span style="color:red;">
                    Could not connect to scanner.<br>
                    Site may block scanning due to security policy or extension may not be loaded.<br>
                    Try reloading the extension and the tab.
                  </span>
                  <div style="margin-top:10px;">
                    <strong>Troubleshooting:</strong>
                    <ul style="padding-left:18px;">
                      <li>Make sure you are on a regular HTTP/HTTPS website (not PDF, Chrome Web Store, or internal page).</li>
                      <li>Reload the extension in <code>chrome://extensions</code> (click "Reload").</li>
                      <li>Reload the browser tab and try again.</li>
                      <li>Some sites (e.g., GitHub, banking, government) block all extensions for security reasons.</li>
                    </ul>
                  </div>
                `;
              } else {
                handleResult(resp2);
              }
            });
          }, 300);
        });
      } else {
        handleResult(response);
      }
    });
  });

  // Add footer with Privacy Policy link
  const footer = document.createElement('div');
  footer.className = 'footer';
  footer.style.marginTop = '15px';
  footer.style.borderTop = '1px solid #e0e0e0';
  footer.style.paddingTop = '8px';
  footer.style.textAlign = 'center';
  footer.style.fontSize = '0.8em';
  
  const privacyLink = document.createElement('a');
  privacyLink.href = 'privacy-policy.html';
  privacyLink.target = '_blank';
  privacyLink.textContent = 'Privacy Policy';
  
  footer.appendChild(privacyLink);
  document.body.appendChild(footer);
};