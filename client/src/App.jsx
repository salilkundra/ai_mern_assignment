import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';

import API from './api/api';
import InputNode from './components/InputNode';
import ResultNode from './components/ResultNode';
import History from './pages/History';

const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
};

// --- FLOW DASHBOARD COMPONENT ---
const FlowDashboard = ({ 
  nodes, edges, onNodesChange, onEdgesChange, onConnect, 
  handleRun, handleSave, loading 
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f4f7f9' }}>
      <div className="controls-overlay">
        <button className="btn-run" onClick={handleRun} disabled={loading}>
          {loading ? 'Waking up AI...' : '▶ Run Flow'}
        </button>
        <button className="btn-save" onClick={handleSave}>
          💾 Save to DB
        </button>
        <button className="btn-history" onClick={() => navigate('/history')} style={{backgroundColor: '#6b6375', color: 'white'}}>
          📜 View History
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#aaa" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    { 
      id: 'node-1', 
      type: 'inputNode', 
      position: { x: 100, y: 150 }, 
      data: { setPrompt: (val) => setPrompt(val) } 
    },
    { 
      id: 'node-2', 
      type: 'resultNode', 
      position: { x: 500, y: 150 }, 
      data: { response: '', loading: false } 
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#007bff', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  // --- REBUILT AI LOGIC WITH RETRY (WAKE-UP) MECHANISM ---
  const handleRun = async () => {
    const isConnected = edges.some(
      (edge) => edge.source === 'node-1' && edge.target === 'node-2'
    );

    if (!isConnected) return alert("🔌 Please connect the nodes with an edge first!");
    if (!prompt) return alert("Please type something first!");
    
    setLoading(true);
    setNodes((nds) => nds.map((n) => n.id === 'node-2' ? { ...n, data: { ...n.data, response: '', loading: true } } : n));

    const maxRetries = 3;
    let attempt = 0;

    const fetchWithRetry = async () => {
      try {
        const res = await API.post('/ask-ai', { prompt });
        const answer = res.data.answer;
        
        setNodes((nds) => nds.map((n) => 
          n.id === 'node-2' ? { ...n, data: { ...n.data, response: answer, loading: false } } : n
        ));
        setLoading(false);
      } catch (err) {
        if (attempt < maxRetries) {
          attempt++;
          console.log(`Connection attempt ${attempt} failed. Retrying...`);
          // Wait 2 seconds before next attempt to let Render spin up
          setTimeout(fetchWithRetry, 2000); 
        } else {
          console.error("AI Connection Error:", err);
          alert("Server is still waking up or unreachable. Please wait 10 seconds and try again.");
          setNodes((nds) => nds.map((n) => 
            n.id === 'node-2' ? { ...n, data: { ...n.data, loading: false } } : n
          ));
          setLoading(false);
        }
      }
    };

    fetchWithRetry();
  };

  const handleSave = async () => {
    const resultNode = nodes.find(n => n.id === 'node-2');
    if (!resultNode.data.response) return alert("Run the flow first to get a response!");

    try {
      await API.post('/save', { prompt, response: resultNode.data.response });
      alert("✅ Saved to MongoDB successfully!");
    } catch (err) {
      alert("Failed to save to database. Check if backend is running.");
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <FlowDashboard 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            handleRun={handleRun}
            handleSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;