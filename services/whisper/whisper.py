# server.py

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware  # Импорт CORSMiddleware
import whisper
import torch

app = FastAPI()

# Настройка CORS
origins = [
    "http://localhost:3000",  # URL вашего фронтенда
    "http://127.0.0.1:3000",  # Альтернативные URL, если используются
    "https://1ef3-57-129-59-152.ngrok-free.app",
    "http://192.168.31.154:3000"  # Добавленный сетевой адрес
    # Добавьте другие источники при необходимости
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Разрешенные источники
    allow_credentials=True,     # Разрешить передачу учетных данных (cookies, авторизационные заголовки и т.д.)
    allow_methods=["*"],         # Разрешенные HTTP-методы (GET, POST и т.д.)
    allow_headers=["*"],         # Разрешенные заголовки
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Инициализация модели Whisper
model = whisper.load_model("base").to(device)

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Сохраните временный файл
    with open("temp.wav", "wb") as buffer:
        buffer.write(await file.read())

    # Транскрипция
    result = model.transcribe("temp.wav")
    return {"text": result["text"]}