# RFP API Documentation

## Overview
This document outlines the API endpoints for managing RFP (Request for Proposal) data, including summary views and detailed RFP information.

## Endpoints

### 1. RFP Summary
Retrieve a summary of all RFPs created by a specific user in table format.

**Endpoint:** `GET /api/rfp/summary`

**Parameters:**
- `userId` (required): User identifier

**Example Request:**
```
GET http://localhost:3000/api/rfp/summary?userId=1932cc97-a54b-4e6b-ba92-241722e9dfb9
```

**Response Structure:**
```json
[
    {
        "id": "string",
        "rfpId": "string",
        "requirementType": "string",
        "status": "string",
        "reason": "string",
        "products": [
            {
                "id": "string",
                "description": "string",
                "quantity": "number"
            }
        ],
        "productCount": "number",
        "quotationCount": "number",
        "createdDate": "ISO 8601 date string",
        "deliveryDate": "ISO 8601 date string",
        "createdBy": "string",
        "canAddQuotation": "boolean",
        "canCreatePO": "boolean"
    }
]
```

**Example Response:**
```json
[
    {
        "id": "86edf80e-84ed-4105-8c46-010f0d8488a6",
        "rfpId": "RFP-2025-09-19-0001",
        "requirementType": "Product",
        "status": "SUBMITTED",
        "reason": "ghgjk",
        "products": [
            {
                "id": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
                "description": "Dell Laptop for Development Team",
                "quantity": 5
            },
            {
                "id": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
                "description": "Wireless Mouse",
                "quantity": 5
            }
        ],
        "productCount": 2,
        "quotationCount": 3,
        "createdDate": "2025-09-19T06:18:50.179Z",
        "deliveryDate": "2025-10-15T00:00:00.000Z",
        "createdBy": "USER",
        "canAddQuotation": true,
        "canCreatePO": true
    }
]
```

### 2. Detailed RFP View
Retrieve detailed information for a specific RFP (triggered when clicking on a table row).

**Endpoint:** `GET /api/rfp/{rfpId}`

**Parameters:**
- `rfpId` (required): RFP identifier

**Example Request:**
```
GET http://localhost:3000/api/rfp/86edf80e-84ed-4105-8c46-010f0d8488a6
```

**Response Structure:**
```json
{
    "id": "string",
    "rfpId": "string",
    "requirementType": "string",
    "dateOfOrdering": "ISO 8601 date string",
    "deliveryLocation": "string",
    "deliveryByDate": "ISO 8601 date string",
    "rfpStatus": "string",
    "preferredQuotationId": "string",
    "created_at": "ISO 8601 date string",
    "updated_at": "ISO 8601 date string",
    "approvers": [
        {
            "name": "string",
            "id": "string",
            "email": "string",
            "mobile": "string"
        }
    ],
    "products": [
        {
            "id": "string",
            "quantity": "number",
            "description": "string"
        }
    ],
    "quotations": [
        {
            "id": "string",
            "totalAmount": "number",
            "refNo": "string",
            "totalAmountWithoutGST": "number",
            "created_at": "ISO 8601 date string",
            "updated_at": "ISO 8601 date string",
            "vendor": {
                "id": "string",
                "companyName": "string",
                "email": "string",
                "mobile": "string",
                "address": "string",
                "gstin": "string",
                "pan": "string"
            },
            "products": [
                {
                    "id": "string",
                    "rfpProductId": "string",
                    "quantity": "number",
                    "price": "number",
                    "description": "string",
                    "gst": "number",
                    "type": "string"
                }
            ],
            "supportingDocuments": [
                {
                    "documentName": "string",
                    "location": "string"
                }
            ]
        }
    ],
    "createdBy": {
        "name": "string",
        "email": "string",
        "mobile": "string",
        "role": "string"
    }
}
```

