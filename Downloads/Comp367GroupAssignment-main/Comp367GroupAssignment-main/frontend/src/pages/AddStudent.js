import React from "react";
import { useNavigate } from "react-router-dom";
import StudentForm from "../components/StudentForm";

const AddStudent = () => {
  const navigate = useNavigate();

  const handleAddStudent = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        console.log("Student added successfully");
        navigate("/");
      }
    } catch (err) {
      console.error("Error adding student:", err);
    }
  };

  return (
    <div>
      <h1>Add Student</h1>
      <StudentForm onSubmit={handleAddStudent} />
    </div>
  );
};

export default AddStudent;
