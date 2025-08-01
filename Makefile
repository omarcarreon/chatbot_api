# Chatbot API Makefile
# Commands: make, make install, make test, make run, make down, make clean

.PHONY: help install test run down clean check-docker check-node check-npm

# Default target - show all commands
help: ## Show all available make commands
	@echo "Chatbot API - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Check if required tools are installed
check-docker: ## Check if Docker is installed and Docker files exist
	@if ! command -v docker >/dev/null 2>&1; then \
		echo "❌ Docker is not installed."; \
		echo "📦 Installation instructions:"; \
		echo "   macOS: brew install docker"; \
		echo "   Ubuntu: sudo apt-get install docker.io"; \
		echo "   Windows: Download from https://docker.com"; \
		exit 1; \
	fi
	@echo "✅ Docker is installed"
	@if [ ! -f Dockerfile ]; then \
		echo "❌ Dockerfile not found."; \
		echo "📦 Please ensure you have cloned the complete repository."; \
		echo "   The Dockerfile should be included in the repository."; \
		echo "   If you're missing files, try: git clone <repository-url>"; \
		exit 1; \
	fi
	@if [ ! -f docker-compose.yml ]; then \
		echo "❌ docker-compose.yml not found."; \
		echo "📦 Please ensure you have cloned the complete repository."; \
		echo "   The docker-compose.yml should be included in the repository."; \
		echo "   If you're missing files, try: git clone <repository-url>"; \
		exit 1; \
	fi
	@echo "✅ Docker files found"

check-node: ## Check if Node.js is installed
	@if ! command -v node >/dev/null 2>&1; then \
		echo "❌ Node.js is not installed."; \
		echo "📦 Installation instructions:"; \
		echo "   macOS: brew install node"; \
		echo "   Ubuntu: sudo apt-get install nodejs npm"; \
		echo "   Windows: Download from https://nodejs.org"; \
		exit 1; \
	fi
	@echo "✅ Node.js is installed"

check-npm: ## Check if npm is installed
	@if ! command -v npm >/dev/null 2>&1; then \
		echo "❌ npm is not installed."; \
		echo "📦 Installation instructions:"; \
		echo "   npm usually comes with Node.js"; \
		echo "   If missing, reinstall Node.js"; \
		exit 1; \
	fi
	@echo "✅ npm is installed"

# Install all requirements (including Docker check)
install: check-docker check-node check-npm ## Install all requirements to run the service
	@echo "📦 Installing dependencies..."
	npm install
	@echo " Creating .env file if it doesn't exist..."
	@if [ ! -f .env ]; then \
		echo "# API Authentication" > .env; \
		echo "API_KEY=api_key_here" >> .env; \
		echo "" >> .env; \
		echo "# Hugging Face API Token" >> .env; \
		echo "HF_API_TOKEN=your_huggingface_token_here" >> .env; \
		echo "" >> .env; \
		echo "# Redis Configuration" >> .env; \
		echo "REDIS_URL=redis://localhost:6379" >> .env; \
		echo "" >> .env; \
		echo "# Server Configuration" >> .env; \
		echo "PORT=3000" >> .env; \
		echo "NODE_ENV=development" >> .env; \
		echo "✅ .env file created. Please update HF_API_TOKEN and API_KEY with the tokens provided by email."; \
	else \
		echo "✅ .env file already exists."; \
	fi
	@echo "✅ Installation complete! Please update .env with the tokens provided by email and run 'make run' to start the service."
	@echo "💡 Note: Redis will be started automatically with 'make run'"

# Run tests
test: ## Run tests
	@echo " Running tests..."
	@if [ -d "src/tests" ] || [ -f "test.js" ] || [ -f "tests.js" ]; then \
		npm test; \
	else \
		echo "⚠️  No tests found. Creating placeholder test..."; \
		mkdir -p src/tests; \
		echo "// Placeholder test file" > src/tests/placeholder.test.js; \
		echo "describe('Chatbot API', () => {" >> src/tests/placeholder.test.js; \
		echo "  it('should have basic functionality', () => {" >> src/tests/placeholder.test.js; \
		echo "    expect(true).toBe(true);" >> src/tests/placeholder.test.js; \
		echo "  });" >> src/tests/placeholder.test.js; \
		echo "});" >> src/tests/placeholder.test.js; \
		echo "✅ Placeholder test created. Add your tests to src/tests/"; \
	fi

# Run the service and all related services in Docker
run: check-docker ## Run the service and all related services in Docker
	@echo "🚀 Starting services with Docker Compose..."
	docker-compose up --build -d
	@echo "✅ Services started! Running in background..."
	@echo "🌐 API available at: http://localhost:3000"
	@echo "📚 API Documentation: http://localhost:3000/docs"
	@echo "🔐 API requires authentication. Use x-api-key header."
	@echo " Test with: curl -X POST http://localhost:3000/api/debate \\"
	@echo "  -H 'Content-Type: application/json' \\"
	@echo "  -H 'x-api-key: api_key_here' \\"
	@echo "  -d '{\"message\": \"Debate: The Earth is flat. Take side: You agree\"}'"

# Teardown of all running services
down: ## Teardown of all running services
	@echo "🛑 Stopping all services..."
	@if [ -f docker-compose.yml ]; then \
		docker-compose down; \
		echo "✅ Services stopped."; \
	else \
		echo "⚠️  No docker-compose.yml found. No services to stop."; \
	fi

# Teardown and removal of all containers
clean: down ## Teardown and removal of all containers
	@echo "🧹 Cleaning up containers and images..."
	@if [ -f docker-compose.yml ]; then \
		docker-compose down --rmi all --volumes --remove-orphans; \
		echo "✅ Containers, images, and volumes removed."; \
	else \
		echo "⚠️  No docker-compose.yml found. No cleanup needed."; \
	fi
	@echo "🧹 Cleaning node_modules..."
	@if [ -d node_modules ]; then \
		rm -rf node_modules; \
		echo "✅ node_modules removed."; \
	fi
	@echo "✅ Cleanup complete!"
