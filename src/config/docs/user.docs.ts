export const userControllerDocs = {
  register: {
    summary: 'Register new user',
    description: `
**Create a new user account**

### Request Body
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fullname | string | Yes | Full name (1-100 chars) |
| email | string | Yes | Valid email (must be unique) |
| phoneNumber | string | Yes | With country code (e.g., +1234567890) |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |
| profileBio | string | No | Short bio about user |
| profileSkills | string[] | No | Array of skills |
| profileResume | string | No | URL to resume PDF |
| profilePhoto | string | No | URL to profile photo |
| role | string | No | 'student' or 'recruiter' (default: student) |

### Response
- 201: User created successfully, verification email sent
- 400: Validation error or email already exists
    `,
  },

  login: {
    summary: 'User login',
    description: `
**Authenticate user and get tokens**

### Request Body
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Registered email address |
| password | string | Yes | User password |
| role | string | Yes | 'student' or 'recruiter' |

### Response
- 200: Login successful, tokens set as httpOnly cookies
- 401: Invalid credentials or email not verified
- 429: Too many requests (rate limited)

### After Login
- Access token: expires in 1 hour
- Refresh token: expires in 7 days
- Both stored in httpOnly cookies
    `,
  },

  logout: {
    summary: 'User logout',
    description: `
**Clear authentication cookies**

### Response
- 200: Logged out successfully

### Note
- No authentication required
- Clears both accessToken and refreshToken cookies
    `,
  },

  verifyEmail: {
    summary: 'Verify email address',
    description: `
**Verify user's email using token**

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Verification token from email |

### Response
- 200: Email verified successfully
- 400: Invalid or expired token

### Note
- Token received in verification email
- Only required once for new accounts
    `,
  },

  resendVerification: {
    summary: 'Resend verification email',
    description: `
**Resend email verification link**

### Request Body
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User's email address |

### Response
- 200: Verification email sent
- 400: User not found or already verified
    `,
  },

  refreshToken: {
    summary: 'Refresh access token',
    description: `
**Get new access token using refresh token**

### How it works
- Extracts refreshToken from cookies
- Validates the token
- Returns new access token

### Response
- 200: Token refreshed successfully
- 401: Invalid or expired refresh token

### Note
- Only access token is refreshed
- Refresh token remains the same
    `,
  },

  updateProfile: {
    summary: 'Update user profile',
    description: `
**Update user profile information**

### Authentication
Authorization: Bearer <access_token> (required)

### Request Body (all fields optional)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fullname | string | No | Updated full name |
| email | string | No | Updated email (must be unique) |
| phoneNumber | string | No | Updated phone (must be unique) |
| password | string | No | New password |
| profileBio | string | No | Updated bio |
| profileSkills | string[] | No | Updated skills array |
| profileResume | string | No | Updated resume URL |
| profilePhoto | string | No | Updated photo URL |
| role | string | No | Updated role |

### Response
- 200: Profile updated successfully
- 400: Validation error or duplicate email/phone
- 401: Unauthorized (invalid or missing token)

### Note
- Only include fields you want to update
- Other fields remain unchanged
    `,
  },
};
