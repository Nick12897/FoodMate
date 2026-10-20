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
    Lấy danh sách các cuộc trò chuyện của người dùng hiện tại kèm theo tin nhắn.
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

        messages = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.sent_at.asc()).all()
        msg_list = [
            {
                "id": m.id,
                "sender": "me" if m.sender_id == user_id else "them",
                "senderId": m.sender_id,
                "text": m.content,
                "time": m.sent_at.strftime("%H:%M") if m.sent_at else "14:20"
            }
            for m in messages
        ]

        favorite_dish = "Món ngon mỗi ngày"
        if partner and partner.taste_profile and partner.taste_profile.favorite_dish:
            favorite_dish = partner.taste_profile.favorite_dish

        results.append({
            "id": c.id,
            "partnerId": partner.id if partner else partner_id,
            "partnerName": partner.full_name if partner else "Bạn ăn",
            "partnerAvatar": partner.avatar_url if partner else "",
            "favoriteDish": favorite_dish,
            "lastMessage": c.last_message_preview,
            "lastMessageTime": c.last_message_at.strftime("%H:%M") if c.last_message_at else "14:25",
            "messages": msg_list,
            "userA": {
                "id": match.user_a_id,
            },
            "userB": {
                "id": match.user_b_id,
            }
        })

    return {
        "success": True,
        "data": results
    }

@router.get("/conversations/{conv_id}/messages")
def get_messages(conv_id: str, user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Lấy danh sách tin nhắn trong một cuộc hội thoại.
    """
    messages = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.sent_at.asc()).all()
    return {
        "success": True,
        "data": [
            {
                "id": m.id,
                "sender": "me" if m.sender_id == user_id else "them",
                "senderId": m.sender_id,
                "text": m.content,
                "time": m.sent_at.strftime("%H:%M") if m.sent_at else "14:20"
            }
            for m in messages
        ]
    }

@router.post("/messages")
def send_message(req: SendMessageRequest, user_id: str = "user-me", db: Session = Depends(get_db)):
    """
    Gửi tin nhắn mới đến cuộc hội thoại và tự động đồng bộ 2 người dùng.
    """
    sender_id = getattr(req, 'sender_id', None) or user_id
    partner_id = getattr(req, 'partner_id', None)

    conv = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()
    if not conv and partner_id:
        match = db.query(Match).filter(
            ((Match.user_a_id == sender_id) & (Match.user_b_id == partner_id)) |
            ((Match.user_a_id == partner_id) & (Match.user_b_id == sender_id))
        ).first()
        if not match:
            match = Match(user_a_id=sender_id, user_b_id=partner_id)
            db.add(match)
            db.commit()
            db.refresh(match)

        conv = Conversation(id=req.conversation_id, match_id=match.id, last_message_preview=req.content[:100])
        db.add(conv)
        db.commit()
        db.refresh(conv)

    if not conv:
        # Kiểm tra nếu match_id trùng
        conv = db.query(Conversation).first()

    if conv:
        msg = Message(
            conversation_id=conv.id,
            sender_id=sender_id,
            content=req.content,
            sent_at=datetime.datetime.utcnow()
        )
        db.add(msg)
        conv.last_message_preview = req.content[:100]
        conv.last_message_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(msg)

        return {
            "success": True,
            "data": {
                "id": msg.id,
                "senderId": msg.sender_id,
                "content": msg.content,
                "time": msg.sent_at.strftime("%H:%M")
            }
        }

    return {"success": False, "message": "Không tìm thấy cuộc hội thoại"}
