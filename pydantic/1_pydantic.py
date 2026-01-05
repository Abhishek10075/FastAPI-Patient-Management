from pydantic import BaseModel, EmailStr, AnyUrl, Field
from typing import List, Optional, Annotated


# Contact details model
class ContactDetails(BaseModel):
    email: EmailStr          # Validates email format
    phone: str               # Phone number as string


# Patient model
class Patient(BaseModel):
    # Name with max length validation and documentation metadata
    name: Annotated[
        str,
        Field(
            max_length=50,
            title="Name of the patient",
            description="Give the name of the patient in less than 50 chars",
            examples=["abhishek", "nishad"]
        )
    ]

    email: EmailStr                          # Validated email
    linkedin_profile: Optional[AnyUrl] = None  # Optional validated URL
    age: int                                # Patient age
    weight: float = Field(..., gt=0)        # Weight must be > 0
    married: Optional[bool] = None          # Optional marital status
    allergies: Optional[List[str]] = None   # Optional list of allergies
    contact_details: ContactDetails         # Nested contact model


# Function to insert patient data
def insert_patient_data(patient: Patient):
    print(patient.name)
    print(patient.email)
    print(patient.linkedin_profile)
    print(patient.contact_details.email)
    print(patient.contact_details.phone)
    print("Inserted successfully")


# Patient data dictionary
patient_info = {
    "name": "nitish",
    "email": "abc@gmail.com",
    "linkedin_profile": "https://www.linkedin.com/in/nitish",
    "age": 30,
    "weight": 70.5,
    "married": False,
    "allergies": ["pollen", "nuts"],
    "contact_details": {
        "email": "abc@gmail.com",
        "phone": "1234567890"
    }
}

# Create Patient object (validation happens here)
patient1 = Patient(**patient_info)

# Call function
insert_patient_data(patient1)
