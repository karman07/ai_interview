# Subjects API Documentation

Base URL: `http://localhost:3000`

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your_access_token>
```

## Endpoints

### 1. Get All Subjects
```http
GET /subjects
```

**Response:**
```json
[
  {
    "_id": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "estimatedTime": "string",
    "thumbnailUrl": "string",
    "rating": 0,
    "status": "string",
    "author": "string",
    "content": [
      {
        "heading": "string",
        "points": ["string"]
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### 2. Get Subject by ID
```http
GET /subjects/:id
```

**Response:** Same as single subject object above

### 3. Create Subject
```http
POST /subjects
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript",
  "category": "Programming",
  "level": "Beginner",
  "estimatedTime": "4 weeks",
  "author": "John Doe",
  "content": [
    {
      "heading": "Introduction",
      "points": ["Variables", "Functions", "Objects"]
    }
  ]
}
```

**Optional:** Include `thumbnail` file in form data

**Response:** Created subject object

### 4. Update Subject
```http
PATCH /subjects/:id
Content-Type: multipart/form-data
```

**Request Body:** Same as create (all fields optional)

**Response:** Updated subject object

### 5. Delete Subject
```http
DELETE /subjects/:id
```

**Response:** 204 No Content

## Data Entry Example

```javascript
// Login first
await apiService.login('admin@example.com', 'password');

// Create subject
const subjectData = {
  title: "React Basics",
  description: "Learn React from scratch",
  category: "Web Development",
  level: "Intermediate",
  estimatedTime: "6 weeks",
  author: "Jane Smith",
  content: [
    {
      heading: "Getting Started",
      points: ["Setup", "Components", "Props"]
    },
    {
      heading: "State Management",
      points: ["useState", "useEffect", "Context"]
    }
  ]
};

const newSubject = await apiService.createSubject(subjectData);
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Subject title |
| description | string | No | Brief description |
| category | string | No | Subject category |
| level | string | No | Difficulty level |
| estimatedTime | string | No | Time to complete |
| author | string | No | Author name |
| content | array | No | Content blocks with headings and points |
| thumbnail | file | No | Image file for thumbnail |
