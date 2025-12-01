"""
Documents API Routes - JAVÍTOTT MIME_TYPE
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from datetime import datetime

# ✅ JAVÍTVA: Relative imports
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/documents", tags=["documents"])

DOCUMENTS_DIR = "documents"
os.makedirs(DOCUMENTS_DIR, exist_ok=True)


@router.get("/item/{item_id}")
async def get_item_documents(item_id: int, db: Session = Depends(get_db)):
    """Get all documents for an item"""
    # Check if item exists
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Get documents (if table exists, otherwise return empty)
    try:
        documents = db.query(models.Document).filter(
            models.Document.item_id == item_id
        ).all()
        return documents
    except Exception as e:
        # If documents table doesn't exist yet, return empty list
        print(f"Documents query error: {e}")
        return []


@router.post("/")
async def upload_document(
    item_id: int = Form(...),
    document_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a document for an item"""
    # Check if item exists
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join(DOCUMENTS_DIR, filename)
    
    # Save file
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # ✅ JAVÍTVA: mime_type hozzáadva
    # Create document record (if table exists)
    try:
        document = models.Document(
            item_id=item_id,
            filename=filename,
            original_filename=file.filename,
            document_type=document_type,
            description=description,
            file_size=os.path.getsize(filepath),
            mime_type=file.content_type or "application/octet-stream",  # ✅ EZ HIÁNYZOTT!
            created_at=datetime.now()
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return document
    except Exception as e:
        # If documents table doesn't exist, just return success
        print(f"Document save error: {e}")
        return {
            "id": 0,
            "filename": filename,
            "original_filename": file.filename,
            "message": "File uploaded but not saved to database (documents table may not exist)"
        }


@router.get("/{document_id}/download")
async def download_document(document_id: int, db: Session = Depends(get_db)):
    """Download a document"""
    try:
        document = db.query(models.Document).filter(
            models.Document.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        filepath = os.path.join(DOCUMENTS_DIR, document.filename)
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="File not found")
        
        from fastapi.responses import FileResponse
        return FileResponse(
            filepath,
            filename=document.original_filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document"""
    try:
        document = db.query(models.Document).filter(
            models.Document.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete file
        filepath = os.path.join(DOCUMENTS_DIR, document.filename)
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete record
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
