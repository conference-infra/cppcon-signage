#!/usr/bin/env python3
"""
CppCon 2025 Schedule Scraper

This script uses Selenium to scrape the CppCon 2025 schedule from the official website
and converts it to a JSON format matching the project's schema.
"""

import json
import re
import time
from datetime import datetime
from typing import Dict, List, Optional

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager


class CppConScheduleScraper:
    def __init__(self, headless: bool = True):
        """Initialize the scraper with Chrome options."""
        self.chrome_options = Options()
        if headless:
            self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--window-size=1920,1080")
        self.chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        self.driver = None
        self.events = []
        self.event_id = 1

    def start_driver(self):
        """Start the Chrome WebDriver with automatic driver management."""
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=self.chrome_options)
            self.driver.implicitly_wait(10)
        except Exception as e:
            print(f"Error starting Chrome driver: {e}")
            print("Trying fallback method...")
            try:
                self.driver = webdriver.Chrome(options=self.chrome_options)
                self.driver.implicitly_wait(10)
            except Exception as e2:
                print(f"Fallback also failed: {e2}")
                raise

    def stop_driver(self):
        """Stop the Chrome WebDriver."""
        if self.driver:
            self.driver.quit()

    def extract_speaker(self, presenter_text: str) -> str:
        """Extract speaker name from presenter text."""
        # Remove common prefixes and clean up
        speaker = presenter_text.strip()
        
        # Remove "avatar for" prefix if present
        if speaker.startswith("avatar for "):
            speaker = speaker[11:]
        
        # Remove any trailing descriptions or titles
        if " - " in speaker:
            speaker = speaker.split(" - ")[0]
        
        return speaker

    def determine_category(self, title: str, category_text: str) -> str:
        """Determine the event category based on title and category text."""
        title_lower = title.lower()
        category_lower = category_text.lower()
        
        # Check for specific categories
        if "embedded" in category_lower or "embedded" in title_lower:
            return "embedded"
        elif "gamedev" in category_lower or "game" in title_lower:
            return "gamedev"
        elif "scientific" in category_lower or "scientific" in title_lower:
            return "scientific"
        elif "robotics" in category_lower or "ai" in title_lower:
            return "robotics"
        elif "business" in category_lower:
            return "business"
        elif "tooling" in category_lower or "tool" in title_lower:
            return "tooling"
        elif "iso" in category_lower or "wg21" in category_lower:
            return "iso"
        elif "back to basics" in category_lower:
            return "basics"
        elif "education" in category_lower or "workshop" in category_lower:
            return "education"
        elif "social" in category_lower or "reception" in title_lower or "dinner" in title_lower:
            return "social"
        elif "keynote" in title_lower:
            return "keynote"
        elif "registration" in title_lower:
            return "registration"
        else:
            return "general"

    def extract_location(self, title: str, venue_text: str) -> str:
        """Extract location from venue text or title."""
        if "[Online]" in title:
            return "Online"
        
        # Clean up venue text
        location = venue_text.strip()
        if location and location != "TBA":
            return location
        
        # Fallback locations based on common patterns
        if "Aurora" in venue_text:
            return "Aurora A"
        elif "Gaylord" in venue_text:
            return "Gaylord Rockies"
        elif "Stage" in venue_text:
            return venue_text
        else:
            return "TBA"

    def scrape_schedule(self, url: str = "https://cppcon2025.sched.com/list/descriptions") -> Dict:
        """Scrape the CppCon 2025 schedule from the website."""
        try:
            self.start_driver()
            print(f"Navigating to {url}")
            self.driver.get(url)
            
            # Wait for the page to load
            WebDriverWait(self.driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "body"))
            )
            
            # Give extra time for dynamic content to load
            time.sleep(10)

            events = []

            # Print page title for debugging
            print(f"Page title: {self.driver.title}")


            event_containers = self.driver.find_elements(By.CSS_SELECTOR, ".sched-container")
            print(f"Found {len(event_containers)} event containers")
            for event_container in event_containers:
                name = event_container.find_element(By.CSS_SELECTOR, ".name").text.strip()
                print(f"Event name: {name}")
                dt = event_container.find_element(By.CSS_SELECTOR, ".list-single__date").text.strip().replace("\n", " ")
                print(f"Event time: {datetime}")
                location = event_container.find_element(By.CSS_SELECTOR, ".list-single__location").text.strip()
                print(f"Event location: {location}")
                category = event_container.find_element(By.CSS_SELECTOR, ".sched-event-type").text.strip()

                start_time = datetime.strptime(dt.split("-")[0], "%A %B %d, %Y %H:%M ")
                #end_time = datetime.strptime(dt.split("-")[1].replace("\n", " "), " %H:%M MDT") # Don't care about timezone for now
                
                # don't judge me
                end_time = start_time
                end_time.replace(
                    hour=int(dt.split("-")[1].split(":")[0]),
                    minute=int(dt.split("-")[1].split(":")[1].split(" ")[0])
                )

                # Create event object
                event = {
                    "id": self.event_id,
                    "title": name,
                    "date": start_time.strftime("%c"),
                    "time": start_time.strftime("%H:%M"),
                    "duration": (end_time - start_time).total_seconds() // 60,
                    "location": location,
                    "category": self.determine_category(name, category),
                    "speakers": ""
                }
                
                # Add speaker if available
                speaker_container = event_container.find_element(By.CSS_SELECTOR, ".tip-roles") if event_container.find_elements(By.CSS_SELECTOR, ".tip-roles") else None                
                if speaker_container:
                    speakers = [
                        speaker.text.strip() for speaker in speaker_container.find_elements(By.CSS_SELECTOR, "h2")
                    ]
                    if speakers:
                        event["speaker"] = ", ".join(speakers)
                
                self.events.append(event)
                self.event_id += 1
                
                print(f"  - Added: {name}")
            
            # Create the final JSON structure
            schedule_data = {
                "conference": {
                    "name": "CppCon 2025",
                    "dates": "September 10-24, 2025",
                    "location": "Aurora, Colorado"
                },
                "events": self.events
            }
            
            return schedule_data
            
        except Exception as e:
            print(f"Error during scraping: {e}")
            return None
        finally:
            self.stop_driver()

    def save_to_json(self, data: Dict, filename: str = "schedule.json"):
        """Save the scraped data to a JSON file."""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Schedule saved to {filename}")
        except Exception as e:
            print(f"Error saving to JSON: {e}")


def main():
    """Main function to run the scraper."""
    print("Starting CppCon 2025 Schedule Scraper...")
    
    # Create scraper instance
    scraper = CppConScheduleScraper(headless=False)  # Set to True for headless mode
    
    try:
        # Scrape the schedule
        schedule_data = scraper.scrape_schedule()
        
        if schedule_data:
            # Save to JSON file
            scraper.save_to_json(schedule_data, "schedule.json")
            print(f"Successfully scraped {len(schedule_data['events'])} events")
        else:
            print("Failed to scrape schedule data")
            
    except Exception as e:
        print(f"Error in main: {e}")


if __name__ == "__main__":
    main()
