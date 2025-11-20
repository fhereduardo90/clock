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
- **Schema validation**: Zod-based type-safe input validation
- **Security**: Helmet middleware for secure HTTP headers
- **Error handling**: Comprehensive error handling for all API endpoints
- **Environment configuration**: Configurable port and shutdown time via environment variables
- **Auto-shutdown**: Configurable automatic shutdown (default 3 hours)
- **Production-ready**:
  - Full TypeScript strict mode
  - ESLint, Prettier code quality tools
  - Comprehensive test suite (47 tests, 96%+ coverage)
  - HTTP endpoint integration tests
  - Timing logic tests with mocked timers
  - GitHub Actions CI/CD pipeline
  - Pre-commit hooks with Husky
  - Docker support for containerized deployment

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

### Docker

Run the application in a Docker container:

```bash
# Build the Docker image
docker build -t clock-app .

# Run the container
docker run -p 3000:3000 clock-app
```

Or use docker-compose:

```bash
docker-compose up
```

### Environment Variables

Configure the application using environment variables. Create a `.env` file (see `.env.example`):

```bash
# Server Configuration
PORT=3000

# Shutdown time in hours
SHUTDOWN_TIME_HOURS=3
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

### Pre-commit Hooks

The project uses Husky to run linting and tests before each commit, ensuring code quality:

```bash
# Runs automatically on git commit
# - ESLint checks
# - Full test suite
```

## CI/CD

The project includes a GitHub Actions workflow that runs on every push and pull request:

- Code linting
- Full test suite with coverage
- TypeScript build verification
- Coverage report upload (Codecov)

See `.github/workflows/ci.yml` for the full configuration.

## Project Structure

```
clock/
├── src/
│   ├── ClockEngine.ts        # Core clock logic with interval management
│   ├── ConfigManager.ts      # Message configuration management
│   ├── server.ts             # Express API server with Zod validation
│   └── index.ts              # Application entry point
├── tests/
│   ├── ClockEngine.spec.ts   # Timing logic tests with mocked timers
│   ├── ConfigManager.spec.ts # Configuration management tests
│   └── server.spec.ts        # HTTP endpoint integration tests
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD pipeline
├── .husky/
│   └── pre-commit            # Pre-commit hooks
├── dist/                     # Compiled JavaScript output
├── coverage/                 # Test coverage reports
├── Dockerfile                # Docker container configuration
├── docker-compose.yml        # Docker Compose setup
├── .dockerignore             # Docker build exclusions
├── .env.example              # Environment variable template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest testing configuration
├── eslint.config.mjs         # ESLint configuration
├── .prettierrc               # Prettier configuration
└── README.md                 # This file
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
