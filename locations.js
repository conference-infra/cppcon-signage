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

        // Group by slug so spacing variants of one room cannot split into two rows.
        const counts = new Map();
        for (const event of events) {
            if (!event.location) continue;
            const slug = locationSlug(event.location);
            if (!slug) continue;

            const entry = counts.get(slug);
            if (entry) {
                entry.count += 1;
            } else {
                counts.set(slug, { slug, name: locationDisplayName(event.location), count: 1 });
            }
        }

        // Numeric collation keeps "Summit 9" ahead of "Summit 10".
        this.locations = [...counts.values()]
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
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
        // A button rather than a div so the kiosk is usable without a touchscreen.
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'event-item location-item';
        item.innerHTML = `
            <div class="event-bullet"></div>
            <div class="event-content">
                <div class="location-name">${location.name}</div>
                <div class="location-count">${location.count} ${location.count === 1 ? 'event' : 'events'}</div>
            </div>
        `;
        item.onclick = () => {
            // The slug is already URL-safe, so it needs no encoding.
            window.location.href = `index.html?location=${location.slug}`;
        };
        return item;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LocationPicker();
});
