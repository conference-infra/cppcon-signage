// Digital Signage JavaScript for CppCon

class DigitalSignage {
    constructor() {
        this.events = [];
        this.currentAdIndex = 0;
        this.adRotationInterval = 10000; // 10 seconds
        this.eventsUpdateInterval = 30000; // 30 seconds
        this.categoryFilter = this.getCategoryFromURL();
        this.init();
    }

    init() {
        this.updateDayDisplay();
        this.loadEvents();
        this.setupAdRotation();
        this.setupEventUpdates();
        
        // Update day display every minute
        setInterval(() => this.updateDayDisplay(), 1000);
        setInterval(() => this.loadEvents(), 1000);
    }

    getCategoryFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('category') || null;
    }

    updateDayDisplay() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const dayName = days[today.getDay()];
        
        const dayElement = document.getElementById('current-day');
        if (dayElement) {
            dayElement.innerHTML = `${dayName}<br>${today.toLocaleTimeString()}`;
        }
    }

    async loadEvents() {
        const response = await fetch('schedule.json');
        const data = await response.json();
        this.events = data.events || [];
        this.updateEventsDisplay();
    }

    updateEventsDisplay() {
        const eventsList = document.getElementById('events-list');
        const sectionTitle = document.querySelector('.section-title');
        if (!eventsList) return;

        // Update section title based on category filter
        if (this.categoryFilter) {
            const categoryName = this.categoryFilter.charAt(0).toUpperCase() + this.categoryFilter.slice(1);
            if (sectionTitle) {
                sectionTitle.textContent = `Upcoming ${categoryName} Events`;
            }
        } else {
            if (sectionTitle) {
                sectionTitle.textContent = 'Upcoming Events';
            }
        }

        const upcomingEvents = this.getUpcomingEvents();
        
        if (upcomingEvents.length === 0) {
            const noEventsMessage = this.categoryFilter 
                ? `No upcoming ${this.categoryFilter} events`
                : 'No upcoming events';
            eventsList.innerHTML = `
                <div class="event-item">
                    <div class="event-bullet"></div>
                    <div class="event-content">
                        <div class="event-title">${noEventsMessage}</div>
                        <div class="event-time">Check back later for updates</div>
                    </div>
                </div>
            `;
            return;
        }

        eventsList.innerHTML = upcomingEvents
            .slice(0, 6) // Show max 6 events
            .map(event => this.createEventHTML(event))
            .join('');
    }

    getUpcomingEvents() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

        return this.events
            .filter(event => {
                // Filter by category if specified
                if (this.categoryFilter && event.category !== this.categoryFilter) {
                    return false;
                }
                
                // Filter by day and time
                const eventDate = new Date(event.date);
                if (eventDate.getFullYear() !== now.getFullYear() ||
                    eventDate.getMonth() !== now.getMonth() ||
                    eventDate.getDate() !== now.getDate()) return false;
                
                const eventTime = this.parseTime(event.time);
                const eventMinutes = eventTime.hours * 60 + eventTime.minutes;
                
                // Show events that start within the next 4 hours or are currently happening
                const timeDiff = eventMinutes - currentTime;
                return timeDiff >= -event.duration && timeDiff <= 240;
            })
            .sort((a, b) => {
                const timeA = this.parseTime(a.time);
                const timeB = this.parseTime(b.time);
                return (timeA.hours * 60 + timeA.minutes) - (timeB.hours * 60 + timeB.minutes);
            });
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return { hours, minutes };
    }

    createEventHTML(event) {
        const startTime = this.parseTime(event.time);
        const endTime = this.calculateEndTime(startTime, event.duration);
        const category = event.category || 'general';
        
        return `
            <div class="event-item event-item-${category}">
                <div class="event-bullet event-bullet-${category}"></div>
                <div class="event-content">
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">${event.time} - ${endTime.hours.toString().padStart(2, '0')}:${endTime.minutes.toString().padStart(2, '0')} (${event.duration} min)</div>
                    <div class="event-location">${event.location}</div>
                    <div class="event-speaker">${event.speaker? event.speaker : ''}</div>
                </div>
            </div>
        `;
    }

    calculateEndTime(startTime, duration) {
        const totalMinutes = startTime.hours * 60 + startTime.minutes + duration;
        return {
            hours: Math.floor(totalMinutes / 60),
            minutes: totalMinutes % 60
        };
    }

    setupEventUpdates() {
        setInterval(() => {
            this.updateEventsDisplay();
        }, this.eventsUpdateInterval);
    }

    setupAdRotation() {
        // Sample SVG ads - replace with actual ad SVGs
        const sampleAds = [
            `<svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="100" fill="#1a1a2e" stroke="#4fc3f7" stroke-width="2"/>
                <text x="150" y="35" text-anchor="middle" fill="#4fc3f7" font-family="Arial, sans-serif" font-size="16" font-weight="bold">CppCon 2025</text>
                <text x="150" y="55" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12">The Premier C++ Conference</text>
                <text x="150" y="75" text-anchor="middle" fill="#81c784" font-family="Arial, sans-serif" font-size="10">September 15-19, 2025</text>
            </svg>`,
            `<svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="100" fill="#16213e" stroke="#81c784" stroke-width="2"/>
                <text x="150" y="35" text-anchor="middle" fill="#81c784" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Workshop Registration</text>
                <text x="150" y="55" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12">Limited spots available</text>
                <text x="150" y="75" text-anchor="middle" fill="#4fc3f7" font-family="Arial, sans-serif" font-size="10">Register at cppcon.org</text>
            </svg>`,
            `<svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="100" fill="#0f3460" stroke="#ff9800" stroke-width="2"/>
                <text x="150" y="35" text-anchor="middle" fill="#ff9800" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Networking Event</text>
                <text x="150" y="55" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12">Tonight at 7:00 PM</text>
                <text x="150" y="75" text-anchor="middle" fill="#4fc3f7" font-family="Arial, sans-serif" font-size="10">Main Conference Hall</text>
            </svg>`
        ];

        const adBanner = document.getElementById('ad-banner');
        if (!adBanner) return;

        const rotateAd = () => {
            adBanner.classList.add('fade-transition');
            
            setTimeout(() => {
                adBanner.innerHTML = sampleAds[this.currentAdIndex];
                this.currentAdIndex = (this.currentAdIndex + 1) % sampleAds.length;
                adBanner.classList.remove('fade-transition');
            }, 250);
        };

        // Show first ad immediately
        rotateAd();

        // Rotate ads every interval
        setInterval(rotateAd, this.adRotationInterval);
    }
}

// Initialize the digital signage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DigitalSignage();
});

// Handle fullscreen mode for digital signage
document.addEventListener('keydown', (event) => {
    if (event.key === 'F11') {
        event.preventDefault();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

// Auto-refresh page every hour to ensure fresh data
setInterval(() => {
    location.reload();
}, 60000); // 1 minute
