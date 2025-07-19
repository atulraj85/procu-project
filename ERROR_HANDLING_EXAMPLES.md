# Error Handling Examples

This document provides practical examples of how to use the centralized error handling system in the procurement project.

## API Route Examples

### Basic Error Handling in API Routes

```typescript
// src/app/api/example/route.ts
import { standardized_error_response, database_error_response, success_response } from "@/lib/response";
import { VALIDATION_ERROR_CODES, BUSINESS_ERROR_CODES } from "@/lib/errorCodes";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation error example
    if (!data.email) {
      return standardized_error_response(
        VALIDATION_ERROR_CODES.REQUIRED_FIELD,
        { field: "email" },
        "Email is required"
      );
    }
    
    // Business logic error example
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      return standardized_error_response(
        BUSINESS_ERROR_CODES.VENDOR_ALREADY_EXISTS,
        { email: data.email }
      );
    }
    
    // Success response
    const result = await createUser(data);
    return success_response(result, "User created successfully", 201);
    
  } catch (error: any) {
    // Database error handling
    if (error.code) {
      return database_error_response(error);
    }
    
    // Generic error fallback
    return standardized_error_response(
      "INTERNAL_SERVER_ERROR",
      { originalError: error.message }
    );
  }
}
```

### GET Route with Query Validation

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = searchParams.get("page");
    
    // Validate query parameters
    if (page && isNaN(Number(page))) {
      return standardized_error_response(
        VALIDATION_ERROR_CODES.INVALID_FORMAT,
        { field: "page", value: page },
        "Page must be a valid number"
      );
    }
    
    const results = await fetchData({ page: Number(page) || 1 });
    return success_response(results);
    
  } catch (error) {
    return standardized_error_response("INTERNAL_SERVER_ERROR");
  }
}
```

## Server Action Examples

### Authentication Action

```typescript
// src/actions/auth/registerUser.ts
import { getErrorMessage, AUTH_ERROR_CODES, VALIDATION_ERROR_CODES } from "@/lib/errorCodes";

export async function registerUser(userData: UserData) {
  // Validation
  if (!userData.email) {
    return {
      error: getErrorMessage(VALIDATION_ERROR_CODES.REQUIRED_FIELD),
      errorCode: VALIDATION_ERROR_CODES.REQUIRED_FIELD,
      field: "email"
    };
  }
  
  try {
    const user = await createUser(userData);
    return { success: "User registered successfully", user };
    
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: getErrorMessage("UNIQUE_CONSTRAINT_VIOLATION"),
        errorCode: "UNIQUE_CONSTRAINT_VIOLATION"
      };
    }
    
    return {
      error: getErrorMessage("INTERNAL_SERVER_ERROR"),
      errorCode: "INTERNAL_SERVER_ERROR"
    };
  }
}
```

## Client Component Examples

### Using Error Handling Hook

```typescript
// src/components/UserForm.tsx
import { useErrorHandler, useFormErrors, validators } from "@/lib/errorUtils";

export function UserForm() {
  const { handleError, handleSuccess } = useErrorHandler();
  const { errors, validateField, clearAllErrors } = useFormErrors();
  const [formData, setFormData] = useState({ email: "", name: "" });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    // Validate form
    let isValid = true;
    isValid = validateField("email", formData.email, [
      validators.required(),
      validators.email()
    ]) && isValid;
    
    isValid = validateField("name", formData.name, [
      validators.required(),
      validators.minLength(2)
    ]) && isValid;
    
    if (!isValid) return;
    
    // Submit form
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorCode = errorData.response?.error?.code || "UNKNOWN_ERROR";
        handleError(errorCode, errorData.response?.error?.details);
        return;
      }
      
      handleSuccess("User created successfully!");
      
    } catch (error) {
      handleError("NETWORK_ERROR", error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <span className="text-red-500">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <span className="text-red-500">{errors.name}</span>}
      </div>
      
      <button type="submit">Create User</button>
    </form>
  );
}
```

### Using Enhanced API Service

```typescript
// src/components/UserList.tsx
import { apiCall } from "@/service/apiService";

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    setLoading(true);
    
    const { data, error } = await apiCall<User[]>("/api/users");
    
    if (error) {
      // Error is automatically handled by apiService with toast
      console.error("Failed to load users:", error);
    } else if (data) {
      setUsers(data);
    }
    
    setLoading(false);
  };
  
  const deleteUser = async (userId: string) => {
    const { error } = await apiCall(`/api/users/${userId}`, {
      method: "DELETE"
    });
    
    if (!error) {
      // Success! Reload the list
      loadUsers();
    }
    // Error handling is automatic
  };
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name}
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Error Boundary Example

