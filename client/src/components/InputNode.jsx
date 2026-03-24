import { Handle, Position } from 'reactflow';

export default function InputNode({ data }) {
  return (
    <div className="custom-node input-node">
      <div className="node-header">User Input</div>
      <textarea 
        rows="4"
        placeholder="Ask the AI something..." 
        onChange={(e) => data.setPrompt(e.target.value)}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}