/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User as UserIcon, Trash2 } from 'lucide-react';
import { Comment } from '../types/index.js';

interface CommentsProps {
  projectId: string;
  targetType: 'usecase' | 'crccard';
  targetId: string;
  targetTitle: string;
  currentUserId?: string;
}

/**
 * Component to present and write collaboration comments on a specific target node (Use Cases or CRC Cards).
 */
export default function CommentsView({ projectId, targetType, targetId, targetTitle, currentUserId }: CommentsProps) {
  // lists comments tied to the active requirements component
  const [comments, setComments] = useState<Comment[]>([]);
  // active text in the input draft field
  const [text, setText] = useState('');
  // activity loading and connection warning states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  /**
   * Loads comment thread from the API based on target type and unique identifier
   */
  const fetchComments = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/comments/${targetType}/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        setError('');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to fetch comments');
      }
    } catch {
      setError('Connection failure loading comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetId, targetType]);

  /**
   * Deletes a comment written by the current user
   */
  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setError('');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to delete comment');
      }
    } catch {
      setError('Connection failure deleting comment');
    }
  };

  /**
   * Posts structural comment to database and updates local listing upon success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !token) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          targetType,
          targetId,
          text: text.trim(),
        }),
      });

      if (res.ok) {
        const newComm = await res.json();
        setComments(prev => [...prev, newComm]);
        setText('');
        setError('');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to add comment');
      }
    } catch {
      setError('Network failure sending comment');
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100" id={`comments-${targetType}-${targetId}`}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-indigo-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Collaboration Comments on "{targetTitle}"
        </h4>
        <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-full font-bold">
          {comments.length}
        </span>
      </div>

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded mb-3 border border-rose-100">
          {error}
        </p>
      )}

      {/* List */}
      <div className="space-y-3 max-h-[220px] overflow-y-auto mb-4 pr-1 scrollbar-thin">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No comments yet. Start the collaboration thread with your team!
          </p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-3xs text-xs">
              <div className="flex justify-between items-center mb-1 text-slate-500">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  {c.userAvatarUrl ? (
                    <img 
                      src={c.userAvatarUrl} 
                      alt={c.userName} 
                      referrerPolicy="no-referrer"
                      className="h-4 w-4 rounded-full object-cover border border-ivy-250/55" 
                    />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-ivy-100 text-ivy-700 flex items-center justify-center text-[9px] font-bold uppercase">
                      {c.userName ? c.userName[0] : <UserIcon className="h-2 w-2" />}
                    </div>
                  )}
                  <span>{c.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px]">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {c.userId === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-stone-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed pl-5 whitespace-pre-line">{c.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-1">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Add a comment on this ${targetType === 'usecase' ? 'use case' : 'CRC card'}...`}
          className="w-full text-xs bg-white text-slate-800 pl-3 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="absolute right-1 text-indigo-600 hover:text-indigo-800 p-1.5 rounded disabled:opacity-30 flex items-center justify-center"
          title="Send comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
