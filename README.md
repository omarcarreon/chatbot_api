# Chatbot API

A debate chatbot API built with Node.js, Express, and Redis. The API allows users to start and continue debate conversations using AI-powered responses.

## 🚀 Features

- **Debate Conversations**: Start and continue AI-powered debate conversations
- **Redis Caching**: Persistent conversation storage with automatic cleanup
- **Input Validation**: Specific validation for debate input format
- **API Documentation**: Swagger UI documentation
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Testing**: Test suite with mocking

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Docker** (for containerized deployment)
- **Redis** (automatically handled by Docker)

## ⚙️ Installation

### Option 1: Using Make (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd chatbot_api

# Install all dependencies and setup environment
make install


# Check your email to find the HF_API_TOKEN and API_KEY tokens required for the project
# Update .env with the provided tokens


# Start the service with Docker
make run
```

### Option 2: Manual Installation

```bash
# Clone the repository
git clone <repository-url>
cd chatbot_api

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration and tokens provided by email
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Authentication (Required)
# Provided by email
API_KEY=api_key_here

# Hugging Face API Token (Required)
# Get your token from: https://huggingface.co/settings/tokens
# For Tech Challenge purpose, API Token will be provided by email
HF_API_TOKEN=your_huggingface_token_here

# Redis Configuration (Optional - defaults to localhost)
REDIS_URL=redis://localhost:6379

# Server Configuration (Optional - defaults to 3000)
PORT=3000
NODE_ENV=development
```

### Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_KEY` | API authentication key | ✅ Yes | - |
| `HF_API_TOKEN` | Your Hugging Face API token | ✅ Yes | - |
| `REDIS_URL` | Redis connection URL | ❌ No | `redis://localhost:6379` |
| `PORT` | Server port | ❌ No | `3000` |
| `NODE_ENV` | Environment mode | ❌ No | `development` |

## 🚀 Running the Service

### Quick Start (Recommended)
```bash
# Install and start everything
make install
make run
```

### Service Management
```bash
# Start services with Docker
make run

# Stop services
make down

# Clean up everything
make clean
```

## 📚 API Documentation

Once the service is running, visit the interactive API documentation:

**Swagger UI**: http://localhost:3000/docs

**Note**: The Swagger UI includes an "Authorize" button where you can enter your API key to test endpoints directly in the browser.

## 🔧 API Usage

### Authentication

All API endpoints require authentication using the `x-api-key` header:

```bash
# Include this header with all requests
-H "x-api-key: api_key_here"
```

### Start a New Debate

```bash
curl -X POST http://localhost:3000/api/debate \
  -H "Content-Type: application/json" \
  -H "x-api-key: api_key_here" \
  -d '{
    "message": "Debate: The Earth is flat. Take side: You agree that earth is flat"
  }'
```

### Continue an Existing Debate

```bash
curl -X POST http://localhost:3000/api/debate \
  -H "Content-Type: application/json" \
  -H "x-api-key: api_key_here" \
  -d '{
    "conversation_id": "your-conversation-id",
    "message": "But there is evidence that proves the Earth is round"
  }'
```

### Debate Format

All new conversations must follow this format:
```
Debate: [topic]. Take side: [stance]
```

**Examples:**
- `Debate: Climate change. Take side: You agree that renewable energy is the solution`
- `Debate: Remote work. Take side: You disagree that remote work increases productivity`
- `Debate: Social media. Take side: You agree social media connects people globally`

## 🧪 Testing

```bash
# Run all tests
make test
```

## 📁 Project Structure

```
chatbot_api/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server startup
│   ├── routes.js           # API routes
│   ├── bot.js              # AI integration
│   ├── cache.js            # Redis cache operations
│   ├── swagger.js          # Swagger API documentation
│   ├── middleware/
│   │   └── simpleAuth.js   # API key authentication
│   ├── utils/
│   │   ├── validators.js   # Input validation
│   │   └── constants.js    # Global constants
│   └── tests/
│       ├── routes.test.js  # API endpoint tests
│       └── validators.test.js # Validation tests
├── .env                    # Environment variables (create this)
├── .gitignore             # Git ignore rules
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker services
├── Makefile               # Development commands
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🔍 Available Make Commands

```bash
make help          # Show all available commands
make install       # Install dependencies and setup
make test          # Run tests
make run           # Start services with Docker
make down          # Stop services
make clean         # Clean up containers and images

# Individual checks (used internally by install)
make check-docker  # Check if Docker is installed
make check-node    # Check if Node.js is installed
make check-npm     # Check if npm is installed
```

## 🏗️ Technical Decisions

### Cache Architecture
The application uses two separate Redis cache keys for optimal performance:

- **Topic Cache**: `conversation:topic:{convoId}` - Stores debate topic and stance
- **History Cache**: `conversation:history:{convoId}` - Stores conversation messages

**Benefits:**
- Faster history retrieval (no need to parse topic data every time)
- Easier cleanup and maintenance
- Better memory usage (topic data doesn't grow with conversation)

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Error (401 Unauthorized)**
   - Ensure you're including the `x-api-key` header
   - Check that API_KEY is set in your .env file
   - Verify the API key matches between your request and .env file

2. **Redis Connection Error**
   - Ensure Redis is running: `docker-compose up redis`
   - Check REDIS_URL in .env file

3. **HF_API_TOKEN Error**
   - Get your token from: https://huggingface.co/settings/tokens
   - Add it to your .env file

4. **No credits for Hugging Face**
   - Create a new Hugging Face account or recharge credits
   - Update HF_API_TOKEN variable

5. **Port Already in Use**
   - Change PORT in .env file
   - Or stop other services using port 3000

6. **Docker Issues**
   - Ensure Docker is running
   - Try `docker-compose down` then `docker-compose up --build`

### Getting Help

- Check the logs: `docker-compose logs -f chatbot-api`
- Run tests: `make test`
---