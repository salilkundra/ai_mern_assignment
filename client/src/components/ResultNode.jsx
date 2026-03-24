import { Handle, Position } from 'reactflow';

export default function ResultNode({ data }) {
  return (
    <div className="custom-node result-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">AI Response</div>
      <div className="response-content">
        {data.loading ? (
          <span className="loading-text">AI is thinking...</span>
        ) : (
          data.response || "No data yet. Click 'Run Flow'."
        )}
      </div>
    </div>
  );
}