model : claude-3.7-sonnet


==============================================================================================
                # Prompt 1: 
==============================================================================================

You are an expert system architect with experience in ATS and REST APIs, Typescript, Node.JS. Please Generate documentation that includes the folder structure, the technologies used, the architecture, and the REST API contract for @backend. Use a schema in Marmait or ASCII tables



==============================================================================================
                # Prompt 2: Enhancing ATS with Candidate Management Endpoints
==============================================================================================

 
We need to enhance our Applicant Tracking System with two new endpoints to manage candidates in the selection process. These endpoints will help HR teams track candidates across different positions and update their progress.

## Required Endpoints

### 1. GET /positions/:id/candidates
**Purpose**: Retrieve all candidates for a specific position with their details and status ordered by id desc.

**Parameters**:
- `id` (path): Position ID
- `sort` (query, optional): Sort field - Accepts `name`, `score`, or `stage` (default: `name`)
- `order` (query, optional): Sort direction - `asc` or `desc` (default: `asc`)
- `page` (query, optional): Page number for pagination (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `stage` (query, optional): Filter by interview stage
- `minScore` (query, optional): Filter by minimum average score

**Response**:
```json
{
  "data": [
    {
      "candidate_id": 123,
      "candidate_name": "Mario Rossi",
      "current_interview_step": "Second interview",
      "average_score": 8.5,
      "last_interview_date": "2023-06-15T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### 2. PUT /candidates/:id/stage
**Purpose**: Update a candidate's current stage in the selection process.

**Parameters**:
- `id` (path): Candidate ID
- Request Body:
  ```json
  {
    "stage": "Second interview",
    "notes": "Candidate performed well in technical assessment"
  }
  ```

**Response**:
```json
{
  "success": true,
  "message": "Stage updated successfully",
  "candidate_id": 123,
  "previous_stage": "First interview",
  "new_stage": "Second interview",
  "updated_by": "user@example.com",
  "updated_at": "2023-07-01T10:15:00Z"
}
```

## Requirements

### Data Sources
- `candidate` table: Retrieve candidate personal information
- `application` table: Get/update the current interview stage
- `interview` table: Calculate average scores from all interviews
- `interviewStep` table: Validate stage values

### Functional Requirements
- **Pagination support** for the GET endpoint with configurable page size
- Sorting by multiple fields (name, score, stage)
- Filtering by stage and minimum score
- Average score calculation from interview records
- Stage validation against allowed values
- Response formatting as specified in examples

### Non-Functional Requirements
- Efficient performance for positions with many candidates
- Proper error handling with meaningful messages
- Data validation for all inputs
- Transaction management for database updates
- Logging for audit trail of stage changes

## Implementation Plan

1. **Setup Routes**
   - Create route for GET `/positions/:id/candidates` with query parameter support
   - Create route for PUT `/candidates/:id/stage`

2. **Create Domain Layer**
   - Ensure domain models reflect the database schema
   - Define interfaces for data access

3. **Implement Application Services**
   - `PositionService.getCandidatesByPositionId()` with sorting, filtering, and pagination
   - `CandidateService.updateCandidateStage()` with validation and transaction support
   - Helper for calculating average interview scores

4. **Develop Controllers**
   - `PositionController.getCandidates()` for handling the GET endpoint
   - `CandidateController.updateStage()` for handling the PUT endpoint
   - Parameter validation and error handling

5. **Add Data Access Logic**
   - Implement optimized queries for retrieving candidate data
   - Create transaction-safe update methods

6. **Implement Cross-Cutting Concerns**
   - Validation middleware for request parameters
   - **Pagination utilities for handling page/limit parameters**
   - Sorting and filtering helpers
   - Logging for stage changes

7. **Testing & Documentation**
   - Unit tests for services and controllers
   - Integration tests for API endpoints
   - Update Swagger/OpenAPI specification
 

Please **don't run anything** until you confirm you understand the requirements. Let me know if you see any improvements that could be made to this plan.




==============================================================================================
                #  Prompt 3: Run Implementation Plan
==============================================================================================
Now that we've defined the requirements and planned the implementation, please begin the implementation process following the steps outlined above, STEP-BY-STEP, wait my confirm before proceed with the next one.


 
==============================================================================================
                #  Prompt 4: final check
==============================================================================================

- run the build for backend
- run the build for frontend
- run the tet
- Generate curl for testing the new features
- update Readme.md if need it
