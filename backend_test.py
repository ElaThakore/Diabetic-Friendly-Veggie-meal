#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Memory Keeper
Tests all endpoints including edge cases and error scenarios
"""

import requests
import json
import base64
import os
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = "https://e88cb52a-d876-4ae2-9666-095c383db523.preview.emergentagent.com/api"

class MemoryKeeperAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.created_entries = []  # Track created entries for cleanup
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
    def test_health_check(self):
        """Test basic health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
        return False
        
    def test_get_all_prompts(self):
        """Test GET /api/memory/prompts"""
        try:
            response = requests.get(f"{self.base_url}/memory/prompts", timeout=10)
            if response.status_code == 200:
                prompts = response.json()
                if isinstance(prompts, list) and len(prompts) > 0:
                    # Verify prompt structure
                    first_prompt = prompts[0]
                    required_fields = ["id", "category", "prompt"]
                    if all(field in first_prompt for field in required_fields):
                        self.log_test("Get All Prompts", True, f"Retrieved {len(prompts)} prompts")
                        return True
                    else:
                        self.log_test("Get All Prompts", False, "Missing required fields in prompt")
                else:
                    self.log_test("Get All Prompts", False, "No prompts returned or invalid format")
            else:
                self.log_test("Get All Prompts", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get All Prompts", False, f"Error: {str(e)}")
        return False
        
    def test_get_random_prompt(self):
        """Test GET /api/memory/prompts/random"""
        try:
            response = requests.get(f"{self.base_url}/memory/prompts/random", timeout=10)
            if response.status_code == 200:
                prompt = response.json()
                required_fields = ["id", "category", "prompt"]
                if all(field in prompt for field in required_fields):
                    self.log_test("Get Random Prompt", True, f"Got prompt: {prompt['category']}")
                    return True
                else:
                    self.log_test("Get Random Prompt", False, "Missing required fields")
            else:
                self.log_test("Get Random Prompt", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get Random Prompt", False, f"Error: {str(e)}")
        return False
        
    def test_create_memory_text_only(self):
        """Test creating memory entry with text only"""
        try:
            memory_data = {
                "prompt": "Tell me about your favorite childhood memory",
                "content": "I remember spending summers at my grandmother's house. She had a beautiful garden with roses and we would pick berries together every morning. The smell of her fresh baked cookies would fill the entire house.",
                "category": "Childhood",
                "word_count": 35,
                "audio_recording": False
            }
            
            response = requests.post(
                f"{self.base_url}/memory/entries",
                json=memory_data,
                timeout=10
            )
            
            if response.status_code == 200:
                created_entry = response.json()
                if "id" in created_entry and created_entry["content"] == memory_data["content"]:
                    self.created_entries.append(created_entry["id"])
                    self.log_test("Create Memory (Text Only)", True, f"Created entry ID: {created_entry['id']}")
                    return created_entry
                else:
                    self.log_test("Create Memory (Text Only)", False, "Invalid response structure")
            else:
                self.log_test("Create Memory (Text Only)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Memory (Text Only)", False, f"Error: {str(e)}")
        return None
        
    def test_create_memory_with_audio(self):
        """Test creating memory entry with audio data"""
        try:
            # Create sample base64 audio data (simulated)
            sample_audio = base64.b64encode(b"fake_audio_data_for_testing").decode('utf-8')
            
            memory_data = {
                "prompt": "What was your wedding day like?",
                "content": "It was the most beautiful day of my life. The sun was shining, and all our family and friends were there. My dress was my mother's, and the flowers were white roses.",
                "category": "Family",
                "word_count": 32,
                "audio_recording": True,
                "audio_data": sample_audio
            }
            
            response = requests.post(
                f"{self.base_url}/memory/entries",
                json=memory_data,
                timeout=10
            )
            
            if response.status_code == 200:
                created_entry = response.json()
                if ("id" in created_entry and 
                    created_entry["audio_recording"] == True and 
                    created_entry["audio_data"] == sample_audio):
                    self.created_entries.append(created_entry["id"])
                    self.log_test("Create Memory (With Audio)", True, f"Created entry with audio ID: {created_entry['id']}")
                    return created_entry
                else:
                    self.log_test("Create Memory (With Audio)", False, "Audio data not properly stored")
            else:
                self.log_test("Create Memory (With Audio)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Create Memory (With Audio)", False, f"Error: {str(e)}")
        return None
        
    def test_get_all_entries(self):
        """Test GET /api/memory/entries"""
        try:
            response = requests.get(f"{self.base_url}/memory/entries", timeout=10)
            if response.status_code == 200:
                entries = response.json()
                if isinstance(entries, list):
                    self.log_test("Get All Entries", True, f"Retrieved {len(entries)} entries")
                    return entries
                else:
                    self.log_test("Get All Entries", False, "Invalid response format")
            else:
                self.log_test("Get All Entries", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get All Entries", False, f"Error: {str(e)}")
        return None
        
    def test_get_specific_entry(self, entry_id):
        """Test GET /api/memory/entries/{id}"""
        try:
            response = requests.get(f"{self.base_url}/memory/entries/{entry_id}", timeout=10)
            if response.status_code == 200:
                entry = response.json()
                if "id" in entry and entry["id"] == entry_id:
                    self.log_test("Get Specific Entry", True, f"Retrieved entry {entry_id}")
                    return entry
                else:
                    self.log_test("Get Specific Entry", False, "Entry ID mismatch")
            elif response.status_code == 404:
                self.log_test("Get Specific Entry", False, "Entry not found (404)")
            else:
                self.log_test("Get Specific Entry", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get Specific Entry", False, f"Error: {str(e)}")
        return None
        
    def test_update_entry(self, entry_id):
        """Test PUT /api/memory/entries/{id}"""
        try:
            updated_data = {
                "prompt": "Tell me about your favorite childhood memory (updated)",
                "content": "Updated: I remember spending summers at my grandmother's house. She had a beautiful garden with roses and we would pick berries together every morning. The smell of her fresh baked cookies would fill the entire house. Those were the best days of my childhood.",
                "category": "Childhood",
                "word_count": 45,
                "audio_recording": False
            }
            
            response = requests.put(
                f"{self.base_url}/memory/entries/{entry_id}",
                json=updated_data,
                timeout=10
            )
            
            if response.status_code == 200:
                updated_entry = response.json()
                if updated_entry["content"] == updated_data["content"]:
                    self.log_test("Update Entry", True, f"Updated entry {entry_id}")
                    return updated_entry
                else:
                    self.log_test("Update Entry", False, "Content not updated properly")
            elif response.status_code == 404:
                self.log_test("Update Entry", False, "Entry not found for update")
            else:
                self.log_test("Update Entry", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Update Entry", False, f"Error: {str(e)}")
        return None
        
    def test_get_memory_stats(self):
        """Test GET /api/memory/stats"""
        try:
            response = requests.get(f"{self.base_url}/memory/stats", timeout=10)
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_entries", "total_words", "average_words", "categories", "recent_entries"]
                if all(field in stats for field in required_fields):
                    self.log_test("Get Memory Stats", True, f"Total entries: {stats['total_entries']}, Total words: {stats['total_words']}")
                    return stats
                else:
                    self.log_test("Get Memory Stats", False, "Missing required fields in stats")
            else:
                self.log_test("Get Memory Stats", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Get Memory Stats", False, f"Error: {str(e)}")
        return None
        
    def test_delete_entry(self, entry_id):
        """Test DELETE /api/memory/entries/{id}"""
        try:
            response = requests.delete(f"{self.base_url}/memory/entries/{entry_id}", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "message" in result:
                    self.log_test("Delete Entry", True, f"Deleted entry {entry_id}")
                    return True
                else:
                    self.log_test("Delete Entry", False, "Invalid delete response")
            elif response.status_code == 404:
                self.log_test("Delete Entry", False, "Entry not found for deletion")
            else:
                self.log_test("Delete Entry", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Delete Entry", False, f"Error: {str(e)}")
        return False
        
    def test_error_scenarios(self):
        """Test various error scenarios"""
        print("\n=== Testing Error Scenarios ===")
        
        # Test invalid entry ID
        try:
            response = requests.get(f"{self.base_url}/memory/entries/invalid-id-123", timeout=10)
            if response.status_code == 404:
                self.log_test("Invalid Entry ID", True, "Correctly returned 404 for invalid ID")
            else:
                self.log_test("Invalid Entry ID", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Invalid Entry ID", False, f"Error: {str(e)}")
            
        # Test creating entry with missing required fields
        try:
            invalid_data = {"content": "Missing required fields"}
            response = requests.post(
                f"{self.base_url}/memory/entries",
                json=invalid_data,
                timeout=10
            )
            if response.status_code in [400, 422]:  # Bad request or validation error
                self.log_test("Missing Required Fields", True, "Correctly rejected invalid data")
            else:
                self.log_test("Missing Required Fields", False, f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Missing Required Fields", False, f"Error: {str(e)}")
            
    def cleanup_test_entries(self):
        """Clean up test entries"""
        print("\n=== Cleaning Up Test Entries ===")
        for entry_id in self.created_entries:
            try:
                requests.delete(f"{self.base_url}/memory/entries/{entry_id}", timeout=10)
                print(f"Cleaned up entry: {entry_id}")
            except:
                print(f"Failed to cleanup entry: {entry_id}")
                
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=== Memory Keeper Backend API Tests ===")
        print(f"Testing against: {self.base_url}")
        print()
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - aborting tests")
            return self.get_summary()
            
        # Memory prompts tests
        print("\n=== Testing Memory Prompts API ===")
        self.test_get_all_prompts()
        self.test_get_random_prompt()
        
        # Memory entries tests
        print("\n=== Testing Memory Entries API ===")
        
        # Create entries
        text_entry = self.test_create_memory_text_only()
        audio_entry = self.test_create_memory_with_audio()
        
        # Read operations
        self.test_get_all_entries()
        
        if text_entry:
            retrieved_entry = self.test_get_specific_entry(text_entry["id"])
            if retrieved_entry:
                self.test_update_entry(text_entry["id"])
                
        # Stats
        self.test_get_memory_stats()
        
        # Error scenarios
        self.test_error_scenarios()
        
        # Cleanup (delete test entries)
        if text_entry:
            self.test_delete_entry(text_entry["id"])
        if audio_entry:
            self.test_delete_entry(audio_entry["id"])
            
        return self.get_summary()
        
    def get_summary(self):
        """Get test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"\n=== TEST SUMMARY ===")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "No tests run")
        
        if failed_tests > 0:
            print(f"\n=== FAILED TESTS ===")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['message']}")
                    
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": (passed_tests/total_tests)*100 if total_tests > 0 else 0,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = MemoryKeeperAPITester()
    summary = tester.run_all_tests()