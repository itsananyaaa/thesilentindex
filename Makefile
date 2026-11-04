.PHONY: setup seed test dev run-backend run-frontend journey clean

setup:
	@echo "Setting up Python virtual environment..."
	python3 -m venv venv
	./venv/bin/pip install -r backend/requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

seed:
	@echo "Initializing database and seeding verified & synthetic datasets..."
	PYTHONPATH=. ./venv/bin/python3 scripts/init_db.py

test:
	@echo "Running backend unit, golden, and integration tests..."
	PYTHONPATH=. ./venv/bin/pytest backend/tests/ -v

run-backend:
	@echo "Starting FastAPI backend on http://127.0.0.1:8000..."
	./venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

run-frontend:
	@echo "Starting Next.js frontend on http://localhost:3000..."
	cd frontend && npm run dev

journey:
	@echo "Running Playwright 15-step end-to-end journey verification..."
	PYTHONPATH=. ./venv/bin/python3 scripts/test_user_journey.py

clean:
	rm -rf silence_index.db frontend/.next

