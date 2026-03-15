export const companyControllerDocs = {
  registerCompany: {
    summary: 'Register a new company',
    description: `
**Create a new company profile**

### Authentication
Authorization: Bearer <access_token> (required)

### Request Body
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Company name |
| description | string | Yes | Company description |
| industry | string | Yes | Industry type |
| website | string | No | Company website URL |
| location | string | Yes | Company location |
| logo | string | No | Company logo URL |
| coverPhoto | string | No | Company cover photo URL |
| size | string | No | Company size (e.g., 1-10, 11-50) |

### Response
- 201: Company created successfully
- 401: Unauthorized
- 400: Bad request
    `,
  },

  getCompany: {
    summary: 'Get company by user ID',
    description: `
**Get company profile by user ID**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID (path parameter) |

### Response
- 200: Company retrieved successfully
- 404: Company not found
    `,
  },

  getCompanies: {
    summary: 'Get all companies',
    description: `
**Get all companies for the authenticated user**

### Authentication
Authorization: Bearer <access_token> (required)

### Response
- 200: Companies retrieved successfully
- 401: Unauthorized
    `,
  },

  deleteCompany: {
    summary: 'Delete a company',
    description: `
**Delete a company by ID**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Company ID (path parameter) |

### Response
- 204: Company deleted successfully
- 401: Unauthorized
- 404: Company not found
    `,
  },

  updateCompany: {
    summary: 'Update a company',
    description: `
**Update company profile**

### Authentication
Authorization: Bearer <access_token> (required)

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Company ID (path parameter) |

### Request Body (all fields optional)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Updated company name |
| description | string | No | Updated description |
| industry | string | No | Updated industry |
| website | string | No | Updated website |
| location | string | No | Updated location |
| logo | string | No | Updated logo URL |
| coverPhoto | string | No | Updated cover photo URL |
| size | string | No | Updated company size |

### Response
- 200: Company updated successfully
- 401: Unauthorized
- 404: Company not found
    `,
  },
};
