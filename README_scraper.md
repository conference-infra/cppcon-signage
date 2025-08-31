# CppCon 2025 Schedule Scraper

This Python script uses Selenium to scrape the CppCon 2025 schedule from the official website and convert it to a JSON format that matches the project's schema.

## Prerequisites

1. **Python 3.7+** installed on your system
2. **Chrome browser** installed
3. **ChromeDriver** - The script will attempt to use the system ChromeDriver, but you may need to install it manually

## Installation

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

2. If you don't have ChromeDriver installed, you can install it via:
   ```bash
   pip install webdriver-manager
   ```

## Usage

### Basic Usage

Run the scraper with default settings:
```bash
python scrape_cppcon_schedule.py
```

### Configuration Options

You can modify the scraper behavior by editing the script:

- **Headless mode**: Set `headless=True` in the `CppConScheduleScraper()` constructor to run without opening a browser window
- **Output file**: Change the filename in the `save_to_json()` call to save to a different file
- **URL**: Modify the URL in `scrape_schedule()` if the schedule URL changes

### Output

The script will:
1. Navigate to the CppCon 2025 schedule page
2. Extract all session information including:
   - Session titles
   - Times and durations
   - Speakers/presenters
   - Locations/venues
   - Event types and categories
3. Save the data to `schedule.json` in the current directory

## JSON Schema

The output follows this structure:
```json
{
  "conference": {
    "name": "CppCon 2025",
    "dates": "September 10-24, 2025",
    "location": "Aurora, Colorado"
  },
  "events": [
    {
      "id": 1,
      "title": "Session Title",
      "time": "09:00",
      "duration": 60,
      "location": "Room Name",
      "day": "Monday",
      "type": "session",
      "category": "general",
      "speaker": "Speaker Name"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **ChromeDriver not found**: Install ChromeDriver or use webdriver-manager
2. **Page not loading**: The website might be slow or have anti-bot measures. Try increasing wait times in the script
3. **No events found**: The website structure might have changed. Check the selectors in the script

### Debug Mode

To see what's happening during scraping, set `headless=False` in the script to open a browser window and watch the scraping process.

### Manual ChromeDriver Installation

If you need to install ChromeDriver manually:

1. Download ChromeDriver from: https://chromedriver.chromium.org/
2. Extract the executable to a directory in your PATH
3. Or specify the path in the script by modifying the `webdriver.Chrome()` call

## Notes

- The script includes error handling and will continue processing even if some sessions fail to parse
- The scraper attempts to intelligently categorize events based on titles and descriptions
- Online events are automatically detected and marked as "Online" location
- Duration is calculated in minutes from start and end times

## Legal Notice

This scraper is for educational purposes. Please respect the website's terms of service and robots.txt file. Consider implementing delays between requests if scraping frequently.
