from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import kociemba

app = FastAPI()

# ✅ Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ✅ Serve frontend directory
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

# ✅ Cube model
class CubeRequest(BaseModel):
    cube: str

# ✅ Solver endpoint
@app.post("/solve")
async def solve_cube(req: CubeRequest):
    cube_str = req.cube.strip().upper()
    print("🧩 Cube received:", cube_str)
    try:
        solution = kociemba.solve(cube_str)
        print("✅ Solution:", solution)
        return {"solution": solution}
    except Exception as e:
        print("❌ Error solving:", e)
        return {"error": f"Error. Probably cubestring is invalid: {str(e)}"}