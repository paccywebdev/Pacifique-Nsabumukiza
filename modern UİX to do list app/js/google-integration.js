/**
 * Google Calendar API Integration
 * 
 * INSTRUCTIONS FOR USER:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project.
 * 3. Enable "Google Calendar API".
 * 4. Go to "Credentials", create an "OAuth 2.0 Client ID" (Web application).
 * 5. Add your authorized origins (e.g., http://localhost:5500).
 * 6. Create an "API Key".
 * 7. Copy the Client ID and API Key below.
 */

// Google Calendar API Integration with Dynamic Configuration

// Default placeholders
let CLIENT_ID = localStorage.getItem('paccy_google_client_id') || '';
let API_KEY = localStorage.getItem('paccy_google_api_key') || '';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Function to update config from UI
function updateGoogleConfig(newClientId, newApiKey) {
    if (newClientId && newApiKey) {
        localStorage.setItem('paccy_google_client_id', newClientId);
        localStorage.setItem('paccy_google_api_key', newApiKey);
        CLIENT_ID = newClientId;
        API_KEY = newApiKey;

        // Re-initialize if already loaded
        if (typeof google !== 'undefined' && google.accounts) {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: '', // defined later in handleAuth
            });
        }
        if (gapiInited) {
            gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
        }
        alert('Google Configuration Saved!');
    } else {
        alert('Please provide both Client ID and API Key.');
    }
}
window.updateGoogleConfig = updateGoogleConfig;

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}
window.gapiLoaded = gapiLoaded;

/**
 * Callback after the Google Identity Services library is loaded.
 */
function gisLoaded() {
    // Only init if we have ID, otherwise wait for user to input
    if (CLIENT_ID) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
        });
        gisInited = true;
    }
}
window.gisLoaded = gisLoaded;

/**
 * Initialize the gapi.client
 */
async function initializeGapiClient() {
    if (!API_KEY) return; // Wait for config
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
}

/**
 *  Sign in the user upon button click.
 */
async function handleGoogleAuth(callback) {
    if (!CLIENT_ID || !API_KEY) {
        alert('Please configure your Google Cloud Client ID and API Key in Settings > Integrations to enable real sync.');
        // Open settings modal if possible
        const modal = document.getElementById('modal-container');
        if (modal) modal.classList.remove('hidden');

        throw new Error('Missing Configuration');
    }

    // Lazy init if not done yet (e.g. keys were just added)
    if (!tokenClient && google && google.accounts) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '',
        });
    }

    if (!gapiInited && gapi && gapi.client) {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        await callback();
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}
window.handleGoogleAuth = handleGoogleAuth;

/**
 * Fetch events from Google Calendar and add to Storage
 */
async function listUpcomingEvents() {
    const events = await gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    const tasks = events.result.items;
    if (!tasks || tasks.length == 0) {
        return 0;
    }

    let count = 0;
    tasks.forEach((event) => {
        const when = event.start.dateTime;
        if (!when) return;

        const date = when.split('T')[0]; // Simple date extraction

        // Add to our local storage
        Storage.addTask({
            title: `Google: ${event.summary}`,
            courseId: 'general',
            priority: 'medium',
            dueDate: date,
            type: 'event',
            status: 'pending'
        });
        count++;
    });
    return count;
}
window.listUpcomingEvents = listUpcomingEvents;
