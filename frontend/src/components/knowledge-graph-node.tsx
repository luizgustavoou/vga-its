'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckCircle2, Clock, AlertTriangle, CircleDot, Lock } from 'lucide-react';

interface KnowledgeNodeData {
  id: string;
  label: string;
  description: string;
  masteryLevel: number;
  status: string;
  category: string;
  exercisesCount: number;
  correctCount: number;
  isLocked: boolean;
  onNodeClick?: (nodeId: string) => void;
  [key: string]: unknown;
}

function KnowledgeGraphNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as KnowledgeNodeData;
  const { id, label, masteryLevel, status, category, isLocked } = nodeData;

  // Locked nodes override any other status styling
  const getStatusConfig = () => {
    if (isLocked) {
      return {
        bg: 'bg-slate-950/90',
        border: 'border-slate-700',
        glow: 'shadow-slate-900/10',
        icon: <Lock className="w-4 h-4 text-slate-500" />,
        barColor: 'bg-slate-700',
        textColor: 'text-slate-500',
      };
    }

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
          transition-all duration-200 min-w-[220px] max-w-[260px]
          ${isLocked
            ? 'opacity-50 cursor-not-allowed'
            : `cursor-pointer hover:scale-105 hover:shadow-lg ${config.glow}`
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{id}</span>
          </div>
          <span className={`text-xs font-bold ${config.textColor}`}>
            {isLocked ? '🔒' : `${Math.round(masteryLevel)}%`}
          </span>
        </div>

        {/* Label */}
        <p className={`text-sm font-semibold leading-tight mb-2 ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
          {label}
        </p>

        {/* Category badge / locked hint */}
        <span className="text-[10px] text-slate-500">
          {isLocked ? 'Complete os pré-requisitos' : (category === 'matrices' ? '📊 Matrizes' : '📐 Vetores')}
        </span>

        {/* Mastery bar */}
        <div className="h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
            style={{ width: isLocked ? '0%' : `${masteryLevel}%` }}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-primary !w-2 !h-2" />
    </>
  );
}

export const KnowledgeGraphNode = memo(KnowledgeGraphNodeComponent);
