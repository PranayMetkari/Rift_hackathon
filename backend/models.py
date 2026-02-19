from pydantic import BaseModel

class ManualInput(BaseModel):
    gene: str
    phenotype: str
    drug: str
