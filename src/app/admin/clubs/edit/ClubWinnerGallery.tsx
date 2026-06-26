'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, GripVertical, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

interface Winner {
  id: string;
  dogName: string;
  awardTitle: string;
  winnerImage: string;
  displayOrder: number;
}

interface SortableWinnerItemProps {
  winner: Winner;
  onEdit: (winner: Winner) => void;
  onDelete: (id: string) => void;
}

function SortableWinnerItem({ winner, onEdit, onDelete }: SortableWinnerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: winner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-card border ${isDragging ? 'border-blue-500 shadow-xl' : 'border-border shadow-sm'} rounded-xl mb-3`}
    >
      <button {...attributes} {...listeners} className="p-2 cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="w-16 h-16 rounded-lg overflow-hidden relative bg-accent flex-shrink-0">
        {winner.winnerImage ? (
          <Image src={winner.winnerImage} alt={winner.dogName} fill className="object-cover" />
        ) : (
          <ImageIcon className="w-6 h-6 m-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-grow">
        <h4 className="font-bold text-foreground text-sm">{winner.dogName}</h4>
        <p className="text-xs text-muted-foreground">{winner.awardTitle}</p>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(winner)}>
          <Edit className="w-4 h-4 text-blue-500" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(winner.id)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

export default function ClubWinnerGallery({ clubId }: { clubId: string }) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWinners();
  }, [clubId]);

  const loadWinners = async () => {
    try {
      const res = await api.get(`/winners?clubId=${clubId}&limit=100`);
      if (res.success) {
        setWinners(res.data.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setWinners((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Save new order immediately
        saveOrder(newArray);
        return newArray;
      });
    }
  };

  const saveOrder = async (orderedItems: Winner[]) => {
    setSaving(true);
    try {
      const updates = orderedItems.map((w, index) => ({ id: w.id, displayOrder: index }));
      await api.post('/winners/bulk-update-order', { updates });
      toast.success('Order saved');
    } catch (e) {
      toast.error('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this winner?')) {
      try {
        await api.delete(`/winners/${id}`);
        setWinners(winners.filter(w => w.id !== id));
        toast.success('Deleted');
      } catch (e) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Featured Winners</h2>
          <p className="text-sm text-muted-foreground">Drag and drop to reorder. These will appear on the homepage slider.</p>
        </div>
        <Button onClick={() => window.open(`/admin/winners/create?clubId=${clubId}`, '_blank')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" /> Add Winner
        </Button>
      </div>

      {winners.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl border-border text-muted-foreground">
          No winners added yet.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={winners} strategy={verticalListSortingStrategy}>
            <div className="max-w-3xl">
              {winners.map(winner => (
                <SortableWinnerItem 
                  key={winner.id} 
                  winner={winner} 
                  onEdit={() => window.open(`/admin/winners/edit/${winner.id}`, '_blank')}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
