'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckCircle2, Clock, AlertTriangle, CircleDot } from 'lucide-react';

interface KnowledgeNodeData {
  id: string;
  label: string;
  description: string;
  masteryLevel: number;
  status: string;
  category: string;
  exercisesCount: number;
  correctCount: number;
  onNodeClick?: (nodeId: string) => void;
  [key: string]: unknown;
}

function KnowledgeGraphNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as KnowledgeNodeData;
  const { id, label, masteryLevel, status, category } = nodeData;

  const getStatusConfig = () => {
    switch (status) {
      case 'mastered':
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500',
          glow: 'shadow-emerald-500/20',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-400',
        };
      case 'in_progress':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500',
          glow: 'shadow-amber-500/20',
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          barColor: 'bg-amber-500',
          textColor: 'text-amber-400',
        };
      case 'struggling':
        return {
          bg: 'bg-red-950/80',
          border: 'border-red-500',
          glow: 'shadow-red-500/20',
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
          barColor: 'bg-red-500',
          textColor: 'text-red-400',
        };
      default:
        return {
          bg: 'bg-slate-900/80',
          border: 'border-slate-600',
          glow: 'shadow-slate-500/10',
          icon: <CircleDot className="w-4 h-4 text-slate-400" />,
          barColor: 'bg-slate-600',
          textColor: 'text-slate-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary !border-primary !w-2 !h-2" />
      <div
        className={`px-4 py-3 rounded-xl border-2 ${config.border} ${config.bg} backdrop-blur-sm 
          cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${config.glow}
          min-w-[220px] max-w-[260px]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{id}</span>
          </div>
          <span className={`text-xs font-bold ${config.textColor}`}>{Math.round(masteryLevel)}%</span>
        </div>

        {/* Label */}
        <p className="text-sm font-semibold text-slate-200 leading-tight mb-2">{label}</p>

        {/* Category badge */}
        <span className="text-[10px] text-slate-400">
          {category === 'matrices' ? '📊 Matrizes' : '📐 Vetores'}
        </span>

        {/* Mastery bar */}
        <div className="h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
            style={{ width: `${masteryLevel}%` }}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-primary !w-2 !h-2" />
    </>
  );
}

export const KnowledgeGraphNode = memo(KnowledgeGraphNodeComponent);