**Example Response:**
```json
{
    "id": "86edf80e-84ed-4105-8c46-010f0d8488a6",
    "rfpId": "RFP-2025-09-19-0001",
    "requirementType": "Product",
    "dateOfOrdering": "2025-09-19T06:18:49.814Z",
    "deliveryLocation": "Bengaluru, Karnataka, India",
    "deliveryByDate": "2025-10-15T00:00:00.000Z",
    "rfpStatus": "SUBMITTED",
    "preferredQuotationId": "c810cfc6-6646-4708-b016-bd7149363f49",
    "created_at": "2025-09-19T06:18:50.179Z",
    "updated_at": "2025-09-19T06:18:49.815Z",
    "approvers": [
        {
            "name": "PR Manager",
            "id": "c209b906-65ec-4bea-8f94-7f9b53711575",
            "email": "prmanager@gmail.com",
            "mobile": "08447119341"
        },
        {
            "name": "Finance Manager",
            "id": "39e8d4a3-d7e6-4180-b5df-b4c0420cc8c7",
            "email": "financemanager@gmail.com",
            "mobile": "08447119341"
        },
        {
            "name": "PR Manager 2",
            "id": "aebb7956-9c1c-49cf-b94f-42e8f3dfade8",
            "email": "prmanager2@gmail.com",
            "mobile": "08447119341"
        }
    ],
    "products": [
        {
            "id": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
            "quantity": 5,
            "description": "Dell Laptop for Development Team"
        },
        {
            "id": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
            "quantity": 5,
            "description": "Wireless Mouse"
        }
    ],
    "quotations": [
        {
            "id": "3942fe38-fca9-4447-98e7-d3b2190a4f26",
            "totalAmount": 4543,
            "refNo": "RFP-2025-09-19-0001",
            "totalAmountWithoutGST": 3850,
            "created_at": "2025-09-19T06:38:59.080Z",
            "updated_at": "2025-09-19T06:38:58.708Z",
            "vendor": {
                "id": "8abb01da-95aa-4947-ba09-4ecddf9f8bc6",
                "companyName": "Acme Industries",
                "email": "prmanager2@gmail.com",
                "mobile": "9797979797",
                "address": "H-no 407 Aadarsh Colony , vijay nagar , Ghaziabad",
                "gstin": "27ABCDE1234F1Z6",
                "pan": "53434343243432"
            },
            "products": [
                {
                    "id": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
                    "rfpProductId": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
                    "quantity": 5,
                    "price": 200,
                    "description": "Dell Laptop for Development Team",
                    "gst": 18,
                    "type": "product"
                },
                {
                    "id": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
                    "rfpProductId": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
                    "quantity": 5,
                    "price": 550,
                    "description": "Wireless Mouse",
                    "gst": 18,
                    "type": "product"
                },
                {
                    "name": "Other Charges (if any)",
                    "price": 100,
                    "gst": 18,
                    "type": "otherCharge"
                }
            ],
            "supportingDocuments": [
                {
                    "documentName": "2025-09-19-.pdf",
                    "location": "https://utfs.io/f/50ClFbAemkZuAi5PEjLkoTmpiar2y7S1bxcFdKzELnXqjAQO"
                }
            ]
        },
        {
            "id": "35d1aeea-c5a8-4f37-9579-bd9b43c33041",
            "totalAmount": 4543,
            "refNo": "RFP-2025-09-19-0001",
            "totalAmountWithoutGST": 3850,
            "created_at": "2025-09-19T06:39:00.883Z",
            "updated_at": "2025-09-19T06:39:00.507Z",
            "vendor": {
                "id": "8abb01da-95aa-4947-ba09-4ecddf9f8bc6",
                "companyName": "Acme Industries",
                "email": "prmanager2@gmail.com",
                "mobile": "9797979797",
                "address": "H-no 407 Aadarsh Colony , vijay nagar , Ghaziabad",
                "gstin": "27ABCDE1234F1Z6",
                "pan": "53434343243432"
            },
            "products": [
                {
                    "id": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
                    "rfpProductId": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
                    "quantity": 5,
                    "price": 200,
                    "description": "Dell Laptop for Development Team",
                    "gst": 18,
                    "type": "product"
                },
                {
                    "id": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
                    "rfpProductId": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
                    "quantity": 5,
                    "price": 550,
                    "description": "Wireless Mouse",
                    "gst": 18,
                    "type": "product"
                },
                {
                    "name": "Other Charges (if any)",
                    "price": 100,
                    "gst": 18,
                    "type": "otherCharge"
                }
            ],
            "supportingDocuments": [
                {
                    "documentName": "2025-09-19-.pdf",
                    "location": "https://utfs.io/f/50ClFbAemkZuGI7j1fw6PTz5qifDZv7I1LtoCHJRwbmecjBp"
                }
            ]
        },
        {
            "id": "c810cfc6-6646-4708-b016-bd7149363f49",
            "totalAmount": 4543,
            "refNo": "RFP-2025-09-19-0001",
            "totalAmountWithoutGST": 3850,
            "created_at": "2025-09-19T06:38:58.204Z",
            "updated_at": "2025-09-19T06:41:38.449Z",
            "vendor": {
                "id": "8abb01da-95aa-4947-ba09-4ecddf9f8bc6",
                "companyName": "Acme Industries",
                "email": "prmanager2@gmail.com",
                "mobile": "9797979797",
                "address": "H-no 407 Aadarsh Colony , vijay nagar , Ghaziabad",
                "gstin": "27ABCDE1234F1Z6",
                "pan": "53434343243432"
            },
            "products": [
                {
                    "id": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
                    "rfpProductId": "bd403f0c-4680-4f1f-ab62-bc681990dc63",
                    "quantity": 5,
                    "price": 200,
                    "description": "Dell Laptop for Development Team",
                    "gst": 18,
                    "type": "product"
                },
                {
                    "id": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
                    "rfpProductId": "e0089ebf-28ae-4e0d-b40b-19ad34c73cad",
                    "quantity": 5,
                    "price": 550,
                    "description": "Wireless Mouse",
                    "gst": 18,
                    "type": "product"
                },
                {
                    "name": "Other Charges (if any)",
                    "price": 100,
                    "gst": 18,
                    "type": "otherCharge"
                }
            ],
            "supportingDocuments": [
                {
                    "documentName": "2025-09-19-.pdf",
                    "location": "https://utfs.io/f/50ClFbAemkZuZKq3lbk0NBkpveQaiZ2rxM4dgonAEbWtRChc"
                }
            ]
        }
    ],
    "createdBy": {
        "name": "USER",
        "email": "user@gmail.com",
        "mobile": "08447119341",
        "role": "USER"
    }
}
```

