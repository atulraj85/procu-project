# RFP API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Get Question Templates
Retrieves the available question templates for RFP forms.

**Endpoint:** `GET /question-templates`

**Response:**
```json
[
    {
        "id": "76b7abd2-b84e-4755-8403-29b2341714bc",
        "categoryId": null,
        "categoryName": null,
        "questions": [
            {
                "id": "request_reason",
                "type": "select",
                "options": [
                    "New Employee Setup",
                    "Equipment Replacement",
                    "Upgrade Required",
                    "Additional Equipment",
                    "Project Requirement",
                    "Damage/Malfunction",
                    "End of Life Equipment",
                    "Other"
                ],
                "question": "Please select the reason for your hardware request",
                "required": true
            },
            {
                "id": "replacement_reason",
                "type": "textarea",
                "question": "Why do you need the replacement?",
                "required": true,
                "placeholder": "Explain why replacement is necessary (e.g., equipment failure, performance issues, end of warranty)"
            }
        ],
        "version": 1,
        "isActive": true,
        "createdBy": "Anurag Rathore",
        "createdByEmail": "ranurag404@gmail.com",
        "createdAt": "2025-09-20T08:18:54.757Z",
        "updatedAt": "2025-09-20T08:18:54.757Z"
    }
]
```

**Response Fields:**
- `id` (string): Unique identifier for the question template
- `categoryId` (string|null): Category identifier
- `categoryName` (string|null): Category name
- `questions` (array): Array of question objects
  - `id` (string): Question identifier
  - `type` (string): Question type (select, textarea, number, date, radio)
  - `options` (array): Available options for select/radio types
  - `question` (string): Question text
  - `required` (boolean): Whether the question is mandatory
  - `placeholder` (string): Placeholder text for input fields
  - `min/max` (number): Minimum/maximum values for number inputs
- `version` (number): Template version
- `isActive` (boolean): Whether template is active
- `createdBy` (string): Creator name
- `createdByEmail` (string): Creator email
- `createdAt` (string): Creation timestamp
- `updatedAt` (string): Last update timestamp

---

### 2. Create RFP
Creates a new Request for Proposal.

**Endpoint:** `POST /rfp`

**Request Body:**
```json
{
    "title": "Hardware Request - Development Team Laptops",
    "description": "Request for replacement laptops for development team due to performance issues",
    "lineItems": [
        {
            "productName": "Dell Laptop",
            "description": "High-performance laptop for software development work",
            "specifications": {
                "processor": "Intel i7 12th Gen",
                "ram": "16GB",
                "storage": "512GB SSD",
                "display": "14 inch FHD"
            },
            "quantity": 3,
            "estimatedUnitPrice": 75000,
            "urgency": "High"
        }
    ],
    "deliveryLocation": "TechCorp Solutions, Plot No. 45, Electronic City Phase 1, Bangalore, Karnataka, 560100",
    "deliveryStates": ["Karnataka"],
    "deliveryDate": "2025-11-15",
    "estimatedBudget": 225000,
    "currency": "INR",
    "createdBy": "4c01af3c-890c-45e6-a91d-d31dbdb8af91",
    "organizationId": "59a631f9-7e82-453a-82b0-b849f8ab8352",
    "quotationCutoffDate": "2025-10-30",
    "questionTemplateId": "76b7abd2-b84e-4755-8403-29b2341714bc",
    "questionAnswers": {
        "request_reason": "Equipment Replacement",
        "replacement_reason": "Current laptops are 4 years old and experiencing frequent crashes",
        "request_type": "Laptop",
        "specific_request": "Dell Latitude 5420 or equivalent",
        "quantity_needed": 3,
        "required_date": "2025-11-15",
        "usage_type": "Permanent",
        "client_related": "Yes",
        "business_justification": "Critical client project with tight deadlines"
    },
    "selectionCriteria": {
        "technicalWeightage": 70,
        "commercialWeightage": 30,
        "requiredCertifications": ["ISO 9001"],
        "preferredBrands": ["Dell", "HP", "Lenovo"],
        "warrantyRequirement": "3 years minimum with onsite support"
    }
}
```

**Request Fields:**

**Required Fields:**
- `title` (string): RFP title
- `description` (string): Detailed description of the request
- `lineItems` (array): Items being requested
  - `productName` (string): Product name
  - `description` (string): Product description
  - `specifications` (object): Product specifications
  - `quantity` (number): Required quantity
  - `estimatedUnitPrice` (number): Estimated price per unit
  - `urgency` (string): Urgency level (Low, Medium, High)
- `deliveryLocation` (string): Delivery address
- `deliveryStates` (array): States for delivery
- `deliveryDate` (string): Required delivery date (YYYY-MM-DD)
- `estimatedBudget` (number): Total estimated budget
- `currency` (string): Currency code (INR, USD, etc.)
- `createdBy` (string): User ID who created the RFP
- `organizationId` (string): Organization ID
- `quotationCutoffDate` (string): Last date for quotation submission
- `questionTemplateId` (string): Template ID for questions
- `questionAnswers` (object): Answers to template questions

