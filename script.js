// Add Gmail API configuration at the top
const GMAIL_CONFIG = {
  apiKey: 'AIzaSyDBAfal0TyznYnZOPOEjuvjeXiKXLaHOTk',
  clientId: '907370875987-2qc7665tvdqk69c1u3qm1b0vc5i3c7pv.apps.googleusercontent.com',
  scopes: 'https://www.googleapis.com/auth/gmail.send',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
};

// Load the Gmail API client
function loadGmailApi() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: GMAIL_CONFIG.apiKey,
        clientId: GMAIL_CONFIG.clientId,
        discoveryDocs: GMAIL_CONFIG.discoveryDocs,
        scope: GMAIL_CONFIG.scopes
      }).then(() => {
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  });
}

// Function to send email using Gmail API
async function sendGmailWithAttachment(emailData) {
  try {
    // Check if user is signed in
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await gapi.auth2.getAuthInstance().signIn();
    }

    const attachments = await Promise.all(
      Array.from(document.getElementById('attachmentInput').files)
        .map(file => readFileAsBase64(file))
    );

    const email = createEmailWithAttachments(emailData, attachments);

    await gapi.client.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: createRawEmail(email)
      }
    });

    alert('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    alert('Failed to send email. Please try again.');
  }
}

// Helper function to read file as base64
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({
        filename: file.name,
        mimeType: file.type,
        content: base64
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Create email with attachments
function createEmailWithAttachments(emailData, attachments) {
  const boundary = 'boundary' + Math.random().toString(36);
  const mimeVersion = 'MIME-Version: 1.0\n';
  const contentType = 'Content-Type: multipart/mixed; boundary=' + boundary + '\n';

  let email = [
    'To: ' + emailData.to,
    'From: ' + emailData.from,
    'Subject: ' + emailData.subject,
    mimeVersion,
    contentType,
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailData.body,
    ''
  ];

  // Add attachments
  attachments.forEach(attachment => {
    email = email.concat([
      '--' + boundary,
      'Content-Type: ' + (attachment.mimeType || 'application/octet-stream'),
      'Content-Transfer-Encoding: base64',
      'Content-Disposition: attachment; filename=' + attachment.filename,
      '',
      attachment.content
    ]);
  });

  email.push('--' + boundary + '--');
  return email.join('\n');
}

// Convert email to base64url format
function createRawEmail(emailContent) {
  return btoa(emailContent)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Update the openEmailClient function
function openEmailClient(client, emailData) {
  const subject = encodeURIComponent(emailData.subject);
  const body = encodeURIComponent(emailData.body);

  switch (client) {
    case 'gmail':
      // Check if there are attachments
      if (emailData.attachments && emailData.attachments.length > 0) {
        // Load Gmail API and send with attachments
        loadGmailApi()
          .then(() => sendGmailWithAttachment(emailData))
          .catch(error => {
            console.error('Error loading Gmail API:', error);
            alert('Failed to load Gmail API. Please try again.');
          });
      } else {
        // No attachments, use simple Gmail compose URL
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${emailData.to}&su=${subject}&body=${body}`, '_blank');
      }
      break;
    case 'outlook':
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      break;
    default:
      window.location.href = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
      break;
  }
}

document.documentElement.style.setProperty('--animate-duration', '0.5s');
document.addEventListener('DOMContentLoaded', function () {
  // Configuration
  const config = {
    spreadsheetId: '1UqQev32I997yJ7BVYjCf-VKt2NUS7mat1n0LZn_G6bI',
    apiKey: 'AIzaSyA03sD9ydP_SbJdntHVND5Htb4PkqQDx_c',
    sheetName: 'UK', // Default sheet
    range: 'A1:J100'
  };

  // Country-specific configurations
  const countryConfigs = {
    UK: {
      cities: ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds',
        'Sheffield', 'Bristol', 'Newcastle', 'Nottingham', 'Leicester',
        'Cambridge', 'Oxford', 'Edinburgh', 'Glasgow', 'Cardiff', 'Belfast'],
      currencySymbol: '£',
      sheetName: 'UK'
    },
    Australia: {
      cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
        'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart',
        'Darwin', 'Cairns', 'Townsville', 'Geelong'],
      currencySymbol: 'A$',
      sheetName: 'Australia'
    },
    Europe: {
      cities: ['Paris', 'Berlin', 'Amsterdam', 'Barcelona', 'Madrid',
        'Rome', 'Milan', 'Vienna', 'Prague', 'Copenhagen', 'Stockholm',
        'Dublin', 'Lisbon', 'Athens', 'Warsaw'],
      currencySymbol: '€',
      sheetName: 'Europe'
    }
  };

  const fieldsOfStudy = ['Computer Science', 'Business Administration', 'Engineering',
    'Medicine', 'Law', 'Arts', 'Psychology', 'Economics',
    'Architecture', 'Education', 'Biology', 'Chemistry'];

  // Initialize the page
  let currentCountry = 'UK';
  populateDropdowns(currentCountry);
  testConnection();

  // Handle country change
  document.getElementById('country').addEventListener('change', function (e) {
    currentCountry = e.target.value;
    config.sheetName = countryConfigs[currentCountry].sheetName;
    populateDropdowns(currentCountry);
    updateCurrencyLabels(currentCountry);
    // Clear previous results
    document.querySelector('#resultsTable tbody').innerHTML = '';
  });

  // Populate dropdowns
  function populateDropdowns(country) {
    const locationContainer = document.getElementById('locationCheckboxes');
    locationContainer.innerHTML = ''; // Clear existing checkboxes
    countryConfigs[country].cities.forEach(city => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" name="location" value="${city}"> ${city}`;
      locationContainer.appendChild(label);
    });

    const fieldContainer = document.getElementById('fieldCheckboxes');
    fieldContainer.innerHTML = ''; // Clear existing checkboxes
    fieldsOfStudy.forEach(field => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" name="field" value="${field}"> ${field}`;
      fieldContainer.appendChild(label);
    });

    // Update fee range options with correct currency
    updateFeeRangeOptions(country);
  }

  function updateFeeRangeOptions(country) {
    const feeSelect = document.getElementById('fee');
    const symbol = countryConfigs[country].currencySymbol;
    feeSelect.innerHTML = `
      <option value="">Select Range</option>
      <option value="5000-10000">${symbol}5,000-${symbol}10,000</option>
      <option value="10000-15000">${symbol}10,000-${symbol}15,000</option>
      <option value="15000-20000">${symbol}15,000-${symbol}20,000</option>
      <option value="20000-25000">${symbol}20,000-${symbol}25,000</option>
      <option value="25000-30000">${symbol}25,000-${symbol}30,000</option>
      <option value="30000+">${symbol}30,000+</option>
    `;
  }

  function updateCurrencyLabels(country) {
    const symbol = countryConfigs[country].currencySymbol;
    document.querySelector('label[for="fee"]').textContent = `Fee Range (${symbol}):`;
  }

  // Update formatCurrency function to handle different currencies
  function formatCurrency(value, country = currentCountry) {
    if (!value) return 'N/A';
    const symbol = countryConfigs[country].currencySymbol;
    const num = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(num) ? value : symbol + num.toLocaleString('en-GB');
  }

  // Test the connection on load
  async function testConnection() {
    try {
      const data = await fetchDataFromGoogleSheets(config);
      if (data && data.length > 0) {
        displayResults(data.slice(0, 5)); // Show first 5 records for testing
      } else {
        displayError(new Error('Data loaded but empty'));
      }
    } catch (error) {
      displayError(error);
    }
  }

  // Fetch data from Google Sheets by using google API via Google cloud console
  async function fetchDataFromGoogleSheets({ spreadsheetId, apiKey, sheetName, range }) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      throw new Error('No data found in the sheet');
    }

    // Transform the data into an array of objects
    const headers = data.values[0].map(header =>
      header.trim()
        .replace(/ /g, '_')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
    );

    return data.values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || 'N/A';
      });
      return obj;
    });
  }

  // Display results in the table
  function displayFilteredResults(universities, activeFilters) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = '';

    if (!universities || universities.length === 0) {
      tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="no-results">
                    <div class="no-results-content">
                        <h3>No universities match your degree selection</h3>
                        <p>Try adjusting your filters:</p>
                        <ul>
                            ${activeFilters.locations?.length ? '<li>Choose different locations</li>' : ''}
                            ${activeFilters.englishTests?.length ? '<li>Select different English tests</li>' : ''}
                            ${activeFilters.cgpa ? '<li>Widen your score range</li>' : ''}
                            ${activeFilters.fields?.length ? '<li>Choose different fields of study</li>' : ''}
                            ${activeFilters.fee ? '<li>Adjust your fee range</li>' : ''}
                        </ul>
                    </div>
                </td>
            </tr>
        `;
      return;
    }

    universities.forEach((uni, index) => {
      const row = document.createElement('tr');
      row.style.animationDelay = `${index * 0.05}s`;
      row.classList.add('animate__animated', 'animate__fadeInUp');
      row.innerHTML = `
            <td>${escapeHtml(uni.University_Name || 'N/A')}</td>
            <td class="degree-match">${escapeHtml(uni.Degree || 'N/A')}</td>
            <td>${formatListItems(uni.Location, activeFilters.locations)}</td>
            <td>${formatScore(uni.Percentage_CGPA, activeFilters.cgpa)}</td>
            <td>${formatListItems(uni.English_Test, activeFilters.englishTests, /,\s*|\/|and|or/)}</td>
            <td>${escapeHtml(uni.Study_Gap || 'N/A')}</td>
            <td>${formatListItems(uni.Field_of_Study, activeFilters.fields)}</td>
            <td>${formatCurrency(uni.Fee, activeFilters.fee)}</td>
            <td>${formatCurrency(uni.Initial_Deposit)}</td>
            <td>${escapeHtml(uni.Other_Remarks || 'N/A')}</td>
            <td><input type="text" class="program-name-input" placeholder="Enter program name"></td>
        `;
      tableBody.appendChild(row);
    });
  }


  // Helper functions
  function escapeHtml(text) {
    return text ? text.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'N/A';
  }

  function formatListItems(value, filterItems, separator = /,\s*/) {
    if (!value) return 'N/A';
    if (!filterItems || filterItems.length === 0) return escapeHtml(value);

    return value.split(separator)
      .map(item => {
        const isMatch = filterItems.some(f =>
          f.toLowerCase() === item.trim().toLowerCase()
        );
        return isMatch ?
          `<span class="filter-match">${escapeHtml(item.trim())}</span>` :
          escapeHtml(item.trim());
      })
      .join(', ');
  }

  function formatScore(value, rangeFilter) {
    if (!value) return 'N/A';

    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(numericValue)) return escapeHtml(value);

    let displayValue = value.includes('%') ?
      `${numericValue}%` :
      `${numericValue.toFixed(1)} CGPA`;

    if (rangeFilter) {
      const [min, max] = rangeFilter.split('-').map(parseFloat);
      if (numericValue >= min && numericValue <= max) {
        displayValue = `<span class="filter-match">${displayValue}</span>`;
      }
    }

    return displayValue;
  }

  // Helper function to format currency
  function formatCurrency(value) {
    if (!value) return 'N/A';
    if (value.includes('£')) return value;
    const num = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(num) ? value : '£' + num.toLocaleString('en-GB');
  }

  // Display error message
  function displayError(error) {
    console.error('Error:', error);
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; color: red;">
                    
                    No data Available. Kindly select filter.
                </td>
            </tr>
        `;
  }

  // Form submission handler
  document.getElementById('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Searching...';

    try {
      // 1. Fetch data
      const rawData = await fetchDataFromGoogleSheets(config);
      if (!rawData || rawData.length === 0) {
        throw new Error("No university data available");
      }

      // 2. Get filter values
      const filters = {
        degree: document.getElementById('degree').value,
        englishTests: Array.from(document.querySelectorAll('input[name="englishTest"]:checked'))
          .map(el => el.value),
        locations: Array.from(document.querySelectorAll('input[name="location"]:checked'))
          .map(el => el.value),
        cgpa: document.getElementById('cgpa').value,
        fields: Array.from(document.querySelectorAll('input[name="field"]:checked'))
          .map(el => el.value),
        fee: document.getElementById('fee').value
      };

      console.log("Active filters:", filters);

      // 3. Apply filtering with degree as primary filter
      const filteredData = filterUniversities(rawData, filters);
      console.log(`Found ${filteredData.length} matching records`);

      // 4. Display results
      displayFilteredResults(filteredData, filters);

    } catch (error) {
      console.error("Search error:", error);
      displayError(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Find Universities';
    }
  });

  // Filter universities
  function filterUniversities(data, criteria) {
    // If no filters selected, return all data
    if (!criteria || Object.keys(criteria).length === 0) {
      return data;
    }

    return data.filter(university => {
      // 1. Degree Level - ALWAYS apply strict exact match when selected
      if (criteria.degree && criteria.degree !== "") {
        const uniDegree = university.Degree ? university.Degree.trim().toLowerCase() : '';
        if (uniDegree !== criteria.degree.trim().toLowerCase()) {
          return false; // Skip if degree doesn't match exactly
        }
      }

      // Only apply other filters if degree matches first
      // 2. Location - Optional filter
      if (criteria.locations && criteria.locations.length > 0) {
        if (!university.Location) return false;

        const uniLocations = university.Location.toLowerCase().split(/,\s*/)
          .map(loc => loc.trim());

        const hasMatch = criteria.locations.some(loc =>
          uniLocations.includes(loc.trim().toLowerCase())
        );

        if (!hasMatch) return false;
      }

      // 3. English Test - Optional filter
      if (criteria.englishTests && criteria.englishTests.length > 0) {
        if (!university.English_Test) return false;

        const uniTests = university.English_Test.toLowerCase()
          .split(/,\s*|\/|and|or/)
          .map(test => test.trim());

        const hasMatch = criteria.englishTests.some(test =>
          uniTests.includes(test.trim().toLowerCase())
        );

        if (!hasMatch) return false;
      }

      // 4. Percentage/CGPA - Optional filter
      if (criteria.cgpa) {
        if (!university.Percentage_CGPA) return false;

        const [minRange, maxRange] = criteria.cgpa.split('-').map(parseFloat);
        const uniValue = parseFloat(university.Percentage_CGPA.replace(/[^\d.]/g, ''));

        if (isNaN(uniValue)) return false;
        if (uniValue < minRange || uniValue > maxRange) return false;
      }

      // 5. Field of Study - Optional filter
      if (criteria.fields && criteria.fields.length > 0) {
        if (!university.Field_of_Study) return false;

        const uniFields = university.Field_of_Study.toLowerCase()
          .split(/,\s*/)
          .map(field => field.trim());

        const hasMatch = criteria.fields.some(field =>
          uniFields.includes(field.trim().toLowerCase())
        );

        if (!hasMatch) return false;
      }

      // 6. Fee - Optional filter
      if (criteria.fee) {
        if (!university.Fee) return false;

        const feeValue = parseFloat(university.Fee.replace(/[^\d.]/g, ''));
        if (isNaN(feeValue)) return false;

        if (criteria.fee.endsWith('+')) {
          const minFee = parseFloat(criteria.fee.replace(/[^\d.]/g, ''));
          if (feeValue < minFee) return false;
        } else {
          const [minFee, maxFee] = criteria.fee.split('-').map(f => parseFloat(f.replace(/[^\d.]/g, '')));
          if (feeValue < minFee || feeValue > maxFee) return false;
        }
      }

      return true;
    });
  }
});
// Download functionality
let downloadMenuVisible = false;