## Data Models

### RFP Summary Fields
- **id**: Unique RFP identifier
- **rfpId**: Human-readable RFP reference number
- **requirementType**: Type of requirement (e.g., "Product")
- **status**: Current RFP status (e.g., "SUBMITTED")
- **reason**: Reason for the RFP
- **products**: Array of products requested
- **productCount**: Total number of different products
- **quotationCount**: Number of quotations received
- **createdDate**: Date when RFP was created
- **deliveryDate**: Required delivery date
- **createdBy**: User who created the RFP
- **canAddQuotation**: Whether new quotations can be added
- **canCreatePO**: Whether a purchase order can be created

### Detailed RFP Fields
- **Basic Information**: ID, reference number, requirement type, dates, location, status
- **Approvers**: List of people who can approve the RFP
- **Products**: Detailed product information with quantities and descriptions
- **Quotations**: Complete quotation details including:
  - Vendor information (company details, contact info, tax IDs)
  - Product pricing with GST calculations
  - Supporting documents
  - Total amounts with and without GST
- **Created By**: Information about the RFP creator

### Product Types
- **product**: Regular product items
- **otherCharge**: Additional charges or fees

### Status Values
- **SUBMITTED**: RFP has been submitted and is active

## Usage Notes
- All monetary values are in the system's base currency
- GST rates are expressed as percentages
- Supporting documents are stored as URLs to file locations
- The `preferredQuotationId` indicates which quotation has been selected as preferred