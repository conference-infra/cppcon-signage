#!/usr/bin/env python3
"""
CppCon 2025 Schedule API Fetcher

This script uses the Sched API to fetch the CppCon 2025 schedule
and converts it to a JSON format matching the project's schema.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional

import requests


class CppConAPIFetcher:
    def __init__(self, api_key: str = None):
        """Initialize the API fetcher with the provided API key."""
        self.api_key = api_key or os.getenv("SCHED_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key must be provided either as parameter or SCHED_API_KEY environment variable"
            )

        self.base_url = "https://cppcon2026.sched.com/api"
        self.events = []
        self.count = 0

    def extract_location(self, title: str, venue: str = "", address: str = "") -> str:
        """Extract location from venue, address, or title."""

        return venue.strip()

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
        params = {"api_key": self.api_key, "format": "json"}

        headers = {"User-Agent": "CppCon-Signage/1.0"}

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
            if session.get("active", "").lower() != "y":
                continue

            try:
                # Parse start and end times
                start_time = self.parse_datetime(session["event_start"])
                end_time = self.parse_datetime(session["event_end"])

                # Calculate duration in minutes
                duration = int((end_time - start_time).total_seconds() / 60)

                # Extract location
                location = self.extract_location(
                    session.get("name", ""),
                    session.get("venue", ""),
                    session.get("address", ""),
                )

                # Create event object
                event = {
                    "id": session.get("id", self.count),
                    "title": session.get("name", ""),
                    "date": start_time.strftime("%c"),
                    "time": start_time.strftime("%H:%M"),
                    "duration": duration,
                    "location": location,
                    "speaker": ",".join(
                        [s.get("name", "") for s in session.get("speakers", [])]
                    ),
                    # "description": session.get('description', ''),
                    "type": session.get("event_type", ""),
                    # "session_subtype": session.get('session_subtype', ''),
                    "tags": session.get("tags", ""),
                    # "media_url": session.get('media_url', ''),
                    # "rsvp_url": session.get('rsvp_url', ''),
                    # "seats": session.get('seats', ''),
                    # "session_key": session.get('session_key', '')
                }

                events.append(event)
                self.count += 1

                print(f"  - Added: {event['title']}")

            except Exception as e:
                print(
                    f"Error processing session {session.get('session_key', 'unknown')}: {e}"
                )
                continue

        # Create the final JSON structure
        schedule_data = {
            "conference": {
                "name": "CppCon 2026",
                "dates": "September 12-18, 2026",
                "location": "Aurora, Colorado",
            },
            "events": events,
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

            print(
                f"Successfully processed {len(schedule_data['events'])} active events"
            )
            return schedule_data

        except Exception as e:
            print(f"Error during API fetch: {e}")
            return None

    def save_to_json(self, data: Dict, filename: str = "schedule.json"):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Schedule saved to {filename}")


def main():
    print("Starting CppCon 2025 Schedule API Fetcher...")
    # Create API fetcher instance
    with open("api_key.txt", "r") as keyfile:
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