**Optional Fields:**
- `selectionCriteria` (object): Selection criteria for vendor evaluation
  - `technicalWeightage` (number): Technical evaluation weightage (0-100)
  - `commercialWeightage` (number): Commercial evaluation weightage (0-100)
  - `requiredCertifications` (array): Required vendor certifications
  - `preferredBrands` (array): Preferred brand names
  - `warrantyRequirement` (string): Warranty requirements

**Response:**
```json
{
    "data": {
        "id": "7fd69fe3-e7b9-4bcf-8bab-fde6a6484120",
        "rfpNumber": "RFP-2025-0001",
        "title": "Hardware Request - Development Team Laptops",
        "description": "Request for replacement laptops for development team due to performance issues",
        "lineItems": [
            {
                "urgency": "High",
                "quantity": 3,
                "description": "High-performance laptop for software development work",
                "productName": "Dell Laptop",
                "specifications": {
                    "ram": "16GB",
                    "display": "14 inch FHD",
                    "storage": "512GB SSD",
                    "processor": "Intel i7 12th Gen"
                },
                "estimatedUnitPrice": 75000
            }
        ],
        "deliveryLocation": "TechCorp Solutions, Plot No. 45, Electronic City Phase 1, Bangalore, Karnataka, 560100",
        "deliveryStates": ["Karnataka"],
        "deliveryDate": "2025-11-15T00:00:00.000Z",
        "questionTemplateId": "76b7abd2-b84e-4755-8403-29b2341714bc",
        "questionAnswers": {
            "usage_type": "Permanent",
            "request_type": "Laptop",
            "required_date": "2025-11-15",
            "client_related": "Yes",
            "request_reason": "Equipment Replacement",
            "quantity_needed": 3,
            "specific_request": "Dell Latitude 5420 or equivalent",
            "replacement_reason": "Current laptops are 4 years old and experiencing frequent crashes",
            "business_justification": "Critical client project with tight deadlines"
        },
        "estimatedBudget": "225000.00",
        "currency": "INR",
        "status": "DRAFT",
        "createdBy": "4c01af3c-890c-45e6-a91d-d31dbdb8af91",
        "organizationId": "59a631f9-7e82-453a-82b0-b849f8ab8352",
        "selectionCriteria": {
            "preferredBrands": ["Dell", "HP", "Lenovo"],
            "technicalWeightage": 70,
            "commercialWeightage": 30,
            "warrantyRequirement": "3 years minimum with onsite support",
            "requiredCertifications": ["ISO 9001"]
        },
        "quotationCutoffDate": "2025-10-30T00:00:00.000Z",
        "rejectionReason": null,
        "conversationThreads": [],
        "createdAt": "2025-09-20T09:08:06.509Z",
        "updatedAt": "2025-09-20T09:08:06.285Z"
    },
    "message": "RFP request submitted successfully and sent for approval"
}
```

**Response Fields:**
- `data` (object): Created RFP object
  - `id` (string): Unique RFP identifier
  - `rfpNumber` (string): Auto-generated RFP number
  - `status` (string): RFP status (DRAFT, PENDING_APPROVAL, ACTIVE, CLOSED)
  - `rejectionReason` (string|null): Reason for rejection if applicable
  - `conversationThreads` (array): Communication threads
  - All other fields from request body
- `message` (string): Success message

## Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Error Response Format

```json
{
    "error": {
        "message": "Error description",
        "code": "ERROR_CODE",
        "details": {}
    }
}
```

## Data Types

### Question Types
- `select`: Dropdown selection with predefined options
- `textarea`: Multi-line text input
- `number`: Numeric input with optional min/max values
- `date`: Date picker
- `radio`: Single selection from options

### RFP Status Types
- `DRAFT`: Initial state, can be edited
- `PENDING_APPROVAL`: Submitted for approval
- `ACTIVE`: Approved and open for vendor responses
- `CLOSED`: No longer accepting responses

### Urgency Levels
- `Low`: Non-urgent request
- `Medium`: Standard priority
- `High`: Urgent requirement

## Authentication

Authentication details would depend on your implementation. Common approaches include:
- Bearer token authentication
- API key authentication
- Session-based authentication

## Rate Limiting

API rate limiting information would be specified here based on your implementation.

## Examples

### Creating a Simple RFP

```javascript
const rfpData = {
    title: "Office Supplies Request",
    description: "Monthly office supplies procurement",
    lineItems: [{
        productName: "Office Chair",
        description: "Ergonomic office chair",
        specifications: { type: "Mesh back", adjustment: "Height adjustable" },
        quantity: 10,
        estimatedUnitPrice: 15000,
        urgency: "Medium"
    }],
    deliveryLocation: "Office Address",
    deliveryStates: ["Delhi"],
    deliveryDate: "2025-10-15",
    estimatedBudget: 150000,
    currency: "INR",
    createdBy: "user-id",
    organizationId: "org-id",
    quotationCutoffDate: "2025-10-01",
    questionTemplateId: "template-id",
    questionAnswers: {
        request_reason: "Additional Equipment",
        business_justification: "Office expansion requires additional furniture"
    }
};

fetch('/api/rfp', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(rfpData)
})
.then(response => response.json())
.then(data => console.log('RFP created:', data));
```