document.getElementById('downloadBtn').addEventListener('click', function (e) {
  e.stopPropagation();
  downloadMenuVisible = !downloadMenuVisible;
  const options = document.querySelector('.download-options');

  if (downloadMenuVisible) {
    options.classList.add('show');

    // Close when clicking outside
    const clickHandler = function (event) {
      if (!options.contains(event.target) && event.target !== this) {
        options.classList.remove('show');
        downloadMenuVisible = false;
        document.removeEventListener('click', clickHandler);
      }
    };

    document.addEventListener('click', clickHandler);
  } else {
    options.classList.remove('show');
  }
});

// Smooth hover implementation
document.querySelectorAll('.download-option').forEach(option => {
  option.addEventListener('mouseenter', function () {
    this.style.backgroundColor = '#f5f5f5';
  });

  option.addEventListener('mouseleave', function () {
    this.style.backgroundColor = 'white';
  });

  option.addEventListener('click', function (e) {
    e.stopPropagation();
    const type = this.getAttribute('data-type');
    const filteredData = getCurrentFilteredData();

    if (!filteredData || filteredData.length === 0) {
      alert('No data available to download');
      return;
    }

    if (type === 'pdf') {
      // Show client details modal before downloading
      showClientDetailsModal(filteredData);
    } else {
      downloadAsCSV(filteredData);
    }

    document.querySelector('.download-options').classList.remove('show');
    downloadMenuVisible = false;
  });
});

