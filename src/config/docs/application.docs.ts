export const applicationControllerDocs = {
  applyJob: {
    summary: 'Apply for a job',
    description: `
**Apply for a job listing**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Job ID (path parameter) |

### Response
- 201: Application submitted successfully
- 401: Unauthorized
- 400: Invalid job ID format
- 404: Job not found
- 409: Already applied for this job
    `,
  },

  getAppliedJobs: {
    summary: 'Get applied jobs',
    description: `
**Get all jobs the authenticated user has applied to**

### Authentication
Authorization: Bearer <access_token> (required)

### Response
- 200: Applications retrieved successfully
- 401: Unauthorized
    `,
  },

  getApplicants: {
    summary: 'Get job applicants',
    description: `
**Get all applicants for a specific job (job creator or admin only)**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Job ID (path parameter) |

### Response
- 200: Applicants retrieved successfully
- 401: Unauthorized
- 403: Not authorized to view applicants
- 404: Job not found
    `,
  },

  updateStatus: {
    summary: 'Update application status',
    description: `
**Update the status of a job application (job creator or admin only)**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Application ID (path parameter) |

### Request Body
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | Yes | Application status (pending, accepted, rejected) |

### Response
- 200: Status updated successfully
- 401: Unauthorized
- 403: Not authorized to update this application
- 404: Application not found
- 400: Invalid status value
    `,
  },
};
