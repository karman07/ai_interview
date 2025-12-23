# Subjects API - User Guide

## Overview
The Subjects API allows users to browse and view educational subjects available on the platform. Users can explore subjects by category, difficulty level, and view detailed content.

## Available Endpoints

### 1. Get All Subjects
**Endpoint:** `GET /subjects`  
**Authentication:** Not required  
**Description:** Retrieve a list of all available subjects

**Response Example:**
```json
[
  {
    "_id": "64a1b2c3d4e5f6789012345",
    "title": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript programming",
    "category": "Programming",
    "level": "Beginner",
    "estimatedTime": "4 hours",
    "thumbnailUrl": "/uploads/subjects/js-thumbnail.png",
    "rating": 4.5,
    "status": "published",
    "author": "John Doe",
    "content": [
      {
        "heading": "Variables and Data Types",
        "points": [
          "Understanding var, let, and const",
          "Primitive data types",
          "Type conversion"
        ]
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Get Subject by ID
**Endpoint:** `GET /subjects/:id`  
**Authentication:** Not required  
**Description:** Retrieve detailed information about a specific subject

**Parameters:**
- `id` (string): The unique identifier of the subject

**Response Example:**
```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript programming",
  "category": "Programming",
  "level": "Beginner",
  "estimatedTime": "4 hours",
  "thumbnailUrl": "/uploads/subjects/js-thumbnail.png",
  "rating": 4.5,
  "status": "published",
  "author": "John Doe",
  "content": [
    {
      "heading": "Variables and Data Types",
      "points": [
        "Understanding var, let, and const",
        "Primitive data types",
        "Type conversion"
      ]
    },
    {
      "heading": "Functions",
      "points": [
        "Function declarations vs expressions",
        "Arrow functions",
        "Scope and closures"
      ]
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Subject Properties

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique identifier |
| `title` | string | Subject title |
| `description` | string | Brief description |
| `category` | string | Subject category (e.g., Programming, Design) |
| `level` | string | Difficulty level (Beginner, Intermediate, Advanced) |
| `estimatedTime` | string | Expected completion time |
| `thumbnailUrl` | string | URL to subject thumbnail image |
| `rating` | number | Average rating (0-5) |
| `status` | string | Publication status (draft, published) |
| `author` | string | Content author name |
| `content` | array | Structured learning content |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last update timestamp |

## Content Structure

Each subject contains structured content blocks:

```json
{
  "heading": "Topic Title",
  "points": [
    "Key learning point 1",
    "Key learning point 2",
    "Key learning point 3"
  ]
}
```

## Usage Examples

### Browse All Subjects
```bash
curl -X GET "http://localhost:3000/subjects"
```

### Get Specific Subject
```bash
curl -X GET "http://localhost:3000/subjects/64a1b2c3d4e5f6789012345"
```

## Filtering and Search

Currently, the API returns all published subjects. You can filter client-side by:
- **Category**: Filter subjects by category
- **Level**: Filter by difficulty level
- **Rating**: Sort by rating
- **Status**: Only published subjects are returned

## Error Responses

### Subject Not Found
```json
{
  "statusCode": 404,
  "message": "Subject not found",
  "error": "Not Found"
}
```

### Invalid Subject ID
```json
{
  "statusCode": 400,
  "message": "Invalid subject ID format",
  "error": "Bad Request"
}
```

## Notes

- All subjects returned have `status: "published"`
- Thumbnail images are served from `/uploads/subjects/` directory
- Content is structured for progressive learning
- No authentication required for viewing subjects
- Timestamps are in ISO 8601 format