// Email functionality
document.getElementById('emailBtn').addEventListener('click', function () {
  const filteredData = getCurrentFilteredData();
  if (!filteredData || filteredData.length === 0) {
    alert('No data available to email');
    return;
  }
  showEmailModal(filteredData);
});

// Email Modal
function showEmailModal(data) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
        <div class="modal-content">
            <h3>Email University Results</h3>
            <div class="form-group">
                <label for="senderEmail">Your Email:</label>
                <input type="email" id="senderEmail" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label for="clientEmail">Recipient Email:</label>
                <input type="email" id="clientEmail" placeholder="client@example.com" required>
            </div>
            <div class="form-group">
                <label for="emailSubject">Subject:</label>
                <input type="text" id="emailSubject" value="Your University Search Results" required>
            </div>
            <div class="form-group">
                <label for="emailMessage">Message:</label>
                <textarea id="emailMessage" rows="4" required>Dear Client,

Please find attached the university search results you requested.

Best regards,
University Finder Team</textarea>
            </div>
            <div class="attachment-section">
                <h4>Attachments</h4>
                <div class="attachment-list" id="attachmentList"></div>
                <input type="file" id="attachmentInput" class="attachment-input" multiple>
                <button type="button" class="add-attachment-btn" onclick="document.getElementById('attachmentInput').click()">
                    <i class="fas fa-paperclip"></i> Add Attachment
                </button>
            </div>
            <div class="form-group">
                <label for="emailClient">Choose Email Client:</label>
                <select id="emailClient" required>
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Microsoft Outlook</option>
                    <option value="default">Default Email Client</option>
                </select>
            </div>
            <div id="gmailAuthSection" style="margin: 15px 0; display: none;">
                <button id="gmailSignInBtn" class="modal-btn" style="background-color: #DB4437; color: white;">
                    <i class="fab fa-google"></i> Sign in with Gmail
                </button>
                <p id="gmailAuthStatus" style="margin-top: 10px; font-size: 14px; color: #666;"></p>
            </div>
            <div class="modal-actions">
                <button id="sendEmail" class="modal-btn primary">
                    <i class="fas fa-paper-plane"></i> Send Email
                </button>
                <button id="cancelEmail" class="modal-btn secondary">
                    Cancel
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Handle email client selection
  const emailClientSelect = document.getElementById('emailClient');
  const gmailAuthSection = document.getElementById('gmailAuthSection');
  const gmailSignInBtn = document.getElementById('gmailSignInBtn');
  const gmailAuthStatus = document.getElementById('gmailAuthStatus');

  emailClientSelect.addEventListener('change', function () {
    gmailAuthSection.style.display = this.value === 'gmail' ? 'block' : 'none';
  });

  // Initialize Gmail API when selecting Gmail
  if (emailClientSelect.value === 'gmail') {
    gmailAuthSection.style.display = 'block';
  }

  // Handle Gmail sign-in
  gmailSignInBtn.addEventListener('click', async () => {
    try {
      await loadGmailApi();
      const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      if (isSignedIn) {
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const profile = user.getBasicProfile();
        gmailAuthStatus.textContent = `Signed in as ${profile.getEmail()}`;
        gmailAuthStatus.style.color = '#28a745';
        document.getElementById('senderEmail').value = profile.getEmail();
      }
    } catch (error) {
      console.error('Gmail sign-in error:', error);
      gmailAuthStatus.textContent = 'Failed to sign in. Please try again.';
      gmailAuthStatus.style.color = '#dc3545';
    }
  });

  // Handle file attachments
  const attachmentInput = document.getElementById('attachmentInput');
  const attachmentList = document.getElementById('attachmentList');
  const attachments = new Set();

  attachmentInput.addEventListener('change', function (e) {
    const files = e.target.files;
    for (let file of files) {
      if (!attachments.has(file.name)) {
        attachments.add(file.name);
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        attachmentItem.innerHTML = `
          <i class="fas fa-file"></i>
          ${file.name}
          <span class="remove-attachment" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
          </span>
        `;
        attachmentList.appendChild(attachmentItem);
      }
    }
    attachmentInput.value = ''; // Reset input
  });

  // Handle send email
  document.getElementById('sendEmail').addEventListener('click', async function () {
    const senderEmail = document.getElementById('senderEmail').value.trim();
    const clientEmail = document.getElementById('clientEmail').value.trim();
    const subject = document.getElementById('emailSubject').value.trim();
    const message = document.getElementById('emailMessage').value.trim();
    const emailClient = document.getElementById('emailClient').value;

    if (!validateEmail(senderEmail)) {
      alert('Please enter a valid sender email address');
      return;
    }

    if (!validateEmail(clientEmail)) {
      alert('Please enter a valid recipient email address');
      return;
    }

    const emailData = {
      to: clientEmail,
      from: senderEmail,
      subject: subject,
      body: message,
      attachments: Array.from(attachmentList.children).map(item => item.textContent.trim())
    };

    // Open email client based on selection
    openEmailClient(emailClient, emailData);
    modal.remove();
  });

  document.getElementById('cancelEmail').addEventListener('click', function () {
    modal.remove();
  });
}

