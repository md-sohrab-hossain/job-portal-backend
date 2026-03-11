import { DocumentBuilder } from '@nestjs/swagger';

const description = `
## Job Portal API

### Overview
API provides endpoints for user authentication, job management, and application tracking.

### Authentication Flow
1. **Register:** POST /user/register → Verify email
2. **Login:** POST /user/login → Tokens in httpOnly cookies
3. **Protected Routes:** Include \`Authorization: Bearer <access_token>\`
4. **Refresh:** POST /user/refresh → Get new access token

### User Roles
| Role | Description |
|------|-------------|
| student | Job seeker |
| recruiter | Employer |

### Rate Limiting
- Default: 100 req/min
- Login: 5 req/min per IP
- Returns 429 when exceeded

### Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request - validation error |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Rate Limited |

### Base URL
\`http://localhost:5000\`
`;

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Job Portal API')
  .setDescription(description)
  .setVersion('1.0')
  .addTag('Auth', 'Authentication: register, login, logout, refresh, verify-email')
  .addTag('User', 'Profile management: updateProfile, resend-verification')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT access token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();
