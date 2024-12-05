import React, { useState, useEffect } from "react";
import StudentList from "../components/StudentList";

const Dashboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/students");
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/students/${id}`, {
        method: "DELETE",
      });
      setStudents(students.filter((student) => student._id !== id)); // Update state
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  return (
    <div>
      <h1>Student Management System</h1>
      <StudentList students={students} onDelete={handleDelete} />
    </div>
  );
};

export default Dashboard;
