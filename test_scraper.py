#!/usr/bin/env python3
"""
Test script for the CppCon 2025 Schedule Scraper
"""

import json
from scrape_cppcon_schedule import CppConScheduleScraper


def test_scraper():
    """Test the scraper functionality."""
    print("Testing CppCon 2025 Schedule Scraper...")
    
    # Create scraper instance
    scraper = CppConScheduleScraper(headless=True)  # Use headless mode for testing
    
    try:
        # Test with a shorter timeout and limited data
        print("Starting test scrape...")
        
        # For testing, we'll just try to connect and get basic page info
        scraper.start_driver()
        
        # Navigate to the page
        url = "https://cppcon2025.sched.com/list/descriptions"
        print(f"Navigating to {url}")
        scraper.driver.get(url)
        
        # Wait for page to load
        import time
        time.sleep(5)
        
        # Get page title
        title = scraper.driver.title
        print(f"Page title: {title}")
        
        # Check if page loaded successfully
        if "CppCon" in title or "Sched" in title:
            print("✓ Page loaded successfully")
        else:
            print("✗ Page may not have loaded correctly")
        
        # Try to find some basic elements
        body_text = scraper.driver.find_element("tag name", "body").text
        print(f"Page contains {len(body_text)} characters")
        
        if "2025" in body_text:
            print("✓ Page contains 2025 content")
        else:
            print("✗ Page may not contain expected content")
        
        # Look for day headers
        day_elements = scraper.driver.find_elements("css selector", "strong")
        day_count = 0
        for element in day_elements:
            text = element.text.strip()
            if any(day in text for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]):
                day_count += 1
                print(f"Found day: {text}")
        
        print(f"✓ Found {day_count} day headers")
        
        scraper.stop_driver()
        
        if day_count > 0:
            print("✓ Test completed successfully - scraper should work")
            return True
        else:
            print("✗ Test failed - no day headers found")
            return False
            
    except Exception as e:
        print(f"✗ Test failed with error: {e}")
        return False
    finally:
        if scraper.driver:
            scraper.stop_driver()


def test_json_schema():
    """Test the JSON schema generation."""
    print("\nTesting JSON schema generation...")
    
    # Create sample data
    sample_data = {
        "conference": {
            "name": "CppCon 2025",
            "dates": "September 10-24, 2025",
            "location": "Aurora, Colorado"
        },
        "events": [
            {
                "id": 1,
                "title": "Test Session",
                "time": "09:00",
                "duration": 60,
                "location": "Test Room",
                "day": "Monday",
                "type": "session",
                "category": "general",
                "speaker": "Test Speaker"
            }
        ]
    }
    
    # Test saving to JSON
    scraper = CppConScheduleScraper()
    try:
        scraper.save_to_json(sample_data, "test_schedule.json")
        print("✓ JSON schema test completed successfully")
        
        # Verify the file was created
        with open("test_schedule.json", "r") as f:
            loaded_data = json.load(f)
        
        if loaded_data["conference"]["name"] == "CppCon 2025":
            print("✓ JSON file created and loaded correctly")
            return True
        else:
            print("✗ JSON file content doesn't match expected")
            return False
            
    except Exception as e:
        print(f"✗ JSON schema test failed: {e}")
        return False


if __name__ == "__main__":
    print("Running CppCon 2025 Schedule Scraper Tests\n")
    
    # Run tests
    test1_result = test_scraper()
    test2_result = test_json_schema()
    
    print(f"\nTest Results:")
    print(f"Scraper Test: {'✓ PASSED' if test1_result else '✗ FAILED'}")
    print(f"JSON Schema Test: {'✓ PASSED' if test2_result else '✗ FAILED'}")
    
    if test1_result and test2_result:
        print("\n🎉 All tests passed! The scraper should work correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
