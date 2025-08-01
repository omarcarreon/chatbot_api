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
# Edit .env with your configuration
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
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

## 🔧 API Usage

### Start a New Debate

```bash
curl -X POST http://localhost:3000/api/debate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Debate: The Earth is flat. Take side: You agree that earth is flat"
  }'
```

### Continue an Existing Debate

```bash
curl -X POST http://localhost:3000/api/debate \
  -H "Content-Type: application/json" \
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
│   ├── utils/
│       ├── validators.js  # Input validation
│   │   └── constants.js   # Global constants
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

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Ensure Redis is running: `docker-compose up redis`
   - Check REDIS_URL in .env file

2. **HF_API_TOKEN Error**
   - Get your token from: https://huggingface.co/settings/tokens
   - Add it to your .env file

3. **No credits for Hugging Face**
   - Create a new Hugging Face account or recharge credits
   - Update HF_API_TOKEN variable

4. **Port Already in Use**
   - Change PORT in .env file
   - Or stop other services using port 3000

5. **Docker Issues**
   - Ensure Docker is running
   - Try `docker-compose down` then `docker-compose up --build`

### Getting Help

- Check the logs: `docker-compose logs -f chatbot-api`
- Run tests: `make test`
---