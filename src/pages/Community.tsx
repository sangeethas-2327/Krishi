import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Plus, Send, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  likes_count: number;
  image_url: string | null;
  tags: string[];
  created_at: string;
}

const AVATARS = ['🌸', '🌿', '🌻', '🌼', '🍀', '🌺', '🌱', '🌾', '🍃', '🌳'];
const getAvatar = (userId: string) => AVATARS[userId.charCodeAt(0) % AVATARS.length];

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'Just now';
};

export default function Community() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [likingId, setLikingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    setPosts((data as unknown as CommunityPost[]) || []);
    setLoading(false);
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id);
    if (data) setLikedPosts(new Set(data.map((l: any) => l.post_id)));
  };

  useEffect(() => {
    fetchPosts();
    fetchUserLikes();

    // Realtime subscription
    const channel = supabase
      .channel('community_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => fetchPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const submitPost = async () => {
    if (!user || !newPost.trim()) { toast({ title: "Write something first", variant: "destructive" }); return; }
    setPosting(true);
    const authorName = profile?.name || user.email?.split('@')[0] || 'Gardener';
    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      author_name: authorName,
      content: newPost.trim(),
    });
    if (!error) {
      setNewPost('');
      setShowForm(false);
      toast({ title: "Post shared! 🌿" });
      fetchPosts();
    }
    setPosting(false);
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!user || likingId === post.id) return;
    setLikingId(post.id);
    const isLiked = likedPosts.has(post.id);

    if (isLiked) {
      await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', post.id);
      await supabase.from('community_posts').update({ likes_count: Math.max(0, post.likes_count - 1) }).eq('id', post.id);
      setLikedPosts(prev => { const next = new Set(prev); next.delete(post.id); return next; });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      await supabase.from('post_likes').insert({ user_id: user.id, post_id: post.id });
      await supabase.from('community_posts').update({ likes_count: post.likes_count + 1 }).eq('id', post.id);
      setLikedPosts(prev => new Set([...prev, post.id]));
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
    setLikingId(null);
  };

  const deletePost = async (id: string) => {
    await supabase.from('community_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Community Feed 🌼</h1>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />Post
          </Button>
        </div>
        <p className="text-muted-foreground mb-5">Connect with fellow gardeners · {posts.length} posts</p>

        {showForm && (
          <div className="bg-card rounded-xl p-5 border border-border mb-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{user ? getAvatar(user.id) : '🌱'}</span>
              <Textarea
                placeholder="Share a tip, question, or gardening update..."
                rows={3}
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                className="flex-1"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setNewPost(''); }}>Cancel</Button>
              <Button size="sm" onClick={submitPost} disabled={posting} className="gradient-primary text-primary-foreground">
                <Send className="w-3 h-3 mr-1" />{posting ? 'Posting...' : 'Share'}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-card rounded-xl p-5 border border-border h-28 animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-2">Be the first to post!</h3>
            <p className="text-sm text-muted-foreground mb-4">Share a gardening tip or ask a question to start the conversation</p>
            <Button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground">Share Something</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(p => {
              const isOwn = user?.id === p.user_id;
              const isLiked = likedPosts.has(p.id);
              return (
                <div key={p.id} className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getAvatar(p.user_id)}</span>
                      <div>
                        <div className="font-semibold text-sm">{p.author_name}</div>
                        <div className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</div>
                      </div>
                    </div>
                    {isOwn && (
                      <Button size="sm" variant="ghost" onClick={() => deletePost(p.id)} className="p-1 h-auto">
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm mb-3">{p.content}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <button
                      onClick={() => toggleLike(p)}
                      disabled={!user || likingId === p.id}
                      className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-destructive' : 'hover:text-destructive'}`}
                    >
                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                      {p.likes_count}
                    </button>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />Reply</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
