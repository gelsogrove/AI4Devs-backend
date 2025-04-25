#!/bin/bash

# Set the base URL
BASE_URL="http://localhost:3010"

echo "ATS API Endpoint Testing Script"
echo "=============================="
echo

# Test GET /positions/:id/candidates
test_get_candidates() {
  echo "Testing GET /positions/:id/candidates"
  echo "------------------------------------"
  
  # Test with different query parameters
  echo "1. Basic request (default sorting)"
  curl -s "$BASE_URL/positions/1/candidates" | json_pp
  echo
  
  echo "2. Sort by score in descending order"
  curl -s "$BASE_URL/positions/1/candidates?sort=score&order=desc" | json_pp
  echo
  
  echo "3. Filter by stage"
  curl -s "$BASE_URL/positions/1/candidates?stage=First%20interview" | json_pp
  echo
  
  echo "4. Filter by minimum score"
  curl -s "$BASE_URL/positions/1/candidates?minScore=8" | json_pp
  echo
  
  echo "5. Pagination (page 1, limit 10)"
  curl -s "$BASE_URL/positions/1/candidates?page=1&limit=10" | json_pp
  echo
  
  echo "6. Combined query (sort, filter, pagination)"
  curl -s "$BASE_URL/positions/1/candidates?sort=score&order=desc&stage=Second%20interview&minScore=7&page=1&limit=5" | json_pp
  echo
}

# Test PUT /candidates/:id/stage
test_update_stage() {
  echo "Testing PUT /candidates/:id/stage"
  echo "--------------------------------"
  
  echo "1. Update stage successfully"
  curl -s -X PUT "$BASE_URL/candidates/1/stage" \
    -H "Content-Type: application/json" \
    -d '{
      "stage": "Second interview",
      "notes": "Candidate performed well in technical assessment"
    }' | json_pp
  echo
  
  echo "2. Missing stage (should return error)"
  curl -s -X PUT "$BASE_URL/candidates/1/stage" \
    -H "Content-Type: application/json" \
    -d '{
      "notes": "Candidate performed well in technical assessment"
    }' | json_pp
  echo
  
  echo "3. Invalid stage (should return error)"
  curl -s -X PUT "$BASE_URL/candidates/1/stage" \
    -H "Content-Type: application/json" \
    -d '{
      "stage": "NonExistentStage",
      "notes": "Candidate performed well in technical assessment"
    }' | json_pp
  echo
  
  echo "4. Invalid candidate ID (should return error)"
  curl -s -X PUT "$BASE_URL/candidates/invalidid/stage" \
    -H "Content-Type: application/json" \
    -d '{
      "stage": "Second interview",
      "notes": "Candidate performed well in technical assessment"
    }' | json_pp
  echo
}

# Main menu
while true; do
  echo
  echo "Select an option:"
  echo "1. Test GET /positions/:id/candidates"
  echo "2. Test PUT /candidates/:id/stage"
  echo "3. Test all endpoints"
  echo "0. Exit"
  echo
  read -p "Enter your choice: " choice
  
  case $choice in
    1) test_get_candidates ;;
    2) test_update_stage ;;
    3) 
      test_get_candidates
      echo
      test_update_stage
      ;;
    0) exit 0 ;;
    *) echo "Invalid option. Please try again." ;;
  esac
done 