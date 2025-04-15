from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0" # to remove warning messages

# ✅ Load DeepSeek Coder model
MODEL_NAME = "deepseek-ai/deepseek-coder-1.3b-instruct"  # Ensure correct model version

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, cache_dir="./deepseek_model")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME, 
    #torch_dtype=torch.float16,  # remove comments is you have a gpu
    device_map="cpu",  # change to cuda if you have gpu
    offload_folder="./offload",  
    cache_dir="./deepseek_model"
).eval()

# ✅ Create FastAPI app
app = FastAPI()

# ✅ Fix CORS issues for browser requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

class CodeRequest(BaseModel):
    prompt: str
    max_tokens: int = 1000  # Increased max tokens

@app.post("/generate")
async def generate_code(request: CodeRequest):
    inputs = tokenizer(request.prompt, return_tensors="pt").to("cpu") # change to cuda if you have gpu

    outputs = model.generate(
        **inputs, 
        max_length=request.max_tokens,  
        temperature=0.2,  # Lower temperature for deterministic responses
        do_sample=True,
        pad_token_id=model.config.eos_token_id  # Prevents early stopping
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"response": response}

print("✅ FastAPI Server is ready!")

# Run the FastAPI server:
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
