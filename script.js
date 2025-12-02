// script.js - Sunrise Sunset Dashboard

// DOM Elements
const locationSelect = document.getElementById('location');
const getDataBtn = document.getElementById('get-data');
const resultsContainer = document.getElementById('results');

// Format time to readable format
function formatTime(dateTimeString) {
    if (!dateTimeString || dateTimeString === 'N/A') return 'N/A';
    try {
        // The API returns times like "7:15:18 AM" or "7:15 AM"
        // Remove seconds if present
        let timeStr = dateTimeString;
        
        // Remove seconds (":SS" pattern)
        timeStr = timeStr.replace(/:\d{2}(?=\s*[AP]M)/, '');
        
        // Ensure consistent format
        return timeStr;
    } catch (error) {
        console.error('Error formatting time:', error);
        return dateTimeString;
    }
}

// Format day length (API returns string like "13h 17m" or "13:17")
function formatDayLength(dayLengthString) {
    if (!dayLengthString || dayLengthString === 'N/A') return 'N/A';
    
    console.log('Day length raw:', dayLengthString); // Debug log
    
    try {
        // Already in correct format "Xh Ym"
        if (dayLengthString.includes('h') && dayLengthString.includes('m')) {
            return dayLengthString;
        }
        
        // Format "HH:MM"
        if (dayLengthString.includes(':')) {
            const [hours, minutes] = dayLengthString.split(':');
            return `${parseInt(hours)}h ${parseInt(minutes)}m`;
        }
        
        // If it's a number (seconds)
        const seconds = parseInt(dayLengthString);
        if (!isNaN(seconds)) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
        
        return dayLengthString;
        
    } catch (error) {
        console.error('Error formatting day length:', error);
        return dayLengthString || 'N/A';
    }
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

// Show error message if issue occurs fethcing the data
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
    
    console.log('Raw API results:', results);
    console.log('Day length from API:', results.day_length);
    console.log('Type of day_length:', typeof results.day_length);
    
    resultsContainer.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 30px; color: var(--text-accent);">
            📍 ${locationName}
        </h2>
        
        <div class="results-grid">
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
    const apiUrl1 = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}`;
    const apiUrl2 = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&formatted=0`;
    
    console.log('Trying API URL 1:', apiUrl1);
    
    try {
        let response = await fetch(apiUrl1);
        
        if (!response.ok) {
            console.log('Trying API URL 2:', apiUrl2);
            response = await fetch(apiUrl2);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log('Full API Response:', data);
        
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
        getDataBtn.disabled = false;
        getDataBtn.textContent = 'Get Sunrise/Sunset Times';
    }
}

// Event Listeners
getDataBtn.addEventListener('click', handleGetData);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    resultsContainer.innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">🌅</div>
            <h2>Welcome to Sunrise Sunset Dashboard</h2>
            <p>Choose a city from the dropdown above to view sunrise and sunset times, dawn, dusk, day length, and solar noon for both today and tomorrow.</p>
            <div class="placeholder-grid">
                <div class="placeholder-card"></div>
                <div class="placeholder-card"></div>
            </div>
            <p style="margin-top: 20px; font-style: italic;">
                Data provided by Sunrise Sunset API
            </p>
        </div>
    `;
    
    // Quick API test
    fetch('https://api.sunrisesunset.io/json?lat=40.7128&lng=-74.0060')
        .then(r => r.json())
        .then(d => console.log('API Test - Day length format:', d.results.day_length))
        .catch(e => console.error('API test failed:', e));
});