from fastapi import FastAPI

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stats/financial")
def financial_stats():
    # Mocked data for now, as requested in the plan
    import random
    
    daily_revenue = random.uniform(100, 500)
    monthly_revenue = daily_revenue * 30
    
    return {
        "daily": round(daily_revenue, 2),
        "monthly": round(monthly_revenue, 2),
        "currency": "BRL"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
