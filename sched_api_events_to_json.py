#!/usr/bin/env python3
"""
CppCon 2025 Schedule API Fetcher

This script uses the Sched API to fetch the CppCon 2025 schedule
and converts it to a JSON format matching the project's schema.
"""

import json
import os
import requests
from datetime import datetime
from typing import Dict, List, Optional


class CppConAPIFetcher:
    def __init__(self, api_key: str = None):
        """Initialize the API fetcher with the provided API key."""
        self.api_key = api_key or os.getenv('SCHED_API_KEY')
        if not self.api_key:
            raise ValueError("API key must be provided either as parameter or SCHED_API_KEY environment variable")
        
        self.base_url = "https://cppcon2025.sched.com/api"
        self.events = []
        self.count = 0

    def determine_category(self, title: str, session_type: str = "", tags: str = "") -> str:
        """Determine the event category based on title, type, and tags."""
        title_lower = title.lower()
        type_lower = session_type.lower()
        tags_lower = tags.lower()
        
        # Check for specific categories
        if "embedded" in type_lower or "embedded" in title_lower or "embedded" in tags_lower:
            return "embedded"
        elif "gamedev" in type_lower or "game" in title_lower or "gamedev" in tags_lower:
            return "gamedev"
        elif "scientific" in type_lower or "scientific" in title_lower or "scientific" in tags_lower:
            return "scientific"
        elif "robotics" in type_lower or "ai" in title_lower or "robotics" in tags_lower:
            return "robotics"
        elif "business" in type_lower or "business" in tags_lower:
            return "business"
        elif "tooling" in type_lower or "tool" in title_lower or "tooling" in tags_lower:
            return "tooling"
        elif "iso" in type_lower or "wg21" in type_lower or "iso" in tags_lower:
            return "iso"
        elif "back to basics" in type_lower or "basics" in tags_lower:
            return "basics"
        elif "education" in type_lower or "workshop" in type_lower or "education" in tags_lower:
            return "education"
        elif "social" in type_lower or "reception" in title_lower or "dinner" in title_lower or "social" in tags_lower:
            return "social"
        elif "keynote" in title_lower or "keynote" in type_lower:
            return "keynote"
        elif "registration" in title_lower or "registration" in type_lower:
            return "registration"
        else:
            return "general"

    def extract_location(self, title: str, venue: str = "", address: str = "") -> str:
        """Extract location from venue, address, or title."""
        if "[Online]" in title:
            return "Online"
        
        # Use venue if available
        if venue and venue.strip() and venue.strip() != "TBA":
            return venue.strip()
        
        # Use address if venue is not available
        if address and address.strip() and address.strip() != "TBA":
            return address.strip()
        
        # Fallback locations based on common patterns
        if "Aurora" in venue or "Aurora" in address:
            return "Aurora A"
        elif "Gaylord" in venue or "Gaylord" in address:
            return "Gaylord Rockies"
        elif "Stage" in venue or "Stage" in address:
            return venue or address
        else:
            return "TBA"

    def parse_datetime(self, datetime_str: str) -> datetime:
        """Parse datetime string from Sched API format (YYYY-MM-DD HH:MM)."""
        try:
            return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")
        except ValueError:
            # Try alternative format if needed
            return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")

    def fetch_sessions(self) -> List[Dict]:
        """Fetch all sessions from the Sched API."""
        url = f"{self.base_url}/session/export"
        params = {
            'api_key': self.api_key,
            'format': 'json'
        }
        
        headers = {
            'User-Agent': 'CppCon-Signage/1.0'
        }
        
        try:
            print("Fetching sessions from Sched API...")
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            sessions = response.json()
            print(f"Fetched {len(sessions)} sessions from API")
            return sessions
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching sessions: {e}")
            return []

    def process_sessions(self, sessions: List[Dict]) -> Dict:
        """Process sessions and convert to the project's schema."""
        events = []
        
        for session in sessions:
            # Only process active sessions
            if session.get('active', '').lower() != 'y':
                continue
                
            try:
                # Parse start and end times
                start_time = self.parse_datetime(session['event_start'])
                end_time = self.parse_datetime(session['event_end'])
                
                # Calculate duration in minutes
                duration = int((end_time - start_time).total_seconds() / 60)
                
                # Extract location
                location = self.extract_location(
                    session.get('name', ''),
                    session.get('venue', ''),
                    session.get('address', '')
                )
                
                # Determine category
                category = self.determine_category(
                    session.get('name', ''),
                    session.get('session_type', ''),
                    session.get('tags', '')
                )
                
                # Create event object
                event = {
                    "id": session.get('id', self.count),
                    "title": session.get('name', ''),
                    "date": start_time.strftime("%c"),
                    "time": start_time.strftime("%H:%M"),
                    "duration": duration,
                    "location": location,
                    "category": category,
                    "speaker": ",".join([s.get('name', '') for s in session.get('speakers', [])])
                    # "description": session.get('description', ''),
                    # "session_type": session.get('session_type', ''),
                    # "session_subtype": session.get('session_subtype', ''),
                    # "tags": session.get('tags', ''),
                    # "media_url": session.get('media_url', ''),
                    # "rsvp_url": session.get('rsvp_url', ''),
                    # "seats": session.get('seats', ''),
                    # "session_key": session.get('session_key', '')
                }
                
                events.append(event)
                self.count += 1
                
                print(f"  - Added: {event['title']}")
                
            except Exception as e:
                print(f"Error processing session {session.get('session_key', 'unknown')}: {e}")
                continue
        
        # Create the final JSON structure
        schedule_data = {
            "conference": {
                "name": "CppCon 2025",
                "dates": "September 10-24, 2025",
                "location": "Aurora, Colorado"
            },
            "events": events
        }
        
        return schedule_data

    def fetch_schedule(self) -> Optional[Dict]:
        """Fetch and process the complete schedule."""
        try:
            # Fetch sessions from API
            sessions = self.fetch_sessions()
            
            if not sessions:
                print("No sessions found")
                return None
            
            # Process sessions
            schedule_data = self.process_sessions(sessions)
            
            print(f"Successfully processed {len(schedule_data['events'])} active events")
            return schedule_data
            
        except Exception as e:
            print(f"Error during API fetch: {e}")
            return None

    def save_to_json(self, data: Dict, filename: str = "schedule.json"):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Schedule saved to {filename}")


def main():
    print("Starting CppCon 2025 Schedule API Fetcher...")
    # Create API fetcher instance
    with open('api_key.txt', 'r') as keyfile:
        api_key = keyfile.read().strip()
    fetcher = CppConAPIFetcher(api_key=api_key)
    
    # Fetch the schedule
    schedule_data = fetcher.fetch_schedule()
    
    if schedule_data:
        # Save to JSON file
        fetcher.save_to_json(schedule_data, "schedule.json")
        print(f"Successfully fetched {len(schedule_data['events'])} events")
    else:
        print("Failed to fetch schedule data")


if __name__ == "__main__":
    main()
