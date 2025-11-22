# Using Fast Api to create a simple API for Gemini protocol
from fastapi import FastAPI, Request, Response
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/{path:path}", response_class=PlainTextResponse)
async def gemini_endpoint(request: Request, path: str):
    return Response(content="20 Questions Game API is running.", media_type="text/plain")


# use langchain, system prompt, human prompt, an agent and a pydantic for the response


