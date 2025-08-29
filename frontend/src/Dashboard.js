import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import CytoscapeComponent from "react-cytoscapejs";

function useLiveData(url, intervalTime) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${backendUrl}${url}`, {
          signal: abortController.signal,
          timeout: 5000
        });
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted && !axios.isCancel(err)) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, intervalTime);

    return () => {
      isMounted = false;
      abortController.abort();
      clearInterval(interval);
    };
  }, [url, intervalTime]);

  return { data, loading, error };
}

function useLiveCalls() {
  return useLiveData("/calls", 3000);
}

function useQoS() {
  return useLiveData("/qos", 5000);
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <p className="text-red-700 font-medium">Error: {message}</p>
  </div>
);

export default function Dashboard() {
  const { data: callLogs, loading: callsLoading, error: callsError } = useLiveCalls();
  const { data: qosData, loading: qosLoading, error: qosError } = useQoS();

  const graphElements = React.useMemo(() => {
    const nodes = new Map();
    const edges = new Map();

    callLogs.forEach((log, index) => {
      if (log.caller && log.callee) {
        const callerId = `caller-${log.callId || index}`;
        const calleeId = `callee-${log.callId || index}`;
        const edgeId = `edge-${log.callId || index}`;

        nodes.set(callerId, { 
          data: { id: callerId, label: log.caller, type: 'caller' } 
        });
        nodes.set(calleeId, { 
          data: { id: calleeId, label: log.callee, type: 'callee' } 
        });
        edges.set(edgeId, { 
          data: { 
            id: edgeId, 
            source: callerId, 
            target: calleeId, 
            label: `Call ${log.callId || index}` 
          } 
        });
      }
    });

    return [...nodes.values(), ...edges.values()];
  }, [callLogs]);

  if (callsError && qosError) {
    return (
      <div className="p-6">
        <ErrorMessage message="Failed to connect to backend server" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
        🚀 CyberPhantoms - VoIP Monitoring Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Logs */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">📋 Active Calls</h2>
          {callsLoading ? (
            <LoadingSpinner />
          ) : callsError ? (
            <ErrorMessage message={callsError} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-indigo-500 text-white">
                  <tr>
                    <th className="p-3">From</th>
                    <th className="p-3">To</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.slice(0, 5).map((log, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{log.caller}</td>
                      <td className="p-3 font-mono text-xs">{log.callee}</td>
                      <td className={`p-3 font-medium ${log.status === "Active" ? "text-green-600" : "text-red-500"}`}>
                        {log.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* QoS Metrics */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">📊 QoS Metrics</h2>
          {qosLoading ? (
            <LoadingSpinner />
          ) : qosError ? (
            <ErrorMessage message={qosError} />
          ) : qosData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No QoS data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Call Graph */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">🔗 Call Network</h2>
        {graphElements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No call data available for network graph
          </div>
        ) : (
          <CytoscapeComponent
            elements={graphElements}
            style={{ width: "100%", height: "400px", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            layout={{ name: "circle" }}
          />
        )}
      </div>
    </div>
  );
}