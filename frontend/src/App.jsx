import { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    title: "",
    company_profile: "",
    description: "",
    requirements: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const analyzeJob = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("API Error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Fake Job Detection System
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
          />

          <textarea
            name="company_profile"
            placeholder="Company Profile"
            className="w-full p-3 border rounded-lg h-24"
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Job Description"
            className="w-full p-3 border rounded-lg h-32"
            onChange={handleChange}
          />

          <textarea
            name="requirements"
            placeholder="Requirements"
            className="w-full p-3 border rounded-lg h-24"
            onChange={handleChange}
          />

          <button
            onClick={analyzeJob}
            className="w-full bg-black text-white py-3 rounded-lg text-lg"
          >
            {loading ? "Analyzing..." : "Analyze Job"}
          </button>
        </div>

        {result && (
          <div className="mt-8 p-6 rounded-2xl bg-gray-50 shadow-md">

            <h2 className="text-3xl font-bold mb-6">
              Analysis Report
            </h2>

            {/* Status */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-lg text-gray-500">Prediction</p>

                <h3
                  className={`text-3xl font-bold ${result.prediction === "Fake Job"
                      ? "text-red-600"
                      : "text-green-600"
                    }`}
                >
                  {result.prediction}
                </h3>
              </div>

              {/* Fraud Circle */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-[12px] border-gray-200"></div>

                <div
                  className={`absolute inset-0 rounded-full border-[12px] ${result.fraud_probability > 70
                      ? "border-red-500"
                      : result.fraud_probability > 40
                        ? "border-yellow-400"
                        : "border-green-500"
                    }`}
                  style={{
                    clipPath: `inset(${100 - result.fraud_probability
                      }% 0 0 0)`
                  }}
                ></div>

                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  {result.fraud_probability}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">
                  Fraud Risk
                </span>

                <span>
                  {result.fraud_probability}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${result.fraud_probability > 70
                      ? "bg-red-500"
                      : result.fraud_probability > 40
                        ? "bg-yellow-400"
                        : "bg-green-500"
                    }`}
                  style={{
                    width: `${result.fraud_probability}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Risk Level */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">
                Risk Level
              </h3>

              <span
                className={`px-4 py-2 rounded-full text-white font-semibold ${result.fraud_probability > 70
                    ? "bg-red-500"
                    : result.fraud_probability > 40
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
              >
                {result.fraud_probability > 70
                  ? "High Risk"
                  : result.fraud_probability > 40
                    ? "Medium Risk"
                    : "Low Risk"}
              </span>
            </div>

            {/* Suspicious Keywords */}
            {result.suspicious_keywords.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-red-600 mb-3">
                  Suspicious Keywords
                </h3>

                <div className="flex flex-wrap gap-3">
                  {result.suspicious_keywords.map((word, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-medium"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;