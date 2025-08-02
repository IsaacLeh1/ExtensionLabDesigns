document.addEventListener('DOMContentLoaded', function() {
  // Get privacy policy information from background script
  chrome.runtime.sendMessage({ type: 'GET_PRIVACY_POLICY' }, function(response) {
    if (response && response.policy) {
      const policy = response.policy;
      
      // Update policy version and date
      document.getElementById('policyVersion').textContent = policy.version;
      document.getElementById('lastUpdated').textContent = policy.lastUpdated;
    }
  });
  
  // Set up data clearing functionality
  document.getElementById('clearDataBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      chrome.runtime.sendMessage({ type: 'CLEAR_USER_DATA' }, function(response) {
        if (response && response.success) {
          alert('All your data has been cleared successfully.');
        } else {
          alert('There was a problem clearing your data. Please try again.');
        }
      });
    }
  });
});
