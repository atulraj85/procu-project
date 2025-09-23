# API Documentation

## PUT /api/rfp - RFP Management API

### Overview
This API endpoint handles all RFP update operations including general updates, approvals/rejections, and vendor invitations.

### Base URL
```
PUT /api/rfp
```

### Authentication
Required: User must be authenticated and belong to the same organization as the RFP.

### Request Payloads

#### 1. General RFP Update
```json
{
  "id": "rfp-uuid-here",
  "updatedBy": "user-uuid-here",
  "title": "Updated RFP Title",
  "description": "Updated description",
  "lineItems": [
    {
      "productName": "Dell Laptop",
      "quantity": 10,
      "description": "High-performance laptop",
      "specifications": {
        "ram": "16GB",
        "storage": "512GB SSD",
        "processor": "Intel i7"
      },
      "estimatedUnitPrice": 75000,
      "urgency": "High"
    }
  ],
  "deliveryLocation": "Bangalore Office",
  "deliveryStates": ["Karnataka", "Tamil Nadu"],
  "deliveryDate": "2025-12-15",
  "estimatedBudget": 750000,
  "currency": "INR",
  "quotationCutoffDate": "2025-11-30",
  "questionAnswers": {
    "usage_type": "Permanent",
    "request_type": "Laptop",
    "required_date": "2025-12-15",
    "client_related": "Yes",
    "request_reason": "Equipment Replacement",
    "quantity_needed": 10,
    "specific_request": "High-performance laptops for development team",
    "business_justification": "Current laptops are outdated and affecting productivity"
  },
  "selectionCriteria": {
    "technicalWeightage": 70,
    "commercialWeightage": 30,
    "warrantyRequirement": "3 years onsite"
  }
}
```

#### 2. Approve RFP
```json
{
  "id": "rfp-uuid-here",
  "updatedBy": "procurement-lead-uuid",
  "approvalAction": "approve",
  "approvalComments": "Requirements are clear and justified. Approved for vendor selection."
}
```

#### 3. Reject RFP
```json
{
  "id": "rfp-uuid-here",
  "updatedBy": "procurement-lead-uuid", 
  "approvalAction": "reject",
  "rejectionReason": "Budget not justified. Please provide more detailed cost analysis.",
  "approvalComments": "Need more information about business impact"
}
```

#### 4. Send RFP to Selected Vendors
```json
{
  "id": "rfp-uuid-here",
  "updatedBy": "procurement-manager-uuid",
  "sendToVendors": true,
  "selectedVendors": [
    "vendor-uuid-1",
    "vendor-uuid-2", 
    "vendor-uuid-3",
    "vendor-uuid-4"
  ]
}
```

#### 5. Combined Update + Vendor Invitation
```json
{
  "id": "rfp-uuid-here",
  "updatedBy": "procurement-manager-uuid",
  "title": "Final RFP: Development Team Laptops",
  "estimatedBudget": 1500000,
  "selectionCriteria": {
    "evaluationCriteria": "Technical compliance, pricing, service support",
    "technicalWeightage": 60,
    "commercialWeightage": 40
  },
  "sendToVendors": true,
  "selectedVendors": [
    "vendor-dell-uuid",
    "vendor-hp-uuid",
    "vendor-lenovo-uuid"
  ]
}
```

### Response Examples

#### Success Response (Approval)
```json
{
  "data": {
    "id": "rfp-uuid",
    "status": "APPROVED",
    "rfpNumber": "RFP-2025-0003"
  },
  "message": "RFP approved by Procurement Manager and ready for vendor selection",
  "statusProgression": {
    "from": "PENDING_APPROVAL",
    "to": "APPROVED", 
    "approvedBy": "PROCUREMENT_MANAGER"
  }
}
```

#### Success Response (Vendor Invitation)
```json
{
  "data": {
    "id": "rfp-uuid",
    "status": "SENT_TO_VENDORS",
    "invitedVendors": [
      {
        "id": "vendor-uuid-1",
        "companyName": "TechCorp Solutions",
        "email": "contact@techcorp.com"
      }
    ]
  },
  "message": "RFP successfully sent to 3 vendor(s)",
  "summary": {
    "rfpNumber": "RFP-2025-0003",
    "totalVendorsInvited": 3,
    "invitedBy": "John Doe",
    "status": "SENT_TO_VENDORS"
  }
}
```

## GET /api/vendor/search - Vendor Search API

### Overview
AJAX search API for finding vendors by specializations, dealing keywords, and company names with multi-term support.

### Base URL
```
GET /api/vendor/search
```

### Request Parameters

#### Query Parameters
- `q` (required): Search query (minimum 2 characters)
- `limit` (optional): Number of results (default: 10)
- `status` (optional): Vendor status filter (default: "APPROVED")
- `includeInactive` (optional): Include inactive vendors (default: false)

#### Example Requests
```
GET /api/vendor/search?q=laptop
GET /api/vendor/search?q=laptop computer hardware&limit=20
GET /api/vendor/search?q=software,development,mobile&limit=15
```

### Request Payloads

#### GET Request (Single/Multi-term Search)
```
GET /api/vendor/search?q=laptop computer hardware&limit=10&status=APPROVED
```

#### POST Request (Batch Search)
```json
{
  "searchTerms": [
    "laptop",
    "computer hardware", 
    "software development"
  ],
  "status": "APPROVED",
  "limit": 5,
  "matchAll": true
}
```

### Response Examples

#### Success Response (GET)
```json
{
  "results": [
    {
      "id": "ed840521-a678-42c4-aed2-7736c19f191b",
      "vendorName": "Vendor",
      "legalName": "Bizzlisting",
      "location": "Ghaziabad, Uttar Pradesh",
      "phone": "08447119341",
      "email": "vendor@gmail.com",
      "website": "https://www.johndoeenterprises.com",
      "specializations": [
        "Laptop",
        "Desktop",
        "IT"
      ],
      "dealingKeywords": [
        "IT Equipment",
        "Maintenance Services",
        "Networking",
        "Software",
        "Hardware"
      ],
      "status": "APPROVED",
      "relevanceScore": 23
    }
  ],
  "total": 1,
  "limit": 10,
  "hasMore": false
}
```

#### Success Response (POST - Batch Search)
```json
{
  "searchTerms": ["laptop", "software development"],
  "vendors": [
    {
      "id": "vendor-uuid",
      "vendorName": "TechCorp Solutions",
      "location": "Bangalore, Karnataka",
      "specializations": ["Software Development", "IT Equipment"],
      "dealingKeywords": ["laptop", "software", "development"],
      "status": "APPROVED"
    }
  ],
  "matchingStrategy": "ALL_TERMS_REQUIRED"
}
```

### Search Features

#### Multi-term Search Logic
- **AND Logic**: All search terms must match
- **Term Splitting**: Supports space and comma separation
- **Partial Matching**: Searches within keywords and specializations
- **Case Insensitive**: Automatic case handling

#### Search Fields
- Company Name
- Dealing Keywords (exact and partial match)
- Specializations (exact and partial match)
- Description (partial match)

#### Relevance Scoring
- Company name match: +10 points
- Each keyword match: +5 points
- Each specialization match: +3 points
- All terms matched: +20 bonus points

## Error Responses

### RFP API Errors
```json
{
  "message": "RFP ID and updated by user ID are required",
  "status": 400
}
```

### Vendor Search Errors
```json
{
  "error": "Search query must be at least 2 characters long",
  "results": [],
  "total": 0
}
```