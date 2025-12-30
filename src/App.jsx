import { useState } from "react";
import { fetchAllPatients, submitResults } from "./api";
import { getBpScore, getTempScore, getAgeScore } from "./risk";

export default function App() {
  const [status, setStatus] = useState("Idle");
  const [result, setResult] = useState(null);

  async function runAssessment() {
    try {
      setStatus("Fetching patients...");
      const patients = await fetchAllPatients();

      const highRisk = [];
      const fever = [];
      const dataIssues = [];

      patients.forEach(p => {
        const bp = getBpScore(p.blood_pressure);
        const temp = getTempScore(p.temperature);
        const age = getAgeScore(p.age);

        const isEmpty = v =>
          v === null ||
          v === undefined ||
          (typeof v === "string" && v.trim() === "");

        const hasInvalidData =
          isEmpty(p.blood_pressure) ||
          isEmpty(p.temperature) ||
          isEmpty(p.age) ||
          bp.invalid ||
          temp.invalid ||
          age.invalid ||
          !Number.isFinite(Number(p.temperature)) ||
          !Number.isFinite(Number(p.age));

        // 🚨 DATA QUALITY ALWAYS WINS
        if (hasInvalidData) {
          dataIssues.push(p.patient_id);
          return; // stop processing this patient
        }

        const total = bp.score + temp.score + age.score;

        if (total >= 4) {
          highRisk.push(p.patient_id);
        }

        const tempValue = Number(p.temperature);
        if (Number.isFinite(tempValue) && tempValue >= 99.6) {
          fever.push(p.patient_id);
        }
      });

      const payload = {
        high_risk_patients: highRisk.sort(),
        fever_patients: fever.sort(),
        data_quality_issues: dataIssues.sort(),
      };

      setStatus("Submitting results...");
      const res = await submitResults(payload);

      setResult(res);
      setStatus("Done");
    } catch (err) {
      console.error(err);
      setStatus("Error — check console");
    }
  }

 return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f5f7fa",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "8px",
        width: "100%",
        maxWidth: "600px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>DemoMed Risk Assessment</h1>

      <button
        onClick={runAssessment}
        style={{
          padding: "10px 16px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Run Assessment
      </button>

      <p style={{ marginTop: "12px" }}>
        <strong>Status:</strong> {status}
      </p>

      {result && (
        <pre
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#f1f5f9",
            borderRadius: "6px",
            fontSize: "13px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  </div>
);

}
