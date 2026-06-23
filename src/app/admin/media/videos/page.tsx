'use client';

import React, { useState, useEffect } from 'react';
import { Video as VideoIcon } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function VideoManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/media/videos?page=${page}&search=${search}&limit=10`);
      if (Array.isArray(res)) {
        setData(res);
        setTotalPages(1);
        setTotalCount(res.length);
      } else if (res.success || Array.isArray(res.data)) {
        const videos = res.data?.videos || res.data || res;
        setData(videos);
        setTotalPages(res.data?.totalPages || 1);
        setTotalCount(res.data?.totalCount || videos.length || 0);
      } else {
        setData(res);
        setTotalCount(res.length);
      }
    } catch (error) {
      console.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, search]);

  const deleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video? This will also remove it from AWS S3.')) return;
    try {
      await api.delete(`/media/videos/${id}`);
      fetchVideos();
    } catch (error) {
      console.error('Failed to delete video');
      alert('Failed to delete video');
    }
  };

  const columns: ColumnDefinition<any>[] = [
    { 
      header: 'Thumbnail', 
      accessor: (video) => (
        <div className="w-20 h-12 rounded-md overflow-hidden bg-muted relative flex items-center justify-center">
          {video.thumbnailUrl ? (
            <OptimizedImage src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <VideoIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      ) 
    },
    { header: 'Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Duration', accessor: 'duration' },
    { 
      header: 'Featured', 
      accessor: (video) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${video.featured ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
          {video.featured ? 'Yes' : 'No'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      accessor: (video) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => deleteVideo(video.id)}
            className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="Video Management"
        description="Manage videography assets, upload large videos (up to 2GB) to S3 via multipart."
        icon={VideoIcon}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchVideos}
        onPageChange={setPage}
        createLink="/admin/media/videos/create"
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
