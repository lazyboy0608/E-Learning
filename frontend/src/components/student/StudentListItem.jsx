import React from 'react';

const StudentListItem = ({ student }) => {
  const initial = student.name ? student.name.trim().charAt(0) : '?';

  return (
    <tr className="student-table-row">
      <td className="student-table-name">
        <div className="student-table-name-wrap">
          <div className="student-table-avatar">{initial}</div>
          <span>{student.name}</span>
        </div>
      </td>
      <td>{student.email}</td>
      <td>{student.dob}</td>
      <td>{student.school}</td>
      <td>{student.className}</td>
    </tr>
  );
};

export default StudentListItem;
