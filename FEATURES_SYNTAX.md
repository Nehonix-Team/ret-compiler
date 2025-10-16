# 🚀 Advanced Features Syntax Guide

## ✅ Implemented Syntax (Your Design!)

### 1. Variables - `declare var`

```rel
# Declare variables with type annotations
declare var maxAge: number = 120
declare var minAge: number = 18
declare var emailPattern: string = r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
declare var defaultStatus: string = "active"

# Access variables with :: syntax
define User {
  age: number & min(::minAge) & max(::maxAge)
  email: string & matches(::emailPattern)
  status: string = ::defaultStatus
}
```

### 2. Type Declarations - `declare type`

```rel
# Declare custom types
declare type OptionalTest = Test | null
declare type Age = number & min(18) & max(120)
declare type Email = string & matches(r"^[a-z0-9]+@")
declare type PositiveInt = number & positive & int
declare type Username = string & minLength(3) & maxLength(20)

# Use in schemas
define User {
  age: Age
  email: Email
  username: Username
  score: PositiveInt
  metadata: OptionalTest
}
```

### 3. Functions - `@fn`

```rel
# Function that returns a type
@fn Ranged(min: number, max: number) -> type {
  return number & min(::min) & max(::max)
}

@fn StringLength(minLen: number, maxLen: number) -> type {
  return string & minLength(::minLen) & maxLength(::maxLen)
}

@fn Optional(baseType: type) -> type {
  return ::baseType | null
}

# Use functions in schemas
define Product {
  price: Ranged(0, 10000)
  name: StringLength(3, 100)
  description: StringLength(10, 500)
  discount: Ranged(0, 100)
  metadata: Optional(string)
}
```

### 4. Loops - `@for`

```rel
# Numeric range loop
define Calendar {
  @for day in 1..31 {
    day::day: date?
  }
}

# Array loop
define WeekSchedule {
  @for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] {
    ::day: {
      startTime: string
      endTime: string
      tasks: string[]
    }
  }
}

# Complex loop with variable interpolation
define DynamicForm {
  @for i in 1..10 {
    field::i: string
    when field::i {
      field::i_valid: boolean
    }
  }
}
```

## 📝 Complete Examples

### Example 1: Reusable Constraints

```rel
# Variables for common constraints
declare var MIN_PASSWORD_LENGTH: number = 8
declare var MAX_PASSWORD_LENGTH: number = 128
declare var MIN_USERNAME_LENGTH: number = 3
declare var MAX_USERNAME_LENGTH: number = 20

# Type aliases for reusability
declare type Password = string & minLength(::MIN_PASSWORD_LENGTH) & maxLength(::MAX_PASSWORD_LENGTH)
declare type Username = string & minLength(::MIN_USERNAME_LENGTH) & maxLength(::MAX_USERNAME_LENGTH)
declare type Email = string & matches(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$")

# Use in schema
define UserCredentials {
  username: Username
  email: Email
  password: Password
}
```

### Example 2: Function-Based Type Generation

```rel
# Reusable function for numeric ranges
@fn NumberRange(min: number, max: number) -> type {
  return number & min(::min) & max(::max)
}

# Reusable function for string constraints
@fn BoundedString(minLen: number, maxLen: number, pattern: string?) -> type {
  when ::pattern {
    return string & minLength(::minLen) & maxLength(::maxLen) & matches(::pattern)
  } else {
    return string & minLength(::minLen) & maxLength(::maxLen)
  }
}

define Product {
  price: NumberRange(0, 999999)
  quantity: NumberRange(0, 10000)
  sku: BoundedString(5, 20, r"^[A-Z0-9-]+$")
  name: BoundedString(3, 100, null)
}
```

### Example 3: Calendar with Loops

```rel
# Generate all days of the month
define MonthCalendar {
  month: string
  year: number & min(2000) & max(2100)
  
  @for day in 1..31 {
    day::day: {
      events: string[]
      isHoliday: boolean
      notes: string?
    }
  }
}

# Generate week schedule
define WeekSchedule {
  @for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] {
    ::day: {
      workHours: number & min(0) & max(24)
      tasks: string[]
      completed: boolean
    }
  }
}
```

### Example 4: Complex Real-World Example

```rel
# Configuration variables
declare var MAX_FILE_SIZE: number = 10485760  # 10MB
declare var ALLOWED_EXTENSIONS: string[] = ["jpg", "png", "pdf", "docx"]
declare var MIN_AGE: number = 18
declare var MAX_AGE: number = 120

# Reusable types
declare type Age = number & min(::MIN_AGE) & max(::MAX_AGE)
declare type Email = string & matches(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$")
declare type PhoneNumber = string & matches(r"^\+?[1-9]\d{1,14}$")

# Reusable functions
@fn FileUpload(maxSize: number, extensions: string[]) -> type {
  return {
    filename: string
    size: number & max(::maxSize)
    extension: string  # Should be one of ::extensions
    uploadedAt: date
  }
}

# Main schema
define UserProfile {
  # Basic info
  id: uuid
  email: Email
  age: Age
  phone: PhoneNumber
  
  # Profile picture
  avatar: FileUpload(::MAX_FILE_SIZE, ::ALLOWED_EXTENSIONS)
  
  # Dynamic fields for preferences
  @for i in 1..5 {
    preference::i: string?
  }
  
  # Timestamps
  createdAt: date
  updatedAt: date
  
  # Conditional fields
  when age >= 18 {
    canVote: boolean
    votingDistrict: string?
  }
}
```

## 🎯 Key Features

### Variable Access: `::`
- `::variableName` - Access variable value
- Works in constraints, default values, and type definitions

### Type Interpolation
- Use `::typeName` to reference declared types
- Use `::paramName` to reference function parameters

### Loop Variable Interpolation
- `::loopVar` - Use loop variable in field names
- `day::day` - Generates day1, day2, day3, etc.
- `::day` - Uses the loop variable value directly

### Function Return Types
- `-> type` - Returns a type definition
- `-> schema` - Returns a complete schema
- `-> field` - Returns a field definition

## 🔥 Benefits

1. **DRY Principle** - Define once, use everywhere
2. **Type Safety** - Catch errors at compile time
3. **Maintainability** - Change in one place
4. **Readability** - Self-documenting code
5. **Flexibility** - Generate dynamic schemas

## 🚀 Next Steps

Implementation status:
- ✅ AST nodes defined
- ✅ Lexer tokens added
- ⏳ Parser implementation (in progress)
- ⏳ Generator implementation (in progress)
- ⏳ Validation and type checking (in progress)
