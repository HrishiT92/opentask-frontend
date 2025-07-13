import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CommentEditorProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  initialValue = ""
}) => {
  const [content, setContent] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2 text-sm">
        <button
          className={`px-3 py-1 rounded ${!isPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setIsPreview(false)}
        >
          Write
        </button>
        <button
          className={`px-3 py-1 rounded ${isPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setIsPreview(true)}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div className="min-h-[100px] p-3 border rounded-md bg-gray-50">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[100px]"
        />
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Supports Markdown. Use @username to mention someone. Ctrl+Enter to submit.
        </div>
        <Button onClick={handleSubmit} disabled={!content.trim()}>
          Comment
        </Button>
      </div>
    </div>
  );
};
