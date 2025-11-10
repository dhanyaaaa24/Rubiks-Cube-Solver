''' from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import kociemba
import os


app = FastAPI(title="Rubik's Cube Solver API")

#Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Cube model
class CubeRequest(BaseModel):
    cube: str

# Solver endpoint
@app.post("/solve")
async def solve_cube(req: CubeRequest):
    cube_str = req.cube.strip().upper()
    print(f"🧩 Received cube string ({len(cube_str)} chars):", cube_str)    
         # basic sanity checks
    if len(cube_str) != 54:
        return {"error": "Cube string must contain exactly 54 stickers"}
    if not all(c in "URFDLB" for c in cube_str):
        return {"error": "Cube string must contain only U, R, F, D, L, B"}
    try:
        solution = kociemba.solve(cube_str)
        print("✅ Solution:", solution)
        return {"solution": solution}
    except Exception as e:
       print("❌ Error solving cube:", e)
    return {"error": f"Invalid cube configuration: {str(e)}"}

@app.get("/")
async def serve_home():
    return FileResponse(os.path.join("frontend", "index.html"))

#Serve frontend directory
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend") '''

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import kociemba

app = FastAPI(title="Rubik's Cube Solver API")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Cube model
class CubeRequest(BaseModel):
    cube: str

# ✅ Solver endpoint
@app.post("/solve")
async def solve_cube(req: CubeRequest):
    cube_str = req.cube.strip().upper()
    print(f"🧩 Received cube string ({len(cube_str)} chars):", cube_str)

    # Basic sanity checks
    if len(cube_str) != 54:
        return {"error": "Cube string must contain exactly 54 stickers"}
    if not all(c in "URFDLB" for c in cube_str):
        return {"error": "Cube string must contain only U, R, F, D, L, B"}

    try:
        solution = kociemba.solve(cube_str)
        print("✅ Solution found:", solution)
        return {
            "solution": solution,
            "moves": len(solution.split()),
            "message": f"Solved in {len(solution.split())} moves!"
        }
    except Exception as e:
        print("❌ Error solving cube:", e)
        return {"error": f"Invalid cube configuration: {str(e)}"}

# ✅ Serve frontend (must come last)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")