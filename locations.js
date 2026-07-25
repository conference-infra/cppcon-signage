// Location picker for the CppCon digital signage

class LocationPicker {
    constructor() {
        this.locations = [];
        this.init();
    }

    async init() {
        await this.loadLocations();
        this.updateLocationsDisplay();
    }

    async loadLocations() {
        const response = await fetch('schedule.json');
        const data = await response.json();
        const events = data.events || [];

        const counts = new Map();
        for (const event of events) {
            if (!event.location) continue;
            const entry = counts.get(event.location);
            if (entry) {
                entry.count += 1;
            } else {
                counts.set(event.location, { name: event.location, count: 1 });
            }
        }

        this.locations = [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    updateLocationsDisplay() {
        const locationsList = document.getElementById('locations-list');
        if (!locationsList) return;

        locationsList.innerHTML = '';

        if (this.locations.length === 0) {
            locationsList.innerHTML = `
                <div class="event-item">
                    <div class="event-bullet"></div>
                    <div class="event-content">
                        <div class="location-name">No locations found</div>
                    </div>
                </div>
            `;
            return;
        }

        for (const location of this.locations) {
            locationsList.appendChild(this.createLocationElement(location));
        }
    }

    createLocationElement(location) {
        const item = document.createElement('div');
        item.className = 'event-item location-item';
        item.innerHTML = `
            <div class="event-bullet"></div>
            <div class="event-content">
                <div class="location-name">${location.name}</div>
                <div class="location-count">${location.count} ${location.count === 1 ? 'event' : 'events'}</div>
            </div>
        `;
        item.onclick = () => {
            window.location.href = `index.html?location=${encodeURIComponent(location.name)}`;
        };
        return item;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LocationPicker();
});
