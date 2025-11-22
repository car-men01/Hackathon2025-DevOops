"""
Simple script to run the FastAPI server.
Usage: python run.py
"""
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting 20 Questions Game API")
    print("=" * 60)
    print("\n📍 Server will be available at:")
    print("   http://localhost:8000")
    print("   http://localhost:8000/docs (API Documentation)")
    print("   http://localhost:8000/health (Health Check)")
    print("\n⌨️  Press CTRL+C to stop the server\n")
    print("=" * 60 + "\n")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

