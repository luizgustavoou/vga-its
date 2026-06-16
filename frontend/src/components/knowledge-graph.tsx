'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { KnowledgeGraphNode } from './knowledge-graph-node';

export interface KnowledgeNodeData {
  id: string;
  label: string;
  description: string;
  order: number;
  category: string;
  prerequisites: string[];
  masteryLevel: number;
  status: string;
  exercisesCount: number;
  correctCount: number;
}

interface KnowledgeGraphProps {
  nodes: KnowledgeNodeData[];
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypes: NodeTypes = {
  knowledgeNode: KnowledgeGraphNode,
};

export function KnowledgeGraph({ nodes: knowledgeNodes, onNodeClick }: KnowledgeGraphProps) {
  // Build React Flow nodes with positioning
  const flowNodes: Node[] = useMemo(() => {
    const COLUMN_GAP = 320;
    const ROW_GAP = 140;

    // Separate nodes by category
    const matrices = knowledgeNodes.filter(n => n.category === 'matrices');
    const vectors = knowledgeNodes.filter(n => n.category === 'vectors');

    const allFlowNodes: Node[] = [];

    // Position matrices in the left column
    matrices.forEach((node, i) => {
      allFlowNodes.push({
        id: node.id,
        type: 'knowledgeNode',
        position: { x: 0, y: i * ROW_GAP },
        data: {
          ...node,
          onNodeClick,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });

    // Position vectors in the right column
    vectors.forEach((node, i) => {
      allFlowNodes.push({
        id: node.id,
        type: 'knowledgeNode',
        position: { x: COLUMN_GAP, y: i * ROW_GAP },
        data: {
          ...node,
          onNodeClick,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });

    return allFlowNodes;
  }, [knowledgeNodes, onNodeClick]);

  // Build edges from prerequisites
  const flowEdges: Edge[] = useMemo(() => {
    return knowledgeNodes.flatMap(node =>
      (node.prerequisites || []).map(prereq => {
        const sourceNode = knowledgeNodes.find(n => n.id === prereq);
        const sourceCategory = sourceNode?.category;
        const targetCategory = node.category;
        const isCrossCategory = sourceCategory !== targetCategory;

        return {
          id: `${prereq}-${node.id}`,
          source: prereq,
          target: node.id,
          type: isCrossCategory ? 'smoothstep' : 'smoothstep',
          animated: node.status === 'in_progress',
          style: {
            stroke: isCrossCategory ? '#7c3aed' : '#6366f1',
            strokeWidth: 2,
            opacity: 0.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isCrossCategory ? '#7c3aed' : '#6366f1',
            width: 15,
            height: 15,
          },
        };
      }),
    );
  }, [knowledgeNodes]);

  const onNodeClickHandler = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) onNodeClick(node.id);
    },
    [onNodeClick],
  );

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-border/30">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClickHandler}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="react-flow-dark"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls
          showInteractive={false}
          className="react-flow-controls"
        />
      </ReactFlow>
    </div>
  );
}
