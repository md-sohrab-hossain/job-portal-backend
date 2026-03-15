export const jobControllerDocs = {
  postJob: {
    summary: 'Create a new job',
    description: `
**Post a new job listing**

### Authentication
Authorization: Bearer <access_token> (required)

### Request Body
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Job title |
| description | string | Yes | Job description |
| requirements | string[] | Yes | Array of job requirements |
| salary | number | Yes | Job salary |
| location | string | Yes | Job location |
| jobType | string | Yes | Type of job (full-time, part-time, etc.) |
| experienceLevel | string | Yes | Required experience level |
| position | number | Yes | Number of positions available |
| companyId | string | Yes | Company ID |

### Response
- 201: Job created successfully
- 401: Unauthorized
- 400: Bad request
    `,
  },

  getAllJobs: {
    summary: 'Get all jobs',
    description: `
**Retrieve all job listings with optional filters**

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| keyword | string | No | Search in title/description |
| location | string | No | Filter by location |
| jobType | string | No | Filter by job type |
| salary | string | No | Salary range (min-max) |

### Response
- 200: Jobs retrieved successfully
    `,
  },

  getJobByUserId: {
    summary: 'Get jobs by user',
    description: `
**Get all jobs created by the authenticated user**

### Authentication
Authorization: Bearer <access_token> (required)

### Response
- 200: Jobs retrieved successfully
- 401: Unauthorized
    `,
  },

  getFavorites: {
    summary: 'Get user favorites',
    description: `
**Get all favorite jobs of the authenticated user**

### Authentication
Authorization: Bearer <access_token> (required)

### Response
- 200: Favorites retrieved successfully
- 401: Unauthorized
    `,
  },

  createFavorite: {
    summary: 'Add job to favorites',
    description: `
**Add a job to user's favorites**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Job ID (path parameter) |

### Response
- 200: Job added to favorites
- 401: Unauthorized
- 400: Job already in favorites
    `,
  },

  deleteJob: {
    summary: 'Delete a job',
    description: `
**Delete a job (only by creator)**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Job ID (path parameter) |

### Response
- 200: Job deleted successfully
- 401: Unauthorized
- 403: Not authorized to delete this job
- 404: Job not found
    `,
  },

  getJobById: {
    summary: 'Get job by ID',
    description: `
**Get a specific job by ID**

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Job ID (path parameter) |

### Response
- 200: Job retrieved successfully
- 404: Job not found
    `,
  },
};