function formatEmailContent(data, message) {
  let content = message + '\n\n';
  content += 'University Search Results:\n\n';

  // Add table headers
  content += 'University | Degree | Location | Score | Fee | Program Name\n';
  content += '----------|---------|----------|--------|-----|-------------\n';

  // Add table data
  data.forEach(row => {
    content += `${row.University_Name} | ${row.Degree} | ${row.Location} | `;
    content += `${row.Percentage_CGPA} | ${row.Fee} | ${row.Program_Name || 'N/A'}\n`;
  });

  return content;
}

function showAttachmentInstructions(callback) {
  const instructionModal = document.createElement('div');
  instructionModal.className = 'modal-overlay';
  instructionModal.innerHTML = `
    <div class="modal-content attachment-instructions">
      <h3>Attachment Instructions</h3>
      <div class="instruction-content">
        <p>Due to browser security restrictions, files need to be attached manually in your email client.</p>
        <ol>
          <li>Click "Continue" to open your email client</li>
          <li>When your email client opens, locate the attachment button</li>
          <li>Select the files you previously chose to attach</li>
        </ol>
        <div class="files-to-attach">
          <h4>Files to Attach:</h4>
          <ul>
            ${Array.from(document.getElementById('attachmentList').children)
      .map(item => `<li><i class="fas fa-file"></i> ${item.textContent.trim()}</li>`)
      .join('')}
          </ul>
        </div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn primary" id="continueWithEmail">
          <i class="fas fa-check"></i> Continue
        </button>
        <button class="modal-btn secondary" id="cancelInstructions">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(instructionModal);

  document.getElementById('continueWithEmail').addEventListener('click', function () {
    instructionModal.remove();
    if (callback) callback();
  });

  document.getElementById('cancelInstructions').addEventListener('click', function () {
    instructionModal.remove();
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Update getCurrentFilteredData function to get only visible/filtered rows
function getCurrentFilteredData() {
  // Get all visible rows (not hidden by display: none)
  const rows = document.querySelectorAll('#resultsTable tbody tr:not([style*="display: none"])');
  if (rows.length === 0) return null;

  const headers = Array.from(document.querySelectorAll('#resultsTable thead th'))
    .map(th => th.textContent.trim().replace(/\s+/g, '_'));

  // Get active filters
  const activeFilters = getActiveFilters();
  const hasActiveFilters = Object.values(activeFilters).some(filter =>
    filter && (Array.isArray(filter) ? filter.length > 0 : filter !== '')
  );

  // If no filters are active, return all data
  if (!hasActiveFilters) {
    return Array.from(document.querySelectorAll('#resultsTable tbody tr')).map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const rowData = {};
      cells.forEach((cell, index) => {
        if (headers[index] === 'Program_Name') {
          const input = cell.querySelector('input');
          rowData[headers[index]] = input ? input.value.trim() || 'N/A' : 'N/A';
        } else {
          rowData[headers[index]] = cell.textContent.trim();
        }
      });
      return rowData;
    });
  }

  // Return only filtered data
  return Array.from(rows).map(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    const rowData = {};
    cells.forEach((cell, index) => {
      if (headers[index] === 'Program_Name') {
        const input = cell.querySelector('input');
        rowData[headers[index]] = input ? input.value.trim() || 'N/A' : 'N/A';
      } else {
        rowData[headers[index]] = cell.textContent.trim();
      }
    });
    return rowData;
  });
}

// Function for download as CSV
function downloadAsCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `university_results_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Update downloadAsPDF function to handle filtered data
function downloadAsPDF(data, clientDetails) {
  const { jsPDF } = window.jspdf;

  // Create a new PDF with optimized settings
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add title with smaller font
  doc.setFontSize(14);
  doc.text('APTITUDE MIGRATION - Options as per client Profile', 14, 15);

  // Add client details
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Client Name: ${clientDetails.clientName}`, 14, 25);
  doc.text(`City: ${clientDetails.clientCity}`, 14, 32);

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 39);

  // Prepare data with proper text handling
  const headers = [
    { title: "University", dataKey: "University_Name" },
    { title: "Degree", dataKey: "Degree" },
    { title: "Location", dataKey: "Location" },
    { title: "Score", dataKey: "Percentage_CGPA" },
    { title: "English Test", dataKey: "English_Test" },
    { title: "Study Gap", dataKey: "Study_Gap" },
    { title: "Field", dataKey: "Field_of_Study" },
    { title: `Fee (${countryConfigs[currentCountry].currencySymbol})`, dataKey: "Fee" },
    { title: `Deposit (${countryConfigs[currentCountry].currencySymbol})`, dataKey: "Initial_Deposit" },
    { title: "Remarks", dataKey: "Other_Remarks" },
    { title: "Program Name", dataKey: "Program_Name" }
  ];

  // Process data to ensure proper formatting
  const pdfData = data.map(row => {
    return {
      University_Name: row.University_Name || 'N/A',
      Degree: row.Degree || 'N/A',
      Location: row.Location || 'N/A',
      Percentage_CGPA: row.Percentage_CGPA || 'N/A',
      English_Test: row.English_Test || 'N/A',
      Study_Gap: row.Study_Gap || 'N/A',
      Field_of_Study: row.Field_of_Study || 'N/A',
      Fee: formatCurrencyForPDF(row.Fee),
      Initial_Deposit: formatCurrencyForPDF(row.Initial_Deposit),
      Other_Remarks: row.Other_Remarks || 'N/A',
      Program_Name: row.Program_Name || 'N/A'
    };
  });

  // Generate the table with improved settings
  doc.autoTable({
    head: [headers.map(h => h.title)],
    body: pdfData.map(row => headers.map(h => row[h.dataKey])),
    startY: 45, // Adjusted starting position for the table
    margin: { left: 5, right: 5 },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
      halign: 'center',
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      minCellHeight: 5,
      cellWidth: 'auto'
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      minCellHeight: 10,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 30 }, // University
      1: { cellWidth: 25 }, // Degree
      2: { cellWidth: 25 }, // Location
      3: { cellWidth: 15 }, // CGPA
      4: { cellWidth: 25 }, // English Test
      5: { cellWidth: 15 }, // Study Gap
      6: { cellWidth: 25 }, // Field
      7: { cellWidth: 20 }, // Fee
      8: { cellWidth: 15 }, // Deposit
      9: { cellWidth: 35 }, // Remarks
      10: { cellWidth: 25 } // Program Name
    },
    didParseCell: function (data) {
      const text = data.cell.text;
      if (Array.isArray(text) && text.length > 0) {
        const textLength = text.join(' ').length;
        if (textLength > 50) {
          data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight, textLength / 20);
        }
      }
      data.cell.styles.valign = 'middle';
    },
    willDrawCell: function (data) {
      if (data.cell.text.length > 0) {
        data.cell.styles.cellPadding = 2;
      }
    },
    didDrawPage: function (data) {
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${data.pageCount}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 5
      );
    }
  });

  // Save the PDF
  doc.save(`university_results_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Helper function to truncate long text
function truncateText(text, maxLength) {
  if (!text) return 'N/A';
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

// Helper function for currency formatting
function formatCurrencyForPDF(value, country = currentCountry) {
  if (!value) return 'N/A';
  const symbol = countryConfigs[country].currencySymbol;
  const num = parseFloat(value.replace(/[^\d.]/g, ''));
  return isNaN(num) ? value : symbol + num.toLocaleString('en-GB');
}

// Close dropdown when clicking outside
document.addEventListener('click', function () {
  document.querySelector('.download-options').classList.remove('show');
});

// Helper function to get active filters
function getActiveFilters() {
  return {
    degree: document.getElementById('degree').value !== 'Degree' ? document.getElementById('degree').value : null,
    englishTests: Array.from(document.querySelectorAll('input[name="englishTest"]:checked')).map(el => el.value),
    locations: Array.from(document.querySelectorAll('input[name="location"]:checked')).map(el => el.value),
    cgpa: document.getElementById('cgpa').value,
    fields: Array.from(document.querySelectorAll('input[name="field"]:checked')).map(el => el.value),
    fee: document.getElementById('fee').value
  };
}

// Add function to show client details modal
function showClientDetailsModal(data) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <h3>Client Details</h3>
      <div class="form-group">
        <label for="clientName">Client Name:</label>
        <input type="text" id="clientName" placeholder="Enter client name" required>
      </div>
      <div class="form-group">
        <label for="clientCity">City:</label>
        <input type="text" id="clientCity" placeholder="Enter city" required>
      </div>
      <div class="modal-actions">
        <button id="proceedDownload" class="modal-btn primary">
          <i class="fas fa-download"></i> Download PDF
        </button>
        <button id="cancelDownload" class="modal-btn secondary">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle download
  document.getElementById('proceedDownload').addEventListener('click', function () {
    const clientName = document.getElementById('clientName').value.trim();
    const clientCity = document.getElementById('clientCity').value.trim();

    if (!clientName || !clientCity) {
      alert('Please enter both client name and city');
      return;
    }

    downloadAsPDF(data, { clientName, clientCity });
    modal.remove();
  });

  document.getElementById('cancelDownload').addEventListener('click', function () {
    modal.remove();
  });
}