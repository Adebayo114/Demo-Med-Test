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
    <div style={{ padding: 24 }}>
      <h1>DemoMed Risk Assessment</h1>
      <button onClick={runAssessment}>Run Assessment</button>
      <p>Status: {status}</p>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
