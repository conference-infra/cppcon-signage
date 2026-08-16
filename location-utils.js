// Shared location helpers for the CppCon digital signage.
// Schedule data contains inconsistent spacing, e.g. "Summit  8/9" but "Summit 10".

// URL-safe key for a location, used as the ?location= value.
// "Summit  8/9" and "Summit 8/9" both become "summit-8-9".
function locationSlug(location) {
    return (location || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Human-readable form of a location, for on-screen labels.
// "Summit  8/9" becomes "Summit 8/9".
function locationDisplayName(location) {
    return (location || '').replace(/\s+/g, ' ').trim();
}
