# CppCon Digital Signage

A modern, responsive digital signage system designed for CppCon 2025 conference displays. This static website is optimized for 16:9 vertical displays and provides real-time conference information.

## Features

### 🎯 Three-Row Layout
- **Top Row**: Conference logo and current day of the week
- **Middle Row**: Dynamic upcoming events display with bullet points
- **Bottom Row**: Rotating advertisement space for conference promotions

### 🎨 Design Features
- **16:9 Vertical Layout**: Optimized for portrait digital signage displays
- **Teko Font Integration**: Uses the official CppCon branding font
- **Modern UI**: Glassmorphism design with gradient backgrounds
- **Responsive Design**: Adapts to different screen sizes
- **Fullscreen Support**: Press F11 to toggle fullscreen mode

### ⚡ Dynamic Functionality
- **Real-time Day Display**: Shows current day of the week
- **Smart Event Filtering**: Only displays upcoming events for the current day
- **Automatic Updates**: Events refresh every 30 seconds
- **Ad Rotation**: SVG advertisements rotate every 10 seconds
- **Auto-refresh**: Page refreshes every hour for fresh data

## File Structure

```
cppcon-signage/
├── index.html              # Main HTML structure
├── styles.css              # CSS styling with Teko font integration
├── script.js               # JavaScript functionality
├── schedule.json           # Conference schedule data
├── web-header-2025.png     # CppCon logo
├── Teko-FontZillion/       # Conference branding font
│   └── Fonts/
│       ├── teko-regular.ttf
│       ├── teko-medium.ttf
│       ├── teko-semibold.ttf
│       ├── teko-bold.ttf
│       └── teko-light.ttf
└── README.md               # This file
```

## Usage

### Basic Setup
1. Ensure all files are in the same directory
2. Open `index.html` in a web browser
3. Press F11 for fullscreen mode (recommended for digital signage)

### Schedule Data
The system loads event data from `schedule.json`. The JSON structure includes:

```json
{
  "conference": {
    "name": "CppCon 2025",
    "dates": "September 15-19, 2025",
    "location": "Aurora, Colorado"
  },
  "events": [
    {
      "id": 1,
      "title": "Event Title",
      "time": "09:00",
      "duration": 60,
      "location": "Room Name",
      "day": "Monday",
      "type": "session",
      "speaker": "Speaker Name"
    }
  ]
}
```

### Event Types
- `keynote`: Keynote presentations
- `session`: Regular conference sessions
- `workshop`: Hands-on workshops
- `break`: Coffee breaks and lunch
- `social`: Networking events
- `registration`: Registration periods

### Ad Customization
To add your own advertisements:

1. Create SVG files for your ads
2. Replace the sample ads in `script.js` (lines 150-170)
3. Update the `adRotationInterval` if needed (default: 10 seconds)

## Technical Details

### Browser Compatibility
- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- Web Fonts support for Teko font

### Performance
- Lightweight static site (no server required)
- Efficient event filtering and sorting
- Smooth animations and transitions
- Minimal memory footprint

### Customization Options

#### Colors
The color scheme can be modified in `styles.css`:
- Primary blue: `#4fc3f7`
- Success green: `#81c784`
- Background gradients: `#1a1a2e`, `#16213e`, `#0f3460`

#### Timing
Adjust intervals in `script.js`:
- Ad rotation: `adRotationInterval` (default: 10 seconds)
- Event updates: `eventsUpdateInterval` (default: 30 seconds)
- Page refresh: `setInterval` (default: 1 hour)

#### Layout
Modify the three-row proportions in `styles.css`:
- Top row: `height: 20vh`
- Middle row: `height: 60vh`
- Bottom row: `height: 20vh`

## Deployment

### Local Development
Simply open `index.html` in a web browser. No server required.

### Production Deployment
1. Upload all files to your web server
2. Ensure proper MIME types for fonts and images
3. Configure caching headers for optimal performance
4. Set up automatic schedule updates if needed

### Digital Signage Setup
1. Use a dedicated computer or Raspberry Pi
2. Configure browser to auto-start in fullscreen
3. Set up automatic page refresh if needed
4. Consider using a kiosk mode browser extension

## Troubleshooting

### Font Not Loading
- Ensure the Teko font files are in the correct directory
- Check browser console for font loading errors
- Verify file permissions on the font files

### Events Not Displaying
- Check that `schedule.json` is accessible
- Verify JSON syntax is valid
- Ensure events have the correct day names (Monday, Tuesday, etc.)

### Display Issues
- Test in fullscreen mode (F11)
- Check browser zoom level (should be 100%)
- Verify display resolution supports 16:9 vertical

## License

This project is created for CppCon 2025. The Teko font is licensed separately and should be used according to its EULA.

## Support

For technical support or customization requests, please contact the development team or refer to the CppCon organizers.
