import React from "react";
import { Link } from "react-router-dom";

const StudentList = ({ students, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student._id}>
            <td>{student._id}</td>
            <td>{student.name}</td>
            <td>{student.email}</td>
            <td>
              <Link to={`/edit-student/${student._id}`}>Edit</Link>
              &nbsp;|&nbsp;
              <button onClick={() => onDelete(student._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentList;
