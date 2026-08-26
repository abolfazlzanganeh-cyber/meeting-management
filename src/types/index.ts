// src/types/index.ts
export interface Comment {
  id: string;
  resolutionId: string;
  userId: string;
  text: string;
  createdAt: string;
  mentions: string[]; // کاربرانی که منشن شده‌اند
}

// src/pages/ResolutionDetail.tsx
export function ResolutionDetail() {
  const { resolutions, comments, addComment } = useApp();
  const [newComment, setNewComment] = useState('');
  
  const handleAddComment = () => {
    const mentions = extractMentions(newComment); // @username
    addComment({
      resolutionId: resolution.id,
      userId: currentUser.id,
      text: newComment,
      mentions,
    });
    setNewComment('');
    
    // ارسال اعلان به منشن‌شدگان
    mentions.forEach(userId => {
      addNotification({
        userId,
        title: 'منشن در مصوبه',
        message: `${currentUser.firstName} شما را در مصوبه منشن کرد`,
        link: `/resolutions/detail/${resolution.id}`,
      });
    });
  };
  
  return (
    <div>
      {/* جزئیات مصوبه */}
      <Card>
        <CardTitle>نظرات ({comments.length})</CardTitle>
        {comments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="نظر خود را بنویسید... (برای منشن از @username استفاده کنید)"
        />
        <Button onClick={handleAddComment}>ارسال نظر</Button>
      </Card>
    </div>
  );
}