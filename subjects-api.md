# Subjects API Documentation

## Schema

```typescript
ContentBlock {
  heading: string
  points: string[]
}

Subject {
  _id: string
  title: string
  description?: string
  category?: string
  level: string // default: 'Beginner'
  estimatedTime?: string
  thumbnailUrl?: string
  rating: number // default: 0
  status: string // default: 'draft'
  author?: string
  content: ContentBlock[]
  createdAt: Date
  updatedAt: Date
}
```

## Routes (User Access)

### GET /subjects
Get all subjects
- **Response**: `Subject[]`
- **Description**: Returns all subjects regardless of status

### GET /subjects/:id
Get subject by ID
- **Parameters**: `id` (string) - MongoDB ObjectId
- **Response**: `Subject`
- **Description**: Returns a single subject by its ID