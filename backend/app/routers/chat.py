import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Conversation, Message, Match, User
from ..schemas import SendMessageRequest

router = APIRouter(prefix="/api/v1/chat", tags=["Chat & Messaging"])

@router.get("/conversations")
def get_conversations(user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Lấy danh sách các cuộc trò chuyện của người dùng hiện tại.
    """
    matches = db.query(Match).filter(
        (Match.user_a_id == user_id) | (Match.user_b_id == user_id)
    ).all()
    match_ids = [m.id for m in matches]

    convs = db.query(Conversation).filter(Conversation.match_id.in_(match_ids)).all()
    results = []

    for c in convs:
        match = db.query(Match).filter(Match.id == c.match_id).first()
        partner_id = match.user_b_id if match.user_a_id == user_id else match.user_a_id
        partner = db.query(User).filter(User.id == partner_id).first()

        results.append({
            "id": c.id,
            "partner_id": partner.id if partner else None,
            "partner_name": partner.full_name if partner else "Bạn ăn",
            "partner_avatar": partner.avatar_url if partner else "",
            "last_message": c.last_message_preview,
            "last_message_time": c.last_message_at.strftime("%H:%M") if c.last_message_at else "14:25",
        })

    return {
        "success": True,
        "data": results
    }

@router.get("/conversations/{conv_id}/messages")
def get_messages(conv_id: str, db: Session = Depends(get_db)):
    """
    Lấy danh sách tin nhắn trong một cuộc hội thoại.
    """
    messages = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.sent_at.asc()).all()
    return {
        "success": True,
        "data": [
            {
                "id": m.id,
                "sender": "me" if m.sender_id == "user-me" else "them",
                "text": m.content,
                "time": m.sent_at.strftime("%H:%M") if m.sent_at else "14:20"
            }
            for m in messages
        ]
    }

@router.post("/messages")
def send_message(req: SendMessageRequest, user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Gửi tin nhắn mới đến cuộc hội thoại.
    """
    conv = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Cuộc hội thoại không tồn tại")

    msg = Message(
        conversation_id=req.conversation_id,
        sender_id=user_id,
        content=req.content,
        sent_at=datetime.datetime.utcnow()
    )
    db.add(msg)

    # Cập nhật preview
    conv.last_message_preview = req.content[:100]
    conv.last_message_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(msg)

    return {
        "success": True,
        "data": {
            "id": msg.id,
            "content": msg.content,
            "time": msg.sent_at.strftime("%H:%M")
        }
    }
