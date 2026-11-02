
# AI Customer Support & Human Handoff System

An AI-powered customer support platform that helps businesses automate customer interactions, retrieve accurate information from a knowledge base, manage customer orders, and transfer complex issues to human support staff.

The system combines Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), backend APIs, and human-in-the-loop workflows to provide an intelligent and practical customer support experience.

## Project Overview

The AI Customer Support & Human Handoff System is a web-based application designed to improve how businesses communicate with their customers.

Customers can register, place orders, track order status, and interact with an AI-powered support assistant. When an issue requires human intervention, the system can transfer the conversation to support staff through a human handoff workflow.

Staff members can manage customer orders, monitor conversations, respond to support requests, and use a dedicated dashboard.

## Key Features

### Customer Features
- Customer registration and login.
- Place food orders through the web interface.
- View and track order status.
- Access order details and order history.
- Communicate with the AI customer support assistant.

### AI Customer Support
- AI-powered conversational support.
- Natural language understanding and intent detection.
- Context-aware responses using recent conversation history.
- Retrieval-Augmented Generation (RAG).
- Knowledge base search for relevant company information.
- Local LLM integration using Ollama.

### Order Management
- Retrieve customer order information.
- Check order status.
- Handle cancellation requests according to order status and business rules.
- Support refund-related questions and requests.

### Human Handoff
- Transfer unresolved customer issues to human staff.
- Create and manage support handoff requests.
- Allow staff to take over customer conversations.
- Support human-in-the-loop customer service.

### Staff Dashboard
- Staff authentication.
- Customer management.
- Order management.
- Conversation monitoring.
- Human handoff management.
- Order status updates.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| AI Integration | Ollama |
| Language Model | Qwen3 4B |
| Embedding Model | nomic-embed-text |
| Vector Database | ChromaDB |
| RAG | Retrieval-Augmented Generation |
| Authentication | JWT |
| API Testing | Swagger UI |

## System Architecture

The application follows a frontend-backend architecture with AI processing and human support workflows.

```text
                 CUSTOMER
                     |
                     v
             REACT FRONTEND
                     |
                     v
              FASTAPI BACKEND
                     |
          +----------+----------+
          |          |          |
          v          v          v
     AI / INTENT   DATABASE   ORDER SERVICES
     DETECTION   (PostgreSQL)
          |
          v
       AI AGENT
          |
     +----+---------+
     |              |
     v              v
  OLLAMA         RAG SYSTEM
  QWEN3          CHROMADB
     |              |
     +------+-------+
            |
            v
      AI RESPONSE
            |
     +------+--------+
     |               |
     v               v
  CUSTOMER       HUMAN HANDOFF
  RESPONSE            |
                      v
                STAFF DASHBOARD
```

## Project Structure

```text
AI_CUSTOMER_SUPPORT_PROJECT/
│
├── app/
│   ├── main.py
│   ├── agent.py
│   ├── auth.py
│   ├── database.py
│   ├── embedding.py
│   ├── knowledge_loader.py
│   ├── knowledge_search.py
│   ├── llm.py
│   ├── models.py
│   ├── security.py
│   ├── vector_store.py
│   ├── documents/
│   ├── knowledge_base/
│   └── services/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

Install the following software before running the application:

- Python 3.12 or later
- Node.js and npm
- PostgreSQL
- Ollama

The AI models used by this project are:

```bash
ollama pull qwen3:4b
ollama pull nomic-embed-text
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sucad-khalif/ai-customer-support-system.git

cd ai-customer-support-system
```

### 2. Set Up the Python Environment

```bash
python -m venv .venv
```

Activate the environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

Create a PostgreSQL database named:

```text
ai_customer_support
```

### 4. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a template.

Configure the following variables with your own local settings:

```env
JWT_SECRET_KEY=your_secure_jwt_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/ai_customer_support
```

Never commit your actual `.env` file, database passwords, or secret keys to GitHub.

### 5. Start Ollama

Make sure Ollama is installed and running.

Download the required models:

```bash
ollama pull qwen3:4b
ollama pull nomic-embed-text
```

### 6. Run the Backend

From the project root:

```bash
uvicorn app.main:app --reload
```

The backend API will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 7. Run the Frontend

Open another terminal:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open the frontend URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## AI and RAG Workflow

The AI support workflow combines language generation with knowledge retrieval.

1. A customer submits a message through the web interface.
2. The backend processes the request and identifies the customer's intent.
3. Relevant information is retrieved from the knowledge base when needed.
4. Ollama uses the Qwen3 language model to generate a contextual response.
5. Conversation history helps maintain context.
6. If human assistance is required, the system creates a handoff request for staff.

## Security

The project includes:
- JWT-based authentication.
- Password hashing.
- Environment-based configuration for sensitive credentials.
- Separation of customer and staff workflows.

## Project Goals and Learning Outcomes

This project demonstrates practical experience in:

- Full-stack web application development.
- REST API development with FastAPI.
- Relational database integration.
- AI-powered customer support.
- Local Large Language Model integration.
- Retrieval-Augmented Generation.
- Vector database integration.
- Authentication and access control.
- Human-in-the-loop AI workflows.

## Future Improvements

Potential future enhancements include:

- Cloud deployment.
- Centralized frontend API configuration.
- Improved AI response evaluation.
- More advanced analytics.
- Multilingual customer support.
- Additional business integrations.

## Author

**Sucad Khalif**

GitHub: [sucad-khalif](https://github.com/sucad-khalif)

---

*Built as a practical AI and full-stack software development portfolio project.*