```typescript
// src/components/ErrorBoundary.tsx
import React from "react";
import { withErrorHandling } from "@/lib/errorUtils";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}

// Wrap a component with error handling
const SafeUserProfile = withErrorHandling(UserProfile, ErrorFallback);

export function App() {
  return (
    <div>
      <SafeUserProfile userId="123" />
    </div>
  );
}
```

## Custom Validators Example

```typescript
// src/lib/customValidators.ts
import { FieldValidator } from "@/lib/errorUtils";

export const customValidators = {
  gstin: (customMessage?: string): FieldValidator => (value) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return {
      isValid: !value || gstRegex.test(value),
      errorCode: "INVALID_GST_FORMAT",
      message: customMessage || "Please enter a valid GST number",
    };
  },
  
  phoneNumber: (customMessage?: string): FieldValidator => (value) => {
    const phoneRegex = /^[+]?[1-9][\d]{9,15}$/;
    return {
      isValid: !value || phoneRegex.test(value.replace(/\s/g, "")),
      errorCode: "INVALID_PHONE_FORMAT",
      message: customMessage || "Please enter a valid phone number",
    };
  },
};

// Usage in form
const { validateField } = useFormErrors();

const isValid = validateField("gstin", formData.gstin, [
  validators.required("GST number is required"),
  customValidators.gstin()
]);
```

## Error Code Mapping Example

```typescript
// Adding new error codes
// src/lib/errorCodes.ts

export const PROCUREMENT_ERROR_CODES = {
  RFP_EXPIRED: "RFP_EXPIRED",
  QUOTATION_DEADLINE_PASSED: "QUOTATION_DEADLINE_PASSED",
  VENDOR_NOT_APPROVED: "VENDOR_NOT_APPROVED",
  INSUFFICIENT_BUDGET: "INSUFFICIENT_BUDGET",
} as const;

export const PROCUREMENT_ERROR_MESSAGES = {
  RFP_EXPIRED: "This RFP has expired and no longer accepts quotations.",
  QUOTATION_DEADLINE_PASSED: "The deadline for submitting quotations has passed.",
  VENDOR_NOT_APPROVED: "Your vendor account is not approved to submit quotations.",
  INSUFFICIENT_BUDGET: "Insufficient budget allocated for this procurement.",
} as const;

// Add to main ERROR_CODES and ERROR_MESSAGES objects
export const ERROR_CODES = {
  ...DATABASE_ERROR_CODES,
  ...AUTH_ERROR_CODES,
  ...API_ERROR_CODES,
  ...VALIDATION_ERROR_CODES,
  ...BUSINESS_ERROR_CODES,
  ...PROCUREMENT_ERROR_CODES, // Add new codes
} as const;

export const ERROR_MESSAGES = {
  // ... existing messages
  ...PROCUREMENT_ERROR_MESSAGES, // Add new messages
} as const;
```

## Testing Error Handling

```typescript
// src/__tests__/errorHandling.test.ts
import { getErrorMessage, mapPrismaErrorCode } from "@/lib/errorCodes";

describe("Error Handling", () => {
  test("should map Prisma error codes correctly", () => {
    expect(mapPrismaErrorCode("P2002")).toBe("UNIQUE_CONSTRAINT_VIOLATION");
    expect(getErrorMessage("UNIQUE_CONSTRAINT_VIOLATION")).toBe(
      "A record with this information already exists."
    );
  });
  
  test("should handle unknown error codes", () => {
    expect(getErrorMessage("UNKNOWN_ERROR")).toBe(
      "An unexpected error occurred. Please try again."
    );
  });
});
```

This examples file shows how to use the centralized error handling system across different parts of the application, making error management consistent and user-friendly.