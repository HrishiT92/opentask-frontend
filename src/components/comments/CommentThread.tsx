import React, { useState, useEffect } from 'react';
import { commentsApi, Comment, User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Reply, Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CommentThreadProps {
  issueId: string;
  currentUser: User;
}

interface MentionSuggestion {
  id: string;
  name: string;
  email: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ issueId, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  const fetchComments = async () => {
    try {
      const response = await commentsApi.getIssueComments(issueId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await commentsApi.create({
        content: newComment,
        issueId,
        authorId: currentUser.id,
        parentCommentId: replyingTo || undefined
      });
      
      setNewComment('');
      setReplyingTo(null);
      setShowPreview(false);
      fetchComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await commentsApi.update(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsApi.delete(commentId);
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleMentionInput = (text: string) => {
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      setShowMentions(true);
      setMentionSuggestions([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ]);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: MentionSuggestion) => {
    const text = newComment.replace(/@\w*$/, `@${user.name} `);
    setNewComment(text);
    setShowMentions(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Card key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{comment.author.firstName} {comment.author.lastName}</span>
            <span className="text-sm text-gray-500">{formatTimestamp(comment.createdAt)}</span>
          </div>
          {comment.authorId === currentUser.id && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {editingComment === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comment.content}
              </ReactMarkdown>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="mt-2"
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
          </>
        )}

        {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {comments.map(comment => renderComment(comment))}

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {replyingTo && (
              <div className="text-sm text-gray-600">
                Replying to comment...
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            )}

            <div className="flex space-x-2 mb-2">
              <Button
                variant={showPreview ? "outline" : "default"}
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                Write
              </Button>
              <Button
                variant={showPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                Preview
              </Button>
            </div>

            {showPreview ? (
              <div className="border rounded-md p-3 min-h-[100px] prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {newComment || '*Nothing to preview*'}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="relative">
                <Textarea
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    handleMentionInput(e.target.value);
                  }}
                  placeholder="Add a comment... Use @username to mention someone. Markdown is supported."
                  className="min-h-[100px]"
                />
                
                {showMentions && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    {mentionSuggestions.map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => insertMention(user)}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Supports Markdown formatting and @mentions
              </div>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                {replyingTo ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
