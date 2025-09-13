# SkillLink Platform Makefile

.PHONY: help install dev build test lint clean deploy

# Default target
help:
	@echo "SkillLink Platform Commands:"
	@echo "  install    Install dependencies"
	@echo "  dev        Start development environment"
	@echo "  build      Build application"
	@echo "  test       Run tests"
	@echo "  lint       Run linting"
	@echo "  clean      Clean build artifacts"
	@echo "  deploy     Deploy to production"

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd backend && npm install

# Start development environment
dev:
	@echo "Starting development environment..."
	docker-compose up -d postgres redis
	cd backend && npm run start:dev

# Build application
build:
	@echo "Building application..."
	cd backend && npm run build

# Run tests
test:
	@echo "Running tests..."
	cd backend && npm test

# Run linting
lint:
	@echo "Running linting..."
	cd backend && npm run lint

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	cd backend && npm run clean
	docker-compose down -v

# Deploy to production
deploy:
	@echo "Deploying to production..."
	docker-compose up -d --build
