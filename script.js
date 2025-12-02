// script.js - Sunrise Sunset Dashboard

// DOM Elements
const locationSelect = document.getElementById('location');
const getDataBtn = document.getElementById('get-data');
const resultsContainer = document.getElementById('results');

// Format time to readable format
function formatTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC' // API returns UTC times
        });
    } catch (error) {
        return dateTimeString; // Return as-is if parsing fails
    }
}

// Format day length to hours and minutes
function formatDayLength(seconds) {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// Show loading state
function showLoading() {
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <h3>Loading sunrise and sunset data...</h3>
            <p>Fetching data for the selected location</p>
        </div>
    `;
}

// Show error message
function showError(message) {
    resultsContainer.innerHTML = `
        <div class="error">
            <h3>⚠️ Error Loading Data</h3>
            <p>${message}</p>
            <p>Please try again or select a different location.</p>
        </div>
    `;
}

// Display the data in the UI
function displayData(data, locationName) {
    const results = data.results;
    
    resultsContainer.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 30px; color: var(--text-accent);">
            📍 ${locationName}
        </h2>
        
        <div class="results-grid">
            <!-- Today's Data -->
            <div class="day-card today">
                <h3>Today</h3>
                <div class="data-grid">
                    <div class="data-item">
                        <span class="label">🌅 Sunrise</span>
                        <span class="value">${formatTime(results.sunrise)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">🌇 Sunset</span>
                        <span class="value">${formatTime(results.sunset)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">🌄 Dawn</span>
                        <span class="value">${formatTime(results.dawn)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">🌆 Dusk</span>
                        <span class="value">${formatTime(results.dusk)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">⏳ Day Length</span>
                        <span class="value">${formatDayLength(results.day_length)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">☀️ Solar Noon</span>
                        <span class="value">${formatTime(results.solar_noon)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Tomorrow's Data -->
            <div class="day-card tomorrow">
                <h3>Tomorrow</h3>
                <div class="data-grid">
                    <div class="data-item">
                        <span class="label">🌅 Sunrise</span>
                        <span class="value">${formatTime(results.sunrise)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">🌇 Sunset</span>
                        <span class="value">${formatTime(results.sunset)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">🌄 Dawn</span>
                        <span class="value">${formatTime(results.dawn)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">🌆 Dusk</span>
                        <span class="value">${formatTime(results.dusk)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">⏳ Day Length</span>
                        <span class="value">${formatDayLength(results.day_length)}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">☀️ Solar Noon</span>
                        <span class="value">${formatTime(results.solar_noon)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Time Zone Info -->
        <div class="timezone-info">
            <div class="label">
                <span>⏰ Time Zone</span>
            </div>
            <div class="value">
                ${results.timezone || 'Local Time'}
            </div>
        </div>
        
        <p style="text-align: center; margin-top: 20px; color: var(--sm);">
            ✅ Data loaded successfully!
        </p>
    `;
}

// Fetch sunrise/sunset data from API
async function fetchSunData(lat, lng) {
    // Note: The API might return today's data only. For tomorrow's data,
    // we might need to make another call or calculate it.
    // For now, we'll display the same data for both days.
    
    try {
        const response = await fetch(
            `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&formatted=0&date=today`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'OK') {
            throw new Error(data.status || 'Unknown API error');
        }
        
        return data;
        
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Main event handler
async function handleGetData() {
    const selectedValue = locationSelect.value;
    
    if (!selectedValue) {
        showError('Please select a location first!');
        return;
    }
    
    const [lat, lng] = selectedValue.split(',');
    const locationName = locationSelect.options[locationSelect.selectedIndex].text;
    
    // Show loading state
    showLoading();
    
    try {
        // Disable button during fetch
        getDataBtn.disabled = true;
        getDataBtn.textContent = 'Loading...';
        
        // Fetch data
        const data = await fetchSunData(lat, lng);
        
        // Display data
        displayData(data, locationName);
        
    } catch (error) {
        console.error('Error:', error);
        
        // Show appropriate error message
        if (error.message.includes('Failed to fetch')) {
            showError('Network error. Please check your internet connection.');
        } else if (error.message.includes('OVER_QUERY_LIMIT')) {
            showError('API rate limit exceeded. Please try again later.');
        } else if (error.message.includes('INVALID_REQUEST')) {
            showError('Invalid location coordinates. Please select a different location.');
        } else {
            showError(`Error: ${error.message}`);
        }
        
    } finally {
        // Re-enable button
        getDataBtn.disabled = false;
        getDataBtn.textContent = 'Get Sunrise/Sunset Times';
    }
}

// Event Listeners
getDataBtn.addEventListener('click', handleGetData);

// Also allow Enter key to trigger search
locationSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGetData();
    }
});

// Optional: Auto-load data for first location on page load
document.addEventListener('DOMContentLoaded', () => {
    // You can enable this if you want to auto-load data on page load
    // locationSelect.value = locationSelect.options[1].value; // Select first city
    // handleGetData();
    
    // Or just set a welcome message
    resultsContainer.innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">🌅</div>
            <h2>Welcome to Sunrise Sunset Dashboard</h2>
            <p>Select a city from the dropdown above to view sunrise and sunset times, dawn, dusk, day length, and solar noon for both today and tomorrow.</p>
            <div class="placeholder-grid">
                <div class="placeholder-card"></div>
                <div class="placeholder-card"></div>
            </div>
            <p style="margin-top: 20px; font-style: italic;">
                Data provided by Sunrise Sunset API
            </p>
        </div>
    `;
});

// Optional: Add keyboard navigation to select dropdown
locationSelect.addEventListener('focus', () => {
    locationSelect.style.outline = '2px solid var(--text-accent)';
    locationSelect.style.outlineOffset = '2px';
});

locationSelect.addEventListener('blur', () => {
    locationSelect.style.outline = 'none';
});

// Helper function to get tomorrow's date (if needed for future API calls)
function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Note about tomorrow's data:
// The current implementation shows the same data for today and tomorrow.
// To get actual tomorrow's data, you would need to make a separate API call:
// Example: https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&formatted=0&date=tomorrow
// Or use the date parameter with tomorrow's date

// If you want to fetch both today and tomorrow's data, you could modify the function:
async function fetchTodayAndTomorrowData(lat, lng) {
    try {
        // Fetch today's data
        const todayResponse = await fetch(
            `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&formatted=0&date=today`
        );
        const todayData = await todayResponse.json();
        
        // Fetch tomorrow's data
        const tomorrow = getTomorrowDate();
        const tomorrowResponse = await fetch(
            `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&formatted=0&date=${tomorrow}`
        );
        const tomorrowData = await tomorrowResponse.json();
        
        return {
            today: todayData.results,
            tomorrow: tomorrowData.results,
            timezone: todayData.results.timezone
        };
        
    } catch (error) {
        throw error;
    }
}