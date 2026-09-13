// Digital Signage JavaScript for CppCon

class DigitalSignage {
    constructor() {
        this.events = [];
        this.eventsUpdateInterval = 1000; // 1 second
        this.locationParam = this.getLocationFromURL();
        this.locationFilter = locationSlug(this.locationParam);
        // Offset from the real clock, so a mocked ?now= keeps ticking after page load.
        const mockNow = this.getMockNowFromURL();
        this.clockOffset = mockNow ? mockNow.getTime() - Date.now() : 0;
        this.background = this.getBackgroundFromURL();
        this.init();
    }

    init() {
        this.applyBackground();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.loadEvents();
        this.setupEventUpdates();
        //setInterval(() => this.loadEvents(), 1000);
    }

    getLocationFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('location') || null;
    }

    getMockNowFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const raw = urlParams.get('now');
        if (!raw) return null;

        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    getBackgroundFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const raw = urlParams.get('background');
        if (!raw) return null;

        const trimmed = raw.trim();
        if (!trimmed) return null;

        const color = /^[0-9a-fA-F]{3,8}$/.test(trimmed) ? `#${trimmed}` : trimmed;
        return CSS.supports('color', color) ? color : null;
    }

    applyBackground() {
        if (this.background) {
            document.body.style.background = this.background;
        }
    }

    getNow() {
        return new Date(Date.now() + this.clockOffset);
    }

    updateClock() {
        const clock = document.getElementById('clock');
        if (!clock) return;

        const now = this.getNow();
        clock.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
            .map(part => part.toString().padStart(2, '0'))
            .join(':');
    }

    // Display name for the active location filter, taken from the schedule so the
    // sign shows "Summit 8/9" rather than the "summit-8-9" slug from the URL.
    // Falls back to the raw parameter when nothing matches, so a typo is visible.
    resolveLocationLabel() {
        const match = this.events.find(event => locationSlug(event.location) === this.locationFilter);
        return match ? locationDisplayName(match.location) : locationDisplayName(this.locationParam);
    }

    async loadEvents() {
        const response = await fetch('schedule.json');
        const data = await response.json();
        this.events = data.events || [];
        this.updateEventsDisplay();
        await fetch('schedule.json', { cache: 'reload' });
    }

    updateEventsDisplay() {
        const eventsList = document.getElementById('events-list');
        const sectionTitle = document.querySelector('.section-title');
        if (!eventsList) return;

        if (sectionTitle) {
            sectionTitle.textContent = this.buildEventsLabel('Upcoming', 'Events');
        }

        const upcomingEvents = this.getUpcomingEvents();
        
        if (upcomingEvents.length === 0) {
            const noEventsMessage = this.buildEventsLabel('No upcoming', 'events');
            eventsList.innerHTML = `
                <div class="event-item">
                    <div class="event-content">
                        <div class="event-title">${noEventsMessage}</div>
                        <div class="event-time">Check back later for updates</div>
                    </div>
                </div>
            `;
            return;
        }

        eventsList.innerHTML = upcomingEvents
            .slice(0, 2) // Show max 2 events
            .map(event => this.createEventHTML(event))
            .join('');
    }

    buildEventsLabel(prefix, eventsWord) {
        const location = this.locationFilter ? ` in ${this.resolveLocationLabel()}` : '';
        return `${prefix} ${eventsWord}${location}`;
    }

    getUpcomingEvents() {
        const now = this.getNow();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        return this.events
            .filter(event => {
                if (this.locationFilter && locationSlug(event.location) !== this.locationFilter) {
                    return false;
                }
                
                // Filter by day and time
                const eventDate = new Date(event.date);
                if (eventDate.getFullYear() !== now.getFullYear() ||
                    eventDate.getMonth() !== now.getMonth() ||
                    eventDate.getDate() !== now.getDate()) return false;
                
                const eventTime = this.parseTime(event.time);
                const eventMinutes = eventTime.hours * 60 + eventTime.minutes;
                
                // Show events that start within the next 4 hours or are currently happening.
                // currentTime is whole minutes, so an event ending at 10:00 disappears at 10:00:00.
                const timeDiff = eventMinutes - currentTime;
                return timeDiff > -event.duration && timeDiff <= 240;
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
        // The room is redundant when the page is already filtered to one location.
        const locationHTML = this.locationFilter ? '' : `<div class="event-location">${event.location}</div>`;
        // Only today's unfinished events reach here, so any that has started is ongoing.
        const now = this.getNow();
        const ongoing = startTime.hours * 60 + startTime.minutes <= now.getHours() * 60 + now.getMinutes();

        const ongoingHTML = ongoing ? '<div class="event-ongoing">Ongoing</div>' : '';

        return `
            <div class="event-item${ongoing ? ' event-item-ongoing' : ''}">
                <div class="event-content">
                    <div class="event-title">${event.title}</div>
                    <div class="event-details">
                        <div class="event-speaker">${event.speaker? event.speaker : ''}</div>
                        ${locationHTML}
                        ${ongoingHTML}
                        <div class="event-time">${event.time} - ${endTime.hours.toString().padStart(2, '0')}:${endTime.minutes.toString().padStart(2, '0')}</div>
                    </div>
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
}

// Initialize the digital signage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DigitalSignage();
});
