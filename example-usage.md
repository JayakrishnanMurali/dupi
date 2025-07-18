# Dupi - Mock API Generator Example Usage

## Quick Start

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Navigate to**: http://localhost:3001

3. **Create a new project**:
   - Click "Create Project →"
   - Enter a project name
   - Paste your TypeScript interface or use the example
   - Click "Create Project"

## Example TypeScript Interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  profile: {
    bio: string;
    location: string;
    website?: string;
  };
  tags: string[];
}
```

## API Usage

Once you create a project, you'll get a URL like:
`http://localhost:3001/api/mock/{projectId}`

### Get single record:
```bash
curl http://localhost:3001/api/mock/{projectId}
```

### Get multiple records:
```bash
curl "http://localhost:3001/api/mock/{projectId}?count=5"
```

### Example Response:
```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "isActive": true,
    "createdAt": "2023-12-01T10:30:00.000Z",
    "profile": {
      "bio": "Software engineer with a passion for technology",
      "location": "San Francisco, CA",
      "website": "https://johndoe.dev"
    },
    "tags": ["developer", "javascript", "react"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Client Configuration for Production

```typescript
import { createDupiClient, generateConfig } from '@/lib/dupi/config';

const config = generateConfig({
  users: {
    mockUrl: 'http://localhost:3001/api/mock/abc123',
    realUrl: 'https://api.yourapp.com/users'
  },
  posts: {
    mockUrl: 'http://localhost:3001/api/mock/def456',
    realUrl: 'https://api.yourapp.com/posts'
  }
});

const client = createDupiClient(config);

// Use mock APIs during development
const users = await client.request('users');

// Switch to production when ready
client.switchToProduction();
const realUsers = await client.request('users');
```

## Features

- ✅ Parse TypeScript interfaces automatically
- ✅ Generate realistic mock data with Faker.js
- ✅ Support for nested objects and arrays
- ✅ Configurable HTTP methods
- ✅ Project expiration management
- ✅ Seamless transition to production APIs
- ✅ Type-safe client configuration
- ✅ Smart data type inference (emails, URLs, names, etc.)

## Future Enhancements

- Rate limiting
- User authentication
- Analytics and usage tracking
- Custom data generation rules
- OpenAPI/Swagger integration
- Webhook simulation