// Location picker for the CppCon digital signage

class LocationPicker {
    constructor() {
        this.locations = [];
        this.backgroundParam = this.getBackgroundParamFromURL();
        this.background = this.getBackgroundFromURL();
        this.init();
    }

    async init() {
        this.applyBackground();
        await this.loadLocations();
        this.updateLocationsDisplay();
    }

    getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    getBackgroundParamFromURL() {
        return this.getUrlParams().get('background');
    }

    getBackgroundFromURL() {
        const raw = this.getBackgroundParamFromURL();
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
            const params = new URLSearchParams({ location: location.slug });
            if (this.backgroundParam) {
                params.set('background', this.backgroundParam);
            }
            window.location.href = `index.html?${params.toString()}`;
        };
        return item;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LocationPicker();
});
