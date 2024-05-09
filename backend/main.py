from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from zoneinfo import ZoneInfo

SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://todo_user:12345678@localhost/todos"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

database_time = datetime.utcnow()
utc = ZoneInfo('UTC')
localtz = ZoneInfo('Asia/Hong_Kong')
utctime = database_time.replace(tzinfo=utc)
localtime = utctime.astimezone(localtz)

class TodoDB(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(255), index=True)
    completed = Column(Boolean, default=False)
    time = Column(DateTime, default=localtime)

Base.metadata.create_all(bind=engine)

class Todo(BaseModel):
    id: Optional[int] = None
    text: str
    completed: bool = False
    time: datetime

app = FastAPI()

origins = [
    "http://localhost:5173",
    "localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/todos/", response_model=Todo)
def create_todo(todo: Todo, db: Session = Depends(get_db)):
    db_todo = TodoDB(text=todo.text, completed=todo.completed, time=todo.time)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.get("/todos/", response_model=List[Todo])
def read_todos(db: Session = Depends(get_db)):
    todos = db.query(TodoDB).all()
    return todos

@app.get("/todos/{todo_id}", response_model=Todo)
def read_todo_by_id(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(TodoDB).filter(TodoDB.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.get("/todos/text/{text}", response_model=Todo)
def read_todo_by_text(text: str, db: Session = Depends(get_db)):
    todo = db.query(TodoDB).filter(TodoDB.text == text).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.get("/todos/not_completed/", response_model=List[Todo])
def read_not_completed_todos(db: Session = Depends(get_db)):
    todos = db.query(TodoDB).filter(TodoDB.completed == False).all()
    return todos

@app.get("/todos/completed/", response_model=List[Todo])
def read_completed_todos(db: Session = Depends(get_db)):
    todos = db.query(TodoDB).filter(TodoDB.completed == True).all()
    return todos

@app.put("/todos/{todo_id}/update_text/", response_model=Todo)
def update_todo_text(todo_id: int, text: str, db: Session = Depends(get_db)):
    todo = db.query(TodoDB).filter(TodoDB.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.text = text
    db.commit()
    db.refresh(todo)
    return todo

@app.put("/todos/{todo_id}/update_status/", response_model=Todo)
def update_todo_status(todo_id: int, completed: bool, db: Session = Depends(get_db)):
    todo = db.query(TodoDB).filter(TodoDB.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.completed = completed
    db.commit()
    db.refresh(todo)
    return todo

@app.delete("/todos/{todo_id}")
def delete_todo_by_id(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(TodoDB).filter(TodoDB.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted successfully"}

@app.delete("/todos/text/{text}")
def delete_todo_by_text(text: str, db: Session = Depends(get_db)):
    todos = db.query(TodoDB).filter(TodoDB.text == text).all()
    if not todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    for todo in todos:
        db.delete(todo)
    db.commit()
    return {"message": "Todo(s) deleted successfully"}

@app.delete("/todos/")
def delete_all_todos(db: Session = Depends(get_db)):
    db.query(TodoDB).delete()
    db.commit()
    return {"message": "All todos deleted successfully"}