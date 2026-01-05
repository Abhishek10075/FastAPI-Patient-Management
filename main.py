from fastapi import FastAPI, Path, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, computed_field
from typing import Annotated, Literal, Optional
import json
import os

app = FastAPI()

templates = Jinja2Templates(directory="templates") 
app.mount("/static", StaticFiles(directory="static"), name="static")

class Patient(BaseModel):
    id: str
    name: str
    city: str
    age: int = Field(gt=0, lt=120)
    gender: Literal["male", "female", "other"]
    height: float = Field(gt=0)
    weight: float = Field(gt=0)

    @computed_field
    @property
    def bmi(self) -> float:
        # BMI formula: weight(kg) / [height(m)]^2
        # Yahan hum assume kar rahe hain height cm mein hai
        return round(self.weight / ((self.height / 100) ** 2), 2)

    @computed_field
    @property
    def verdict(self) -> str:
        if self.bmi < 18.5: return "Underweight"
        elif self.bmi < 25: return "Normal weight"
        elif self.bmi < 30: return "Overweight"
        return "Obese"

def load_data():
    if not os.path.exists("patient.json"): return {}
    with open("patient.json", "r") as f:
        try: return json.load(f)
        except: return {}

def save_data(data):
    with open("patient.json", "w") as f:
        json.dump(data, f, indent=4)

@app.get("/ui")
def ui_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/view")
def view_all():
    return load_data()

# --- NAYA SEARCH ENDPOINT ---
@app.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    data = load_data()
    if patient_id in data:
        # ID ko dictionary ke andar include karke bhej rahe hain
        p = data[patient_id]
        p["id"] = patient_id
        return p
    raise HTTPException(status_code=404, detail="Patient not found")

@app.post("/create")
def create_patient(patient: Patient):
    data = load_data()
    data[patient.id] = patient.model_dump(exclude={"id"})
    save_data(data)
    return {"message": "Patient created successfully"}

# --- NAYA UPDATE ENDPOINT ---
@app.put("/edit/{patient_id}")
def update_patient(patient_id: str, patient: Patient):
    data = load_data()
    if patient_id not in data:
        raise HTTPException(status_code=404, detail="Patient not found")
    data[patient_id] = patient.model_dump(exclude={"id"})
    save_data(data)
    return {"message": "Patient updated successfully"}

@app.delete("/delete/{patient_id}")
def delete_patient(patient_id: str):
    data = load_data()
    if patient_id in data:
        del data[patient_id]
        save_data(data)
        return {"message": "Deleted"}
    raise HTTPException(status_code=404, detail="Not found")