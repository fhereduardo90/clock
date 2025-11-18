# Clock Application

A TypeScript-based clock application that prints messages at specific time intervals with dynamic configuration capabilities.

## Features

- **Interval-based messaging**:
  - Prints "tick" every second
  - Prints "tock" every minute
  - Prints "bong" every hour

- **Priority system**: Only one message per second (bong > tock > tick)
- **Precise timing**: Single interval approach prevents race conditions
- **Runtime configuration**: Update messages via REST API while the app is running
- **Input validation**: Validates message format and length (max 100 characters)
- **Error handling**: Comprehensive error handling for all API endpoints
- **Auto-shutdown**: Automatically exits after 3 hours
- **Production-ready**: TypeScript, ESLint, Prettier, and Jest testing

## Requirements

- Node.js 22.17.0 (or compatible version)
- npm

## Installation

```bash
npm install
```

## Usage

### Development Mode

Run the application with ts-node:

```bash
npm run dev
```

### Production Mode

Build and run the compiled version:

```bash
npm run build
npm start
```

## API Endpoints

The application runs an Express server on port 3000 with the following endpoints:

### Get Current Configuration

```bash
curl http://localhost:3000/config
```

Response:
```json
{
  "tick": "tick",
  "tock": "tock",
  "bong": "bong"
}
```

### Update Configuration

Update one or more messages while the application is running:

```bash
curl -X PATCH http://localhost:3000/config \
  -H "Content-Type: application/json" \
  -d '{"tick": "quack"}'
```

Success response:
```json
{
  "message": "Configuration updated",
  "config": {
    "tick": "quack",
    "tock": "tock",
    "bong": "bong"
  }
}
```

Validation error response (400):
```json
{
  "error": "Validation failed",
  "errors": [
    "tick must be a non-empty string (max 100 characters)"
  ]
}
```

**Validation rules:**
- Messages must be non-empty strings
- Maximum length: 100 characters
- Must not be only whitespace

### Health Check

```bash
curl http://localhost:3000/health
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Code Quality

### Linting

Check code with ESLint:

```bash
npm run lint
```

### Formatting

Format code with Prettier:

```bash
npm run format
```

## Project Structure

```
clock/
├── src/
│   ├── ClockEngine.ts       # Core clock logic with interval management
│   ├── ConfigManager.ts     # Message configuration management
│   ├── server.ts            # Express API server
│   └── index.ts             # Application entry point
├── tests/
│   ├── ClockEngine.spec.ts
│   ├── ConfigManager.spec.ts
│   └── server.spec.ts
├── package.json
├── tsconfig.json
├── jest.config.js
├── eslint.config.mjs
├── .prettierrc
└── README.md
```

## How It Works

### Timing Architecture

The clock uses a **single interval approach** that checks time every 100ms. This design:
- Prevents race conditions between multiple intervals
- Ensures precise, synchronized timing
- Guarantees only one message prints per second

### Priority System

The clock ensures only one message is printed per second using this priority:

1. **Hour (bong)**: Highest priority - prints on the hour (minute 0, second 0)
2. **Minute (tock)**: Medium priority - prints every minute at second 0 (except on the hour)
3. **Second (tick)**: Lowest priority - prints every second (except when tock or bong would print)

### Example Output

```
tick
tick
tick
...
tock        # At minute boundary (suppresses tick)
tick
tick
...
bong        # At hour boundary (suppresses tick and tock)
tick
tick
```

## Shutdown

The application will automatically shut down after 3 hours. You can also stop it manually with `Ctrl+C`, which triggers a graceful shutdown